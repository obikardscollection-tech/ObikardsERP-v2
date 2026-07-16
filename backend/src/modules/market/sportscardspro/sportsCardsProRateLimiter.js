const INTERNALS = {
  LIMITS: {
    REQUEST_INTERVAL_MS: 1000,
  },
};

let lastExecutionAt = 0;
let executionQueue = Promise.resolve();

/**
 * Ensure task is an executable function.
 * @param {unknown} task
 */
function assertTask(task) {
  if (typeof task !== "function") {
    throw new Error("La requete SportsCardsPro doit etre une fonction asynchrone.");
  }
}

/**
 * Wait for the requested duration.
 * @param {number} durationMs
 * @returns {Promise<void>}
 */
function wait(durationMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

/**
 * Wait if needed to enforce one request per second.
 * @returns {Promise<void>}
 */
async function enforceRateLimit() {
  const now = Date.now();
  const elapsedMs = now - lastExecutionAt;
  const remainingMs = INTERNALS.LIMITS.REQUEST_INTERVAL_MS - elapsedMs;

  if (remainingMs > 0) {
    await wait(remainingMs);
  }
}

/**
 * Execute one request task while preserving the global rate limit.
 * @template T
 * @param {() => Promise<T>} task
 * @returns {Promise<T>}
 */
async function executeTask(task) {
  await enforceRateLimit();
  lastExecutionAt = Date.now();

  return task();
}

/**
 * Execute a SportsCardsPro request task with a maximum rate of one request per second.
 * @template T
 * @param {() => Promise<T>} task
 * @returns {Promise<T>}
 */
function executeSportsCardsProRequest(task) {
  assertTask(task);

  const run = executionQueue.then(() => executeTask(task));

  executionQueue = run.then(
    () => undefined,
    () => undefined
  );

  return run;
}

module.exports = {
  executeSportsCardsProRequest,
};
