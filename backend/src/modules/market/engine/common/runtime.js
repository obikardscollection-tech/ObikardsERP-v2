function createRuntime() {
  return {
    startedAt: null,
    finishedAt: null,
    durationMs: 0,
  };
}

module.exports = {
  createRuntime,
};
