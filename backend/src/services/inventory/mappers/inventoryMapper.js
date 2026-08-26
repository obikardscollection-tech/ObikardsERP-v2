function inventoryMapper(data) {
  return {
    // Général
    category: data.sport,
    title: `${data.year || ""} ${data.brand || ""} ${data.player || ""}`.trim(),

    sport: data.sport || null,
    year: data.year ? Number(data.year) : null,
    brand: data.brand || null,
    series: data.series || null,
    subset: data.subset || null,
    product: data.product || null,
    player: data.player || null,
    team: data.team || null,
    cardNumber: data.cardNumber || null,

    // Caractéristiques
    rookie: !!data.rookie,
    autograph: !!data.autograph,
    patch: !!data.patch,
    memorabilia: !!data.memorabilia,
    numbered: !!data.numbered,
    serialNumber: data.serialNumber || null,
    caseHit: !!data.caseHit,
    sp: !!data.sp,
    ssp: !!data.ssp,
    variant: data.variant || null,
    parallel: data.parallel || null,

    // Gradation
    graded: !!data.graded,
    gradeCompany: data.gradeCompany || null,
    grade: data.grade || null,
    certification: data.certification || null,

    // Achat
    purchasePrice: data.purchasePrice
      ? Number(data.purchasePrice)
      : null,

    shippingCost: data.shippingCost
      ? Number(data.shippingCost)
      : null,

    customsCost: data.customsCost
      ? Number(data.customsCost)
      : null,

    taxes: data.taxes
      ? Number(data.taxes)
      : null,

    purchaseDate: data.purchaseDate
      ? new Date(data.purchaseDate)
      : null,

    supplier: data.supplier || null,
    purchaseSource: data.purchaseSource || null,
    origin: data.origin || null,

    // Vente
    salePrice: data.askingPrice
      ? Number(data.askingPrice)
      : null,

    minimumPrice: data.minimumPrice
      ? Number(data.minimumPrice)
      : null,

    goal: data.goal || null,
    confidence: data.confidence || null,

    // Stock
    quantity: data.quantity
      ? Number(data.quantity)
      : 1,

    status: data.status || "IN_STOCK",
    location: data.location || null,
    priority: data.priority || null,
    notes: data.notes || null,
  };
}

module.exports = inventoryMapper;