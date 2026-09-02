const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const { createApp } = require("./app");
const {
  startSportsCardsProAutoSync,
} = require("./services/marketImportJob/sportsCardsProAutoSyncService");

const app = createApp();
const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`🚀 Obikards ERP démarré sur http://localhost:${PORT}`);
  startSportsCardsProAutoSync();
});