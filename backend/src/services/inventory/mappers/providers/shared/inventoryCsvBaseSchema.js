const INVENTORY_CSV_BASE_SCHEMA = {
  sport: { type: "string", aliases: ["sport", "category"] },
  year: { type: "integer", aliases: ["year", "annee"] },
  brand: { type: "string", aliases: ["brand", "marque"] },
  series: {
    type: "string",
    aliases: ["series", "set", "collection"],
  },
  product: { type: "string", aliases: ["product", "produit"] },
  player: {
    type: "string",
    aliases: ["player", "athlete", "name"],
  },
  team: { type: "string", aliases: ["team", "equipe"] },
  cardNumber: {
    type: "string",
    aliases: ["card number", "card #", "number", "no", "cardnumber"],
  },
  rookie: { type: "boolean", aliases: ["rookie"] },
  autograph: { type: "boolean", aliases: ["autograph", "auto"] },
  patch: { type: "boolean", aliases: ["patch"] },
  memorabilia: { type: "boolean", aliases: ["memorabilia"] },
  numbered: { type: "boolean", aliases: ["numbered"] },
  serialNumber: { type: "string", aliases: ["serial number", "serial", "sn"] },
  caseHit: { type: "boolean", aliases: ["case hit", "casehit"] },
  sp: { type: "boolean", aliases: ["sp"] },
  ssp: { type: "boolean", aliases: ["ssp"] },
  variant: { type: "string", aliases: ["variant", "variation"] },
  parallel: { type: "string", aliases: ["parallel"] },
  graded: { type: "boolean", aliases: ["graded"] },
  gradeCompany: { type: "string", aliases: ["grade company", "grading company"] },
  grade: { type: "string", aliases: ["grade"] },
  certification: { type: "string", aliases: ["certification", "cert"] },
  purchasePrice: {
    type: "float",
    aliases: ["purchase price", "cost", "bought price", "purchaseprice"],
  },
  shippingCost: { type: "float", aliases: ["shipping cost", "shipping"] },
  customsCost: { type: "float", aliases: ["customs cost", "customs"] },
  taxes: { type: "float", aliases: ["taxes", "tax"] },
  purchaseDate: { type: "date", aliases: ["purchase date", "bought date"] },
  supplier: { type: "string", aliases: ["supplier", "vendor"] },
  purchaseSource: { type: "string", aliases: ["purchase source", "source"] },
  origin: { type: "string", aliases: ["origin"] },
  askingPrice: { type: "float", aliases: ["asking price", "sale price"] },
  minimumPrice: { type: "float", aliases: ["minimum price", "min price"] },
  goal: { type: "string", aliases: ["goal"] },
  confidence: { type: "string", aliases: ["confidence"] },
  quantity: { type: "integer", aliases: ["quantity", "qty"] },
  status: { type: "string", aliases: ["status"] },
  location: { type: "string", aliases: ["location"] },
  priority: { type: "string", aliases: ["priority"] },
  notes: { type: "string", aliases: ["notes", "note"] },
};

/**
 * Deep-freeze one object tree to protect shared provider configuration.
 * @template T
 * @param {T} value
 * @returns {T}
 */
function deepFreeze(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  for (const key of Object.getOwnPropertyNames(value)) {
    const nested = value[key];

    if (nested && typeof nested === "object") {
      deepFreeze(nested);
    }
  }

  return Object.freeze(value);
}

deepFreeze(INVENTORY_CSV_BASE_SCHEMA);

module.exports = {
  INVENTORY_CSV_BASE_SCHEMA,
};
