const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { createArchive, extractArchive } = require("../src/services/backup/archiveService");
const { createChecksums } = require("../src/services/backup/checksumService");

test("backup archive round-trip validates all checksums", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "obikards-archive-test-"));
  const source = path.join(root, "source");
  const extracted = path.join(root, "extracted");
  const archivePath = path.join(root, "backup.zip");
  const filename = `${crypto.randomUUID()}.png`;

  try {
    await fs.mkdir(path.join(source, "photos"), { recursive: true });
    await fs.writeFile(path.join(source, "database.dump"), Buffer.from("PGDMP-test"));
    await fs.writeFile(
      path.join(source, "photos", filename),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3])
    );
    const dumpStats = await fs.stat(path.join(source, "database.dump"));
    const photoStats = await fs.stat(path.join(source, "photos", filename));
    await fs.writeFile(path.join(source, "manifest.json"), JSON.stringify({
      format: "obikards-backup",
      formatVersion: 1,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      dumpBytes: dumpStats.size,
      photoBytes: photoStats.size,
      photoCount: 1,
      photos: [filename],
      postgres: { dumpClientMajor: 16, serverMajor: 16, serverVersion: "16.4" },
    }));
    await createChecksums([
      { archivePath: "database.dump", filePath: path.join(source, "database.dump") },
      { archivePath: `photos/${filename}`, filePath: path.join(source, "photos", filename) },
    ], path.join(source, "checksums.sha256"));

    await createArchive(source, archivePath);
    const result = await extractArchive(archivePath, extracted);

    assert.equal(result.manifest.photoCount, 1);
    assert.deepEqual(await fs.readFile(path.join(extracted, "database.dump")), Buffer.from("PGDMP-test"));
    assert.deepEqual(
      await fs.readFile(path.join(extracted, "photos", filename)),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3])
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});