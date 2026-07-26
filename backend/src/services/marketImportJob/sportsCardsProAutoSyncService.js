const {
  executeSportsCardsProSync,
} = require("./sportsCardsProSyncService");
const {
  isAutoSyncEnabled,
  resolveAutoSyncIntervalMinutes,
  resolveAutoSyncCsvPath,
} = require("./sportsCardsProConfigurationService");

let autoSyncTimer = null;

async function runAutoSync() {
  try {
    const filePath = resolveAutoSyncCsvPath();

    await executeSportsCardsProSync({
      source: "SCHEDULER",
      filePath,
    });

    console.log("[SportsCardsProSync] Synchronisation automatique terminee.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error(`[SportsCardsProSync] Echec de synchronisation automatique: ${message}`);
  }
}

function startSportsCardsProAutoSync() {
  if (!isAutoSyncEnabled()) {
    return null;
  }

  if (autoSyncTimer) {
    return autoSyncTimer;
  }

  const intervalMinutes = resolveAutoSyncIntervalMinutes();
  const intervalMs = intervalMinutes * 60 * 1000;

  autoSyncTimer = setInterval(runAutoSync, intervalMs);
  autoSyncTimer.unref?.();

  runAutoSync();

  console.log(
    `[SportsCardsProSync] Planification active toutes les ${intervalMinutes} minute(s).`
  );

  return autoSyncTimer;
}

function stopSportsCardsProAutoSync() {
  if (!autoSyncTimer) {
    return false;
  }

  clearInterval(autoSyncTimer);
  autoSyncTimer = null;
  console.log("[SportsCardsProSync] Planification automatique arretee.");
  return true;
}

function restartSportsCardsProAutoSync() {
  stopSportsCardsProAutoSync();
  return startSportsCardsProAutoSync();
}

module.exports = {
  startSportsCardsProAutoSync,
  stopSportsCardsProAutoSync,
  restartSportsCardsProAutoSync,
};
