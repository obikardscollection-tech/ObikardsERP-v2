const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const path = require("node:path");
const { pipeline } = require("node:stream/promises");
const archiver = require("archiver");
const yauzl = require("yauzl");
const {
  maxArchiveBytes,
  maxCompressionRatio,
  maxEntries,
  maxExtractedBytes,
} = require("../../config/backupConfig");
const { PHOTO_NAME_PATTERN } = require("./photoConsistencyService");
const { backupError } = require("./backupErrors");
const { parseChecksums, verifyChecksums } = require("./checksumService");
const { validateManifest } = require("./manifestService");

const REQUIRED_ROOT_FILES = new Set(["manifest.json", "database.dump", "checksums.sha256"]);

function isAllowedEntryName(name) {
  return REQUIRED_ROOT_FILES.has(name)
    || name === "photos/"
    || (name.startsWith("photos/") && PHOTO_NAME_PATTERN.test(name.slice("photos/".length)));
}

function validateEntry(entry) {
  const name = entry.fileName;
  const segments = name.split("/");
  const mode = (entry.externalFileAttributes >>> 16) & 0xffff;
  const fileType = mode & 0o170000;
  const compressionRatio = entry.compressedSize === 0
    ? (entry.uncompressedSize === 0 ? 1 : Infinity)
    : entry.uncompressedSize / entry.compressedSize;

  if (!name || name.includes("\\") || name.includes("\0") || name.startsWith("/")
    || /^[a-zA-Z]:/.test(name) || segments.includes("..") || segments.includes("") && name !== "photos/") {
    throw backupError("L'archive contient un chemin dangereux.", {
      code: "UNSAFE_ARCHIVE_PATH",
      statusCode: 400,
    });
  }
  if (fileType === 0o120000) {
    throw backupError("Les liens symboliques sont interdits dans une sauvegarde.", {
      code: "ARCHIVE_SYMLINK_FORBIDDEN",
      statusCode: 400,
    });
  }
  if (!isAllowedEntryName(name)) {
    throw backupError(`Entree inattendue dans l'archive: ${name}.`, {
      code: "UNEXPECTED_ARCHIVE_ENTRY",
      statusCode: 400,
    });
  }
  if (compressionRatio > maxCompressionRatio) {
    throw backupError("Ratio de compression de l'archive trop eleve.", {
      code: "ARCHIVE_COMPRESSION_RATIO_EXCEEDED",
      statusCode: 400,
    });
  }
}

function openZip(archivePath) {
  return new Promise((resolve, reject) => {
    yauzl.open(archivePath, { lazyEntries: true, decodeStrings: true, validateEntrySizes: true }, (error, zipFile) => {
      if (error) return reject(backupError("Archive ZIP invalide.", { code: "INVALID_ZIP", statusCode: 400 }));
      return resolve(zipFile);
    });
  });
}

async function inspectArchiveEntries(archivePath) {
  const archiveStats = await fsPromises.stat(archivePath).catch(() => null);
  if (!archiveStats?.isFile() || archiveStats.size > maxArchiveBytes) {
    throw backupError("Archive absente ou trop volumineuse.", {
      code: "INVALID_ARCHIVE_FILE",
      statusCode: 400,
    });
  }

  const zipFile = await openZip(archivePath);
  return new Promise((resolve, reject) => {
    const entries = [];
    let totalBytes = 0;
    const fail = (error) => {
      zipFile.close();
      reject(error);
    };
    zipFile.on("error", () => fail(backupError("Archive ZIP corrompue.", { code: "INVALID_ZIP", statusCode: 400 })));
    zipFile.on("entry", (entry) => {
      try {
        validateEntry(entry);
        if (entries.some((existing) => existing.fileName === entry.fileName)) {
          throw backupError(`Entree ZIP dupliquee: ${entry.fileName}.`, {
            code: "DUPLICATE_ARCHIVE_ENTRY",
            statusCode: 400,
          });
        }
        entries.push(entry);
        totalBytes += entry.uncompressedSize;
        if (entries.length > maxEntries || totalBytes > maxExtractedBytes) {
          throw backupError("Limites de contenu de l'archive depassees.", {
            code: "ARCHIVE_LIMIT_EXCEEDED",
            statusCode: 400,
          });
        }
        zipFile.readEntry();
      } catch (error) {
        fail(error);
      }
    });
    zipFile.on("end", () => {
      const names = new Set(entries.map((entry) => entry.fileName));
      for (const required of REQUIRED_ROOT_FILES) {
        if (!names.has(required)) return fail(backupError(`Entree obligatoire absente: ${required}.`, {
          code: "MISSING_ARCHIVE_ENTRY",
          statusCode: 400,
        }));
      }
      zipFile.close();
      return resolve(entries.map((entry) => ({
        compressedSize: entry.compressedSize,
        fileName: entry.fileName,
        uncompressedSize: entry.uncompressedSize,
      })));
    });
    zipFile.readEntry();
  });
}

async function extractArchive(archivePath, destination) {
  const approvedEntries = await inspectArchiveEntries(archivePath);
  await fsPromises.mkdir(destination, { recursive: true, mode: 0o700 });
  const approvedByName = new Map(approvedEntries.map((entry) => [entry.fileName, entry]));
  const extractedNames = new Set();
  const zipFile = await openZip(archivePath);

  await new Promise((resolve, reject) => {
    const fail = (error) => {
      zipFile.close();
      reject(error);
    };
    zipFile.on("error", fail);
    zipFile.on("entry", (entry) => {
      try {
        validateEntry(entry);
        const approved = approvedByName.get(entry.fileName);
        if (!approved || extractedNames.has(entry.fileName)
          || approved.compressedSize !== entry.compressedSize
          || approved.uncompressedSize !== entry.uncompressedSize) {
          throw backupError("Le contenu ZIP a change pendant la lecture.", {
            code: "ARCHIVE_CHANGED",
            statusCode: 400,
          });
        }
        extractedNames.add(entry.fileName);
      } catch (error) {
        return fail(error);
      }
      if (entry.fileName.endsWith("/")) {
        fsPromises.mkdir(path.join(destination, ...entry.fileName.split("/").filter(Boolean)), { recursive: true })
          .then(() => zipFile.readEntry(), fail);
        return;
      }
      const outputPath = path.join(destination, ...entry.fileName.split("/"));
      fsPromises.mkdir(path.dirname(outputPath), { recursive: true })
        .then(() => new Promise((streamResolve, streamReject) => {
          zipFile.openReadStream(entry, (error, input) => {
            if (error) return streamReject(error);
            return pipeline(input, fs.createWriteStream(outputPath, { flags: "wx", mode: 0o600 }))
              .then(streamResolve, streamReject);
          });
        }))
        .then(() => zipFile.readEntry(), fail);
    });
    zipFile.on("end", () => {
      if (extractedNames.size !== approvedByName.size) {
        return fail(backupError("Le contenu ZIP a change pendant la lecture.", {
          code: "ARCHIVE_CHANGED",
          statusCode: 400,
        }));
      }
      return resolve();
    });
    zipFile.readEntry();
  });

  const manifest = validateManifest(JSON.parse(await fsPromises.readFile(path.join(destination, "manifest.json"), "utf8")));
  const checksums = parseChecksums(await fsPromises.readFile(path.join(destination, "checksums.sha256"), "utf8"));
  const expectedPaths = ["database.dump", ...manifest.photos.map((filename) => `photos/${filename}`)];
  await verifyChecksums(destination, checksums, expectedPaths);
  return { approvedEntries, manifest };
}

async function readArchiveEntry(archivePath, entryName, maxBytes = 1024 * 1024) {
  const approvedEntries = await inspectArchiveEntries(archivePath);
  const approvedByName = new Map(approvedEntries.map((entry) => [entry.fileName, entry]));
  const zipFile = await openZip(archivePath);
  return new Promise((resolve, reject) => {
    const fail = (error) => {
      zipFile.close();
      reject(error);
    };
    zipFile.on("error", fail);
    zipFile.on("entry", (entry) => {
      try {
        validateEntry(entry);
        const approved = approvedByName.get(entry.fileName);
        if (!approved || approved.compressedSize !== entry.compressedSize
          || approved.uncompressedSize !== entry.uncompressedSize) {
          throw backupError("Le contenu ZIP a change pendant la lecture.", {
            code: "ARCHIVE_CHANGED",
            statusCode: 400,
          });
        }
      } catch (error) {
        return fail(error);
      }
      if (entry.fileName !== entryName) {
        zipFile.readEntry();
        return;
      }
      if (entry.uncompressedSize > maxBytes) return fail(backupError("Entree ZIP trop volumineuse.", {
        code: "ARCHIVE_ENTRY_TOO_LARGE",
        statusCode: 400,
      }));
      zipFile.openReadStream(entry, (error, input) => {
        if (error) return fail(error);
        const chunks = [];
        input.on("data", (chunk) => chunks.push(chunk));
        input.on("error", fail);
        input.on("end", () => {
          zipFile.close();
          resolve(Buffer.concat(chunks));
        });
      });
    });
    zipFile.on("end", () => fail(backupError(`Entree ZIP absente: ${entryName}.`, {
      code: "MISSING_ARCHIVE_ENTRY",
      statusCode: 400,
    })));
    zipFile.readEntry();
  });
}

async function createArchive(sourceDirectory, outputPath) {
  await fsPromises.mkdir(path.dirname(outputPath), { recursive: true, mode: 0o700 });
  const output = fs.createWriteStream(outputPath, { flags: "wx", mode: 0o600 });
  const archive = archiver("zip", { zlib: { level: 6 } });
  const completed = new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);
  });
  archive.pipe(output);
  archive.file(path.join(sourceDirectory, "manifest.json"), { name: "manifest.json" });
  archive.file(path.join(sourceDirectory, "database.dump"), { name: "database.dump" });
  archive.file(path.join(sourceDirectory, "checksums.sha256"), { name: "checksums.sha256" });
  archive.directory(path.join(sourceDirectory, "photos"), "photos");
  await archive.finalize();
  await completed;
}

module.exports = {
  createArchive,
  extractArchive,
  inspectArchiveEntries,
  isAllowedEntryName,
  readArchiveEntry,
  validateEntry,
};