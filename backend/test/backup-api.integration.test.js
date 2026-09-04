const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const backupDirectory = path.join(os.tmpdir(), `obikards-backup-api-${process.pid}`);
process.env.BACKUP_DIR = backupDirectory;

const assert = require("node:assert/strict");
const { test } = require("node:test");
const request = require("supertest");
const prisma = require("../src/lib/prisma");
const { createApp } = require("../src/app");
const { cookieName } = require("../src/config/authConfig");
const { createSession } = require("../src/services/auth/sessionService");

const app = createApp();

test("Sprint 28 backup API is restricted to administrators", async (t) => {
  const suffix = `${Date.now()}-${process.pid}`;
  const users = await Promise.all(["ADMIN", "OPERATOR"].map((role) => prisma.user.create({
    data: {
      email: `sprint28-${role.toLowerCase()}-${suffix}@example.test`,
      passwordHash: "test-only",
      displayName: `Sprint 28 ${role}`,
      role,
    },
  })));
  const [adminSession, operatorSession] = await Promise.all(users.map((user) => createSession(user.id)));
  const adminCookie = `${cookieName}=${adminSession.token}`;
  const operatorCookie = `${cookieName}=${operatorSession.token}`;
  const missingBackup = "obikards-backup-20260904T000000000Z-00000000-0000-4000-8000-000000000000.zip";

  try {
    await t.test("anonymous access is refused", async () => {
      assert.equal((await request(app).get("/backups")).status, 401);
    });

    await t.test("operator cannot access any backup operation", async () => {
      const checks = [
        request(app).get("/backups"),
        request(app).post("/backups"),
        request(app).get(`/backups/${missingBackup}`),
        request(app).get(`/backups/${missingBackup}/download`),
        request(app).post(`/backups/${missingBackup}/preflight`),
        request(app).post(`/backups/${missingBackup}/restore`).send({ confirmation: `RESTAURER ${missingBackup}` }),
        request(app).delete(`/backups/${missingBackup}`),
      ];
      for (const check of checks) assert.equal((await check.set("Cookie", operatorCookie)).status, 403);
    });

    await t.test("admin can list backups", async () => {
      const response = await request(app).get("/backups").set("Cookie", adminCookie);
      assert.equal(response.status, 200);
      assert.deepEqual(response.body, { backups: [] });
    });

    await t.test("restore requires exact confirmation before preflight", async () => {
      const response = await request(app)
        .post(`/backups/${missingBackup}/restore`)
        .set("Cookie", adminCookie)
        .send({ confirmation: "RESTORE" });
      assert.equal(response.status, 400);
      assert.equal(response.body.code, "RESTORE_CONFIRMATION_REQUIRED");
    });
  } finally {
    await prisma.authSession.deleteMany({ where: { userId: { in: users.map(({ id }) => id) } } });
    await prisma.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } });
    await fs.rm(backupDirectory, { recursive: true, force: true });
    await prisma.$disconnect();
  }
});