const crypto = require("node:crypto");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const { pipeline } = require("node:stream/promises");
const { backupError } = require("./backupErrors");

async function hashFile(filePath) {
  const hash = crypto.createHash("sha256");
  await pipeline(fs.createReadStream(filePath), hash);
  return hash.digest("hex");
}

async function createChecksums(entries, outputPath) {
  const lines = [];
  for (const entry of entries) {
    lines.push(`${await hashFile(entry.filePath)}  ${entry.archivePath}`);
  }
  await fsPromises.writeFile(outputPath, `${lines.join("\n")}\n`, { encoding: "utf8", mode: 0o600 });
  return lines;
}

function parseChecksums(content) {
  const checksums = new Map();
  for (const line of String(content).split(/\r?\n/).filter(Boolean)) {
    const match = line.match(/^([0-9a-f]{64})  ([^\0]+)$/i);
    if (!match || checksums.has(match[2])) {
      throw backupError("Fichier checksums.sha256 invalide.", {
        code: "INVALID_CHECKSUM_FILE",
        statusCode: 400,
      });
    }
    checksums.set(match[2], match[1].toLowerCase());
  }
  return checksums;
}

async function verifyChecksums(rootDirectory, checksums, expectedPaths) {
  const actualPaths = [...checksums.keys()].sort();
  const requiredPaths = [...expectedPaths].sort();
  if (JSON.stringify(actualPaths) !== JSON.stringify(requiredPaths)) {
    throw backupError("La liste des checksums ne correspond pas au contenu attendu.", {
      code: "CHECKSUM_ENTRIES_MISMATCH",
      statusCode: 400,
    });
  }

  for (const [archivePath, expectedHash] of checksums) {
    const actualHash = await hashFile(require("node:path").join(rootDirectory, ...archivePath.split("/")));
    if (actualHash !== expectedHash) {
      throw backupError(`Checksum invalide pour ${archivePath}.`, {
        code: "CHECKSUM_MISMATCH",
        statusCode: 400,
      });
    }
  }
}

module.exports = {
  createChecksums,
  hashFile,
  parseChecksums,
  verifyChecksums,
};