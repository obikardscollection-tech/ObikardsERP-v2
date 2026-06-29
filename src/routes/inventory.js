const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Liste de l'inventaire
router.get("/", async (req, res) => {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un article de test
router.get("/seed", async (req, res) => {
  try {
    const item = await prisma.inventory.create({
      data: {
        sku: "OBI-000001",
        category: "NBA",
        title: "Victor Wembanyama Topps Chrome Auto",
        purchasePrice: 120,
        salePrice: 250,
        quantity: 1,
      },
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un article via POST
router.post("/", async (req, res) => {
  try {
    const item = await prisma.inventory.create({
      data: {
        sku: req.body.sku,
        category: req.body.category,
        title: req.body.title,
        purchasePrice: req.body.purchasePrice,
        salePrice: req.body.salePrice,
        quantity: req.body.quantity || 1,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;