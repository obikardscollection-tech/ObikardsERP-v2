const {
  SNAPSHOT_COMPARE_FIELDS,
  SNAPSHOT_BUSINESS_FIELDS,
} = require("./sportsCardsProConstants");
const { valuesDiffer } = require("./sportsCardsProHelpers");

function listChangedSnapshotFields(currentSnapshot, nextSnapshot, fields) {
  const changedFields = [];

  for (const field of fields) {
    if (valuesDiffer(currentSnapshot[field], nextSnapshot[field])) {
      changedFields.push(field);
    }
  }

  return changedFields;
}

function hasSnapshotChanges(currentSnapshot, nextSnapshot) {
  const changedBusinessFields = listChangedSnapshotFields(
    currentSnapshot,
    nextSnapshot,
    SNAPSHOT_BUSINESS_FIELDS
  );

  return changedBusinessFields.length > 0;
}

function getSnapshotChangeAnalysis(currentSnapshot, nextSnapshot) {
  const changedFields = listChangedSnapshotFields(
    currentSnapshot,
    nextSnapshot,
    SNAPSHOT_COMPARE_FIELDS
  );
  const changedBusinessFields = listChangedSnapshotFields(
    currentSnapshot,
    nextSnapshot,
    SNAPSHOT_BUSINESS_FIELDS
  );

  const providerUpdatedAtChanged = changedFields.includes("providerUpdatedAt");
  const businessChanged = changedBusinessFields.length > 0;
  const providerTimestampOnlyChange = providerUpdatedAtChanged && !businessChanged;

  return {
    changedFields,
    changedBusinessFields,
    providerUpdatedAtChanged,
    providerTimestampOnlyChange,
    businessChanged,
  };
}

module.exports = {
  hasSnapshotChanges,
  getSnapshotChangeAnalysis,
};
