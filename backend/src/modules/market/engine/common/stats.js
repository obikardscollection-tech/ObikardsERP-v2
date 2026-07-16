function createStats() {
  return {
    readRows: 0,
    validatedRows: 0,
    invalidRows: 0,
    matchedCards: 0,
    createdCards: 0,
    updatedCards: 0,
    createdProviderCards: 0,
    updatedProviderCards: 0,
    createdSnapshots: 0,
    createdHistory: 0,
    updatedReferences: 0,
    updatedAnalytics: 0,
  };
}

module.exports = {
  createStats,
};
