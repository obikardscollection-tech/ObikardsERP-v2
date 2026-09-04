const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { createArchive, extractArchive, validateEntry } = require("../src/services/backup/archiveService");
const { inspectPhotoConsistency } = require("../src/services/backup/photoConsistencyService");

function entry(fileName, overrides = {}) {
  return {
    fileName,
    compressedSize: 10,
    uncompressedSize: 10,
    externalFileAttributes: 0,
    ...overrides,
  };
}

test("unsafe ZIP entries are rejected", () => {
  for (const name of ["../database.dump", "/database.dump", "C:/database.dump", "photos\\file.png", "unexpected.txt"]) {
    assert.throws(() => validateEntry(entry(name)), { statusCode: 400 });
  }
  const filename = `photos/${crypto.randomUUID()}.png`;
  assert.throws(
    () => validateEntry(entry(filename, { externalFileAttributes: 0o120777 << 16 })),
    { code: "ARCHIVE_SYMLINK_FORBIDDEN" }
  );
  assert.throws(
    () => validateEntry(entry(filename, { compressedSize: 1, uncompressedSize: 101 })),
    { code: "ARCHIVE_COMPRESSION_RATIO_EXCEEDED" }
  );
});

test("corrupted ZIP is rejected", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "obikards-corrupt-"));
  try {
    const archivePath = path.join(root, "corrupt.zip");
    await fs.writeFile(archivePath, "not-a-zip");
    await assert.rejects(extractArchive(archivePath, path.join(root, "out")), { code: "INVALID_ZIP" });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("incorrect checksum prevents extraction success", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "obikards-checksum-"));
  const source = path.join(root, "source");
  const filename = `${crypto.randomUUID()}.png`;
  try {
    await fs.mkdir(path.join(source, "photos"), { recursive: true });
    await fs.writeFile(path.join(source, "database.dump"), "PGDMP");
    await fs.writeFile(path.join(source, "photos", filename), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    await fs.writeFile(path.join(source, "manifest.json"), JSON.stringify({
      format: "obikards-backup", formatVersion: 1, id: crypto.randomUUID(), createdAt: new Date().toISOString(),
      dumpBytes: 5, photoBytes: 8, photoCount: 1, photos: [filename],
      postgres: { dumpClientMajor: 16, serverMajor: 16, serverVersion: "16.4" },
    }));
    await fs.writeFile(path.join(source, "checksums.sha256"), `${"0".repeat(64)}  database.dump\n${"0".repeat(64)}  photos/${filename}\n`);
    const archivePath = path.join(root, "bad.zip");
    await createArchive(source, archivePath);
    await assert.rejects(extractArchive(archivePath, path.join(root, "out")), { code: "CHECKSUM_MISMATCH" });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("missing, duplicate, and invalid photo references refuse consistency", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "obikards-photos-"));
  const missing = `${crypto.randomUUID()}.jpg`;
  try {
    await assert.rejects(inspectPhotoConsistency({
      photoDirectory: root,
      inventoryRows: [{ id: "one", frontPhoto: missing, backPhoto: missing, extraPhotos: [] }],
    }), (error) => error.code === "PHOTO_CONSISTENCY_FAILED"
      && error.details.problems.some(({ reason }) => reason === "DUPLICATE_REFERENCE")
      && error.details.problems.some(({ reason }) => reason === "MISSING_FILE"));

    const invalid = `${crypto.randomUUID()}.png`;
    await fs.writeFile(path.join(root, invalid), "not-png");
    await assert.rejects(inspectPhotoConsistency({
      photoDirectory: root,
      inventoryRows: [{ id: "two", frontPhoto: invalid, backPhoto: null, extraPhotos: [] }],
    }), { code: "PHOTO_CONSISTENCY_FAILED" });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});