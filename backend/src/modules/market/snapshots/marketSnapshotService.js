const prisma = require("../../../lib/prisma");

const { mapMarketSnapshotToCreateInput } = require("./marketSnapshotMapper");
const { validateMarketSnapshotInput } = require("./marketSnapshotValidation");

/**
 * Create one inventory market snapshot from normalized refresh result.
 * @param {{inventoryId:string, refreshResult:object, db?:object}} input
 * @returns {Promise<object>}
 */
async function createMarketSnapshot(input) {
  validateMarketSnapshotInput(input);

  const createInput = mapMarketSnapshotToCreateInput(input.inventoryId, input.refreshResult);
  const database = input.db || prisma;

  return database.inventoryMarketSnapshot.create({
    data: createInput,
  });
}

module.exports = {
  createMarketSnapshot,
};
