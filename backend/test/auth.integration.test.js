const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
process.env.AUTH_LOGIN_MAX_ATTEMPTS = "4";
process.env.FRONTEND_ORIGIN = "http://localhost:5173";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const request = require("supertest");
const prisma = require("../src/lib/prisma");
const { createApp } = require("../src/app");
const { cookieName } = require("../src/config/authConfig");
const { hashPassword } = require("../src/services/auth/passwordService");
const { hashToken } = require("../src/services/auth/sessionService");

const app = createApp();
const suffix = `${Date.now()}-${process.pid}`;
const password = "Sprint22-Password!";
const users = {};

async function createUser(role) {
  return prisma.user.create({
    data: {
      email: `sprint22-${role.toLowerCase()}-${suffix}@example.test`,
      displayName: `Sprint 22 ${role}`,
      passwordHash: await hashPassword(password),
      role,
    },
  });
}

test("Sprint 22 HTTP authentication and authorization", async (t) => {
  users.admin = await createUser("ADMIN");
  users.operator = await createUser("OPERATOR");
  const adminAgent = request.agent(app);
  const operatorAgent = request.agent(app);

  try {
    await t.test("valid logins create secure opaque sessions", async () => {
      const adminLogin = await adminAgent.post("/auth/login").send({ email: users.admin.email, password });
      const operatorLogin = await operatorAgent.post("/auth/login").send({ email: users.operator.email, password });
      assert.equal(adminLogin.status, 200);
      assert.equal(operatorLogin.status, 200);
      assert.match(adminLogin.headers["set-cookie"][0], /HttpOnly/i);
      assert.match(adminLogin.headers["set-cookie"][0], /SameSite=Lax/i);
      assert.equal(adminLogin.body.user.role, "ADMIN");
      assert.equal(operatorLogin.body.user.role, "OPERATOR");
      assert.doesNotMatch(JSON.stringify([adminLogin.body, operatorLogin.body]), /password|hash|token/i);
    });

    await t.test("me returns the current public user", async () => {
      const response = await operatorAgent.get("/auth/me");
      assert.equal(response.status, 200);
      assert.equal(response.body.user.id, users.operator.id);
      assert.doesNotMatch(JSON.stringify(response.body), /password|hash|token/i);
    });

    await t.test("missing and invalid sessions return 401", async () => {
      assert.equal((await request(app).get("/inventory")).status, 401);
      assert.equal((await request(app).get("/auth/me").set("Cookie", `${cookieName}=invalid`)).status, 401);
    });

    await t.test("expired sessions return 401 and are removed", async () => {
      const rawToken = `expired-${suffix}`;
      const expired = await prisma.authSession.create({
        data: { userId: users.operator.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() - 1000) },
      });
      assert.equal((await request(app).get("/auth/me").set("Cookie", `${cookieName}=${rawToken}`)).status, 401);
      assert.equal(await prisma.authSession.count({ where: { id: expired.id } }), 0);
    });

    await t.test("all required business groups reject anonymous access", async () => {
      const checks = [
        ["get", "/inventory"], ["get", "/purchases"], ["get", "/receptions"],
        ["get", "/sales"], ["get", "/expenses"], ["get", "/suppliers"],
        ["get", "/customers"], ["get", "/stock-movements/test"],
        ["post", "/inventory/import/csv/preview"], ["get", "/dashboard"],
        ["get", "/statistics/financial"],
      ];
      for (const [method, route] of checks) {
        assert.equal((await request(app)[method](route)).status, 401, route);
      }
    });

    await t.test("operator can access authenticated ERP reads", async () => {
      const routes = ["/inventory", "/purchases", "/receptions", "/sales", "/expenses", "/suppliers", "/customers", "/dashboard", "/statistics/financial"];
      for (const route of routes) assert.equal((await operatorAgent.get(route)).status, 200, route);
      assert.equal((await operatorAgent.post("/inventory/import/csv/preview")).status, 400);
    });

    await t.test("operator receives 403 on an admin-only import", async () => {
      assert.equal((await operatorAgent.post("/inventory/import/csv")).status, 403);
    });

    await t.test("admin passes authorization on an admin-only import", async () => {
      assert.equal((await adminAgent.post("/inventory/import/csv")).status, 400);
    });

    await t.test("origin policy allows configured origin and rejects another", async () => {
      const allowed = await adminAgent.get("/").set("Origin", "http://localhost:5173");
      const denied = await operatorAgent.post("/auth/logout").set("Origin", "https://attacker.example");
      assert.equal(allowed.headers["access-control-allow-origin"], "http://localhost:5173");
      assert.equal(allowed.headers["access-control-allow-credentials"], "true");
      assert.equal(denied.status, 403);
    });

    await t.test("invalid credentials are rejected generically", async () => {
      const wrong = await request(app).post("/auth/login").send({ email: users.admin.email, password: "Wrong-password!" });
      const missing = await request(app).post("/auth/login").send({ email: `missing-${suffix}@example.test`, password });
      assert.equal(wrong.status, 401);
      assert.equal(missing.status, 401);
      assert.equal(wrong.body.message, missing.body.message);
    });

    await t.test("login rate limiting returns 429", async () => {
      const statuses = [];
      for (let index = 0; index < 3; index += 1) {
        const response = await request(app).post("/auth/login").send({ email: users.admin.email, password: "Wrong-password!" });
        statuses.push(response.status);
      }
      assert.deepEqual(statuses, [401, 401, 429]);
    });

    await t.test("logout revokes the active session", async () => {
      assert.equal((await operatorAgent.post("/auth/logout")).status, 204);
      assert.equal((await operatorAgent.get("/auth/me")).status, 401);
    });
  } finally {
    await prisma.authSession.deleteMany({ where: { userId: { in: [users.admin.id, users.operator.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [users.admin.id, users.operator.id] } } });
    await prisma.$disconnect();
  }
});