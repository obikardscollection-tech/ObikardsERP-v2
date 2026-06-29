const express = require("express");
const cors = require("cors");
const inventoryRoutes = require("./routes/inventory");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "Obikards ERP",
    version: "0.1.0",
    status: "OK"
  });
});

app.use("/inventory", inventoryRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Obikards ERP démarré sur http://localhost:${PORT}`);
});