const express = require("express");
const cors = require("cors");

const inventoryRoutes = require("./routes/inventoryRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const salesRoutes = require("./routes/salesRoutes");
const customersRoutes = require("./routes/customersRoutes");
const suppliersRoutes = require("./routes/suppliersRoutes");
const purchasesRoutes = require("./routes/purchasesRoutes");
const expensesRoutes = require("./routes/expensesRoutes");
const receptionsRoutes = require("./routes/receptionsRoutes");

const marketProviderRoutes = require("./routes/marketProviderRoutes");
const marketCardRoutes = require("./routes/marketCardRoutes");
const marketProviderCardRoutes = require("./routes/marketProviderCardRoutes");
const marketSnapshotRoutes = require("./routes/marketSnapshotRoutes");
const marketHistoryRoutes = require("./routes/marketHistoryRoutes");
const marketAnalyticsRoutes = require("./routes/marketAnalyticsRoutes");
const marketReferenceRoutes = require("./routes/marketReferenceRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "Obikards ERP",
    version: "0.1.0",
    status: "OK",
  });
});

app.use("/inventory", inventoryRoutes);
app.use("/stock-movements", stockMovementRoutes);
app.use("/sales", salesRoutes);
app.use("/customers", customersRoutes);
app.use("/suppliers", suppliersRoutes);
app.use("/purchases", purchasesRoutes);
app.use("/expenses", expensesRoutes);
app.use("/receptions", receptionsRoutes);

app.use("/market/providers", marketProviderRoutes);
app.use("/market/cards", marketCardRoutes);
app.use("/market/provider-cards", marketProviderCardRoutes);
app.use("/market/snapshots", marketSnapshotRoutes);
app.use("/market/history", marketHistoryRoutes);
app.use("/market/analytics", marketAnalyticsRoutes);
app.use("/market/references", marketReferenceRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Obikards ERP démarré sur http://localhost:${PORT}`);
});