const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  getMaintenanceState,
  withMaintenanceLock,
} = require("../src/services/backup/maintenanceLock");

test("maintenance lock is exclusive and always released", async (t) => {
  await t.test("exposes the active operation and rejects concurrency", async () => {
    let release;
    const pending = withMaintenanceLock("BACKUP", async () => (
      new Promise((resolve) => {
        release = resolve;
      })
    ));

    assert.equal(getMaintenanceState().active, true);
    assert.equal(getMaintenanceState().operation, "BACKUP");

    await assert.rejects(
      withMaintenanceLock("RESTORE", async () => {}),
      { code: "MAINTENANCE_ALREADY_ACTIVE", statusCode: 409 }
    );

    release("done");
    assert.equal(await pending, "done");
    assert.deepEqual(getMaintenanceState(), { active: false, activeMutations: 0 });
  });

  await t.test("waits for existing mutations and blocks new ones", async () => {
    const endMutation = require("../src/services/backup/maintenanceLock").beginMutation();
    let workerStarted = false;
    const pending = withMaintenanceLock("BACKUP", async () => {
      workerStarted = true;
    });

    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(workerStarted, false);
    assert.throws(
      () => require("../src/services/backup/maintenanceLock").beginMutation(),
      { code: "MAINTENANCE_ACTIVE", statusCode: 503 }
    );

    endMutation();
    await pending;
    assert.equal(workerStarted, true);
  });

  await t.test("releases the lock after an exception", async () => {
    await assert.rejects(
      withMaintenanceLock("BACKUP", async () => {
        throw new Error("failure");
      }),
      /failure/
    );

    assert.deepEqual(getMaintenanceState(), { active: false, activeMutations: 0 });
  });
});