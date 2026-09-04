const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const request = require("supertest");

const photoDirectory = path.join(os.tmpdir(), `obikards-s27-${process.pid}-${Date.now()}`);
process.env.INVENTORY_PHOTO_DIR = photoDirectory;
process.env.INVENTORY_PHOTO_MAX_BYTES = "1024";

const prisma = require("../src/lib/prisma");
const { createApp } = require("../src/app");
const { cookieName } = require("../src/config/authConfig");
const { createSession } = require("../src/services/auth/sessionService");
const { uniqueLabel } = require("./erpTestFixtures");

const PNG_ONE_PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);

async function listStoredFiles() {
  try {
    return await fs.readdir(photoDirectory);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

test("Sprint 27 persistent Inventory photos", async (t) => {
  const app = createApp();
  const marker = uniqueLabel("INVENTORY_PHOTOS");
  let inventoryId;
  let userId;

  try {
    const user = await prisma.user.create({
      data: {
        email: `${marker.toLowerCase()}@example.test`,
        passwordHash: "test-only",
        displayName: "Sprint 27 Operator",
        role: "OPERATOR",
      },
    });
    userId = user.id;
    const session = await createSession(user.id);
    const cookie = `${cookieName}=${session.token}`;

    const inventory = await prisma.inventory.create({
      data: {
        sku: `${marker}_SKU`,
        category: "TEST",
        title: `${marker} Card`,
      },
    });
    inventoryId = inventory.id;

    await t.test("anonymous upload and reads are refused", async () => {
      const upload = await request(app)
        .post(`/inventory/${inventoryId}/photos/front`)
        .attach("photo", PNG_ONE_PIXEL, { filename: "front.png", contentType: "image/png" });
      assert.equal(upload.status, 401);

      const read = await request(app).get(`/inventory/${inventoryId}/photos/anything.png`);
      assert.equal(read.status, 401);
    });

    let firstFilename;

    await t.test("authenticated upload persists and is associated with Inventory", async () => {
      const response = await request(app)
        .post(`/inventory/${inventoryId}/photos/front`)
        .set("Cookie", cookie)
        .attach("photo", PNG_ONE_PIXEL, { filename: "../../front.png", contentType: "image/png" });
      assert.equal(response.status, 201);
      firstFilename = response.body.frontPhoto;
      assert.match(firstFilename, /^[0-9a-f-]+\.png$/);
      assert.equal((await prisma.inventory.findUnique({ where: { id: inventoryId } })).frontPhoto, firstFilename);
      assert.deepEqual(await listStoredFiles(), [firstFilename]);
    });

    await t.test("photo is retrievable through a new app instance", async () => {
      const restartedApp = createApp();
      const response = await request(restartedApp)
        .get(`/inventory/${inventoryId}/photos/${firstFilename}`)
        .set("Cookie", cookie);
      assert.equal(response.status, 200);
      assert.equal(response.headers["content-type"], "image/png");
      assert.deepEqual(response.body, PNG_ONE_PIXEL);
    });

    await t.test("replacement removes the previous file", async () => {
      const replacement = Buffer.concat([PNG_ONE_PIXEL, Buffer.from("replacement")]);
      const response = await request(app)
        .post(`/inventory/${inventoryId}/photos/front`)
        .set("Cookie", cookie)
        .attach("photo", replacement, { filename: "replacement.png", contentType: "image/png" });
      assert.equal(response.status, 201);
      assert.notEqual(response.body.frontPhoto, firstFilename);
      assert.deepEqual(await listStoredFiles(), [response.body.frontPhoto]);
      firstFilename = response.body.frontPhoto;
    });

    await t.test("extra photos preserve multiple-photo behavior", async () => {
      const first = await request(app)
        .post(`/inventory/${inventoryId}/photos/extra`)
        .set("Cookie", cookie)
        .attach("photo", PNG_ONE_PIXEL, { filename: "extra-1.png", contentType: "image/png" });
      const second = await request(app)
        .post(`/inventory/${inventoryId}/photos/extra`)
        .set("Cookie", cookie)
        .attach("photo", PNG_ONE_PIXEL, { filename: "extra-2.png", contentType: "image/png" });
      assert.equal(first.status, 201);
      assert.equal(second.status, 201);
      assert.equal(second.body.extraPhotos.length, 2);
    });

    await t.test("invalid and oversized files are refused without orphans", async () => {
      const before = await listStoredFiles();
      const invalid = await request(app)
        .post(`/inventory/${inventoryId}/photos/back`)
        .set("Cookie", cookie)
        .attach("photo", Buffer.from("not an image"), { filename: "fake.png", contentType: "image/png" });
      assert.equal(invalid.status, 400);

      const oversized = await request(app)
        .post(`/inventory/${inventoryId}/photos/back`)
        .set("Cookie", cookie)
        .attach("photo", Buffer.alloc(1025), { filename: "large.png", contentType: "image/png" });
      assert.equal(oversized.status, 400);
      assert.deepEqual(await listStoredFiles(), before);
    });

    await t.test("missing Inventory and traversal attempts create no file", async () => {
      const before = await listStoredFiles();
      const missing = await request(app)
        .post("/inventory/missing/photos/front")
        .set("Cookie", cookie)
        .attach("photo", PNG_ONE_PIXEL, { filename: "missing.png", contentType: "image/png" });
      assert.equal(missing.status, 404);

      const traversal = await request(app)
        .get(`/inventory/${inventoryId}/photos/${encodeURIComponent("../outside.png")}`)
        .set("Cookie", cookie);
      assert.ok([400, 404].includes(traversal.status));
      assert.deepEqual(await listStoredFiles(), before);
    });

    await t.test("deletion clears the association and stored file", async () => {
      const response = await request(app)
        .delete(`/inventory/${inventoryId}/photos/${firstFilename}`)
        .set("Cookie", cookie);
      assert.equal(response.status, 200);
      assert.equal(response.body.frontPhoto, null);
      assert.ok(!(await listStoredFiles()).includes(firstFilename));
      assert.equal((await prisma.inventory.findUnique({ where: { id: inventoryId } })).frontPhoto, null);
    });

    await t.test("deleting Inventory removes every associated photo file", async () => {
      const upload = await request(app)
        .post(`/inventory/${inventoryId}/photos/front`)
        .set("Cookie", cookie)
        .attach("photo", PNG_ONE_PIXEL, { filename: "final-front.png", contentType: "image/png" });
      assert.equal(upload.status, 201);
      assert.ok((await listStoredFiles()).length > 0);

      const response = await request(app)
        .delete(`/inventory/${inventoryId}`)
        .set("Cookie", cookie);
      assert.equal(response.status, 200);
      inventoryId = null;
      assert.deepEqual(await listStoredFiles(), []);
    });
  } finally {
    if (inventoryId) await prisma.inventory.deleteMany({ where: { id: inventoryId } });
    if (userId) {
      await prisma.authSession.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await fs.rm(photoDirectory, { recursive: true, force: true });
    await prisma.$disconnect();
  }
});
