const assert = require("node:assert/strict");
const { test } = require("node:test");
const { maintenanceBarrier } = require("../src/middlewares/maintenanceBarrier");
const { withMaintenanceLock } = require("../src/services/backup/maintenanceLock");

function invoke(method, requestPath) {
  let nextCalled = false;
  const response = {
    body: null,
    statusCode: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    once() {},
  };
  maintenanceBarrier({ method, path: requestPath }, response, () => { nextCalled = true; });
  return { nextCalled, response };
}

test("restore maintenance blocks business reads but allows backup routes", async () => {
  let release;
  const restore = withMaintenanceLock("RESTORE", () => new Promise((resolve) => { release = resolve; }));

  const businessRead = invoke("GET", "/inventory");
  assert.equal(businessRead.nextCalled, false);
  assert.equal(businessRead.response.statusCode, 503);
  assert.equal(businessRead.response.body.code, "MAINTENANCE_ACTIVE");

  const backupRead = invoke("GET", "/backups");
  assert.equal(backupRead.nextCalled, true);

  await new Promise((resolve) => setImmediate(resolve));
  release();
  await restore;
});