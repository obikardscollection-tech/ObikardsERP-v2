let activeOperation = null;
let activeMutations = 0;
let drainResolvers = [];

function createMaintenanceError() {
  const error = new Error("Une operation de maintenance est deja en cours.");
  error.statusCode = 503;
  error.code = "MAINTENANCE_ACTIVE";
  return error;
}

function beginMutation() {
  if (activeOperation) throw createMaintenanceError();

  activeMutations += 1;
  let released = false;

  return function endMutation() {
    if (released) return;
    released = true;
    activeMutations -= 1;

    if (activeMutations === 0) {
      const resolvers = drainResolvers;
      drainResolvers = [];
      for (const resolve of resolvers) resolve();
    }
  };
}

function waitForMutationsToDrain() {
  if (activeMutations === 0) return Promise.resolve();
  return new Promise((resolve) => drainResolvers.push(resolve));
}

function getMaintenanceState() {
  if (!activeOperation) return { active: false, activeMutations };

  return {
    active: true,
    activeMutations,
    operation: activeOperation.operation,
    startedAt: activeOperation.startedAt,
  };
}

async function withMaintenanceLock(operation, worker) {
  if (activeOperation) {
    const error = new Error("Une operation de maintenance est deja en cours.");
    error.statusCode = 409;
    error.code = "MAINTENANCE_ALREADY_ACTIVE";
    throw error;
  }

  activeOperation = {
    operation,
    startedAt: new Date().toISOString(),
  };

  try {
    await waitForMutationsToDrain();
    return await worker();
  } finally {
    activeOperation = null;
  }
}

module.exports = {
  beginMutation,
  getMaintenanceState,
  withMaintenanceLock,
};