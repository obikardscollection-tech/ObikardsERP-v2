const {
  hasSnapshotChanges,
  getSnapshotChangeAnalysis,
} = require("./sportsCardsProComparisonService");

async function getCurrentSnapshot(tx, providerCardId) {
  return tx.marketSnapshot.findUnique({
    where: {
      marketProviderCardId: providerCardId,
    },
  });
}

async function createSnapshotAndHistory(tx, providerCardId, snapshotData) {
  await tx.marketSnapshot.create({
    data: {
      marketProviderCardId: providerCardId,
      ...snapshotData,
    },
  });

  await tx.marketHistory.create({
    data: {
      marketProviderCardId: providerCardId,
      ...snapshotData,
    },
  });
}

async function updateSnapshotAndCreateHistory(tx, providerCardId, snapshotData) {
  await tx.marketSnapshot.update({
    where: {
      marketProviderCardId: providerCardId,
    },
    data: snapshotData,
  });

  await tx.marketHistory.create({
    data: {
      marketProviderCardId: providerCardId,
      ...snapshotData,
    },
  });
}

async function refreshProviderTimestampWithoutHistory(tx, providerCardId, snapshotData) {
  await tx.marketSnapshot.update({
    where: {
      marketProviderCardId: providerCardId,
    },
    data: {
      providerUpdatedAt: snapshotData.providerUpdatedAt,
      synchronizedAt: snapshotData.synchronizedAt,
    },
  });
}

async function manageSnapshot(tx, providerCardId, snapshotData, stats) {
  const existingSnapshot = await getCurrentSnapshot(tx, providerCardId);

  if (!existingSnapshot) {
    await createSnapshotAndHistory(tx, providerCardId, snapshotData);
    stats.snapshotsCreated += 1;
    stats.historyCreated += 1;
    return;
  }

  const hasChanges = hasSnapshotChanges(existingSnapshot, snapshotData);

  if (!hasChanges) {
    const analysis = getSnapshotChangeAnalysis(existingSnapshot, snapshotData);

    if (analysis.providerTimestampOnlyChange) {
      await refreshProviderTimestampWithoutHistory(tx, providerCardId, snapshotData);
    }

    stats.snapshotsUnchanged += 1;
    return;
  }

  await updateSnapshotAndCreateHistory(tx, providerCardId, snapshotData);
  stats.snapshotsUpdated += 1;
  stats.historyCreated += 1;
}

module.exports = {
  getCurrentSnapshot,
  createSnapshotAndHistory,
  updateSnapshotAndCreateHistory,
  manageSnapshot,
};
