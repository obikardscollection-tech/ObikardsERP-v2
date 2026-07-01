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
    NHL: "NHL",
    F1: "F1",
    UFC: "UFC",
    Pokémon: "PKM",
    Fournitures: "SUP",
    Luxe: "LUX",
    Antiquités: "ANT",
  };

  const prefix = prefixMap[category] || "OBI";

  const lastItem = await prisma.inventory.findFirst({
    where: {
      category,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let next = 1;

  if (lastItem?.sku) {
    const parts = lastItem.sku.split("-");
    if (parts.length === 2) {
      next = parseInt(parts[1]) + 1;
    }
  }

  return `${prefix}-${String(next).padStart(6, "0")}`;
}

// ===============================
// Liste
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
// Création
// ===============================

router.post("/", async (req, res) => {
  try {
    const sku = await generateSku(req.body.sport);

    const item = await prisma.inventory.create({
      data: {
        sku,

        category: req.body.sport,
        title: `${req.body.year || ""} ${req.body.brand || ""} ${req.body.player || ""}`.trim(),

        // Général
        sport: req.body.sport || null,
        year: req.body.year ? Number(req.body.year) : null,
        brand: req.body.brand || null,
        series: req.body.series || null,
        product: req.body.product || null,
        player: req.body.player || null,
        team: req.body.team || null,
        cardNumber: req.body.cardNumber || null,

        // Caractéristiques
        rookie: !!req.body.rookie,
        autograph: !!req.body.autograph,
        patch: !!req.body.patch,
        memorabilia: !!req.body.memorabilia,
        numbered: !!req.body.numbered,
        serialNumber: req.body.serialNumber || null,
        caseHit: !!req.body.caseHit,
        sp: !!req.body.sp,
        ssp: !!req.body.ssp,
        variant: req.body.variant || null,
        parallel: req.body.parallel || null,

        // Gradation
        graded: !!req.body.graded,
        gradeCompany: req.body.gradeCompany || null,
        grade: req.body.grade || null,
        certification: req.body.certification || null,

        // Achat
        purchasePrice: req.body.purchasePrice
          ? Number(req.body.purchasePrice)
          : null,

        shippingCost: req.body.shippingCost
          ? Number(req.body.shippingCost)
          : null,

        customsCost: req.body.customsCost
          ? Number(req.body.customsCost)
          : null,

        taxes: req.body.taxes
          ? Number(req.body.taxes)
          : null,

        purchaseDate: req.body.purchaseDate
          ? new Date(req.body.purchaseDate)
          : null,

        supplier: req.body.supplier || null,
        purchaseSource: req.body.purchaseSource || null,
        origin: req.body.origin || null,

        // Vente
        salePrice: req.body.askingPrice
          ? Number(req.body.askingPrice)
          : null,

        minimumPrice: req.body.minimumPrice
          ? Number(req.body.minimumPrice)
          : null,

        goal: req.body.goal || null,
        confidence: req.body.confidence || null,

        // Stock
        quantity: req.body.quantity
          ? Number(req.body.quantity)
          : 1,

        status: req.body.status || "IN_STOCK",
        location: req.body.location || null,
        priority: req.body.priority || null,
        notes: req.body.notes || null,

        // Photos (Sprint 5)
        frontPhoto: null,
        backPhoto: null,
        extraPhotos: null,
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
// ===============================
// Modification
// ===============================

router.put("/:id", async (req, res) => {
  try {
    const item = await prisma.inventory.update({
      where: {
        id: req.params.id,
      },

      data: {
        category: req.body.sport,
        title: `${req.body.year || ""} ${req.body.brand || ""} ${req.body.player || ""}`.trim(),

        // Général
        sport: req.body.sport || null,
        year: req.body.year ? Number(req.body.year) : null,
        brand: req.body.brand || null,
        series: req.body.series || null,
        product: req.body.product || null,
        player: req.body.player || null,
        team: req.body.team || null,
        cardNumber: req.body.cardNumber || null,

        // Caractéristiques
        rookie: !!req.body.rookie,
        autograph: !!req.body.autograph,
        patch: !!req.body.patch,
        memorabilia: !!req.body.memorabilia,
        numbered: !!req.body.numbered,
        serialNumber: req.body.serialNumber || null,
        caseHit: !!req.body.caseHit,
        sp: !!req.body.sp,
        ssp: !!req.body.ssp,
        variant: req.body.variant || null,
        parallel: req.body.parallel || null,

        // Gradation
        graded: !!req.body.graded,
        gradeCompany: req.body.gradeCompany || null,
        grade: req.body.grade || null,
        certification: req.body.certification || null,

        // Achat
        purchasePrice: req.body.purchasePrice
          ? Number(req.body.purchasePrice)
          : null,

        shippingCost: req.body.shippingCost
          ? Number(req.body.shippingCost)
          : null,

        customsCost: req.body.customsCost
          ? Number(req.body.customsCost)
          : null,

        taxes: req.body.taxes
          ? Number(req.body.taxes)
          : null,

        purchaseDate: req.body.purchaseDate
          ? new Date(req.body.purchaseDate)
          : null,

        supplier: req.body.supplier || null,
        purchaseSource: req.body.purchaseSource || null,
        origin: req.body.origin || null,

        // Vente
        salePrice: req.body.askingPrice
          ? Number(req.body.askingPrice)
          : null,

        minimumPrice: req.body.minimumPrice
          ? Number(req.body.minimumPrice)
          : null,

        goal: req.body.goal || null,
        confidence: req.body.confidence || null,

        // Stock
        quantity: req.body.quantity
          ? Number(req.body.quantity)
          : 1,

        status: req.body.status || "IN_STOCK",
        location: req.body.location || null,
        priority: req.body.priority || null,
        notes: req.body.notes || null,
      },
    });

    res.json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// ===============================
// Suppression
// ===============================

router.delete("/:id", async (req, res) => {
  try {
    await prisma.inventory.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;