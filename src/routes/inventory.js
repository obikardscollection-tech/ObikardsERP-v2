const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// ===============================
// Génération automatique du SKU
// ===============================

async function generateSku(category) {
  const prefixMap = {
    NBA: "NBA",
    NFL: "NFL",
    MLB: "MLB",
    Soccer: "SOC",
    "Pokémon": "PKM",
    Fournitures: "SUP",
    Luxe: "LUX",
    Antiquités: "ANT",
  };

  const prefix = prefixMap[category] || "OBI";

  const lastItem = await prisma.inventory.findFirst({
    where: {
      sku: {
        startsWith: prefix,
      },
    },
    orderBy: {
      sku: "desc",
    },
  });

  let nextNumber = 1;

  if (lastItem) {
    const current = parseInt(lastItem.sku.split("-")[1], 10);
    nextNumber = current + 1;
  }

  return `${prefix}-${String(nextNumber).padStart(6, "0")}`;
}

// ===============================
// Liste des articles
// ===============================

router.get("/", async (req, res) => {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

// ===============================
// Création d'un article
// ===============================

router.post("/", async (req, res) => {
  try {
    const sku = await generateSku(req.body.category);

    const item = await prisma.inventory.create({
      data: {
        sku,

        category: req.body.category,

        title: req.body.title,

        purchasePrice: req.body.purchasePrice,

        salePrice: req.body.salePrice,

        quantity: req.body.quantity ?? 1,

        status: "IN_STOCK",

        location: req.body.location || null,

        notes: req.body.notes || null,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;