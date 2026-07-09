const prisma = require("../../lib/prisma");

/**
 * Reference types configuration
 * - type: unique identifier for the reference type
 * - prefix: prefix for the reference
 * - useDateFormat: whether to include date in format (YYYYMMDD)
 * 
 * Format:
 * - PUR-YYYYMMDD-000001 (Purchases - with date)
 * - REC-000001 (Receptions)
 * - INV-000001 (Inventory)
 * - SAL-000001 (Sales)
 * - EXP-000001 (Expenses)
 * - CUS-000001 (Customers)
 * - SUP-000001 (Suppliers)
 */
const REFERENCE_TYPES = {
  INV: { prefix: "INV", useDateFormat: false },
  PUR: { prefix: "PUR", useDateFormat: true },
  REC: { prefix: "REC", useDateFormat: false },
  SAL: { prefix: "SAL", useDateFormat: false },
  EXP: { prefix: "EXP", useDateFormat: false },
  CUS: { prefix: "CUS", useDateFormat: false },
  SUP: { prefix: "SUP", useDateFormat: false },
};

/**
 * Generate a unique reference number for a given type
 * Formats:
 * - INV-000001
 * - PUR-20260709-000001 (with date)
 * - REC-000001
 * - SAL-000001
 * - EXP-000001
 * - CUS-000001
 * - SUP-000001
 *
 * @param {string} type - Reference type (INV, PUR, REC, SAL, EXP, CUS, SUP)
 * @param {object} tx - Prisma transaction object
 * @returns {string} Generated reference
 * @throws {Error} if type is not recognized
 */
async function generateReference(type, tx) {
  if (!REFERENCE_TYPES[type]) {
    throw new Error(`Reference type "${type}" is not supported`);
  }

  const config = REFERENCE_TYPES[type];
  const { prefix, useDateFormat } = config;

  // Get model name and field name based on type
  const modelConfig = getModelConfig(type);
  const { modelName, fieldName } = modelConfig;

  // Build the search pattern
  let searchPattern;
  if (useDateFormat) {
    const today = new Date().toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
    searchPattern = `${prefix}-${today}-`;
  } else {
    searchPattern = `${prefix}-`;
  }

  // Find the last record with this pattern
  const lastRecord = await tx[modelName].findFirst({
    where: {
      [fieldName]: {
        startsWith: searchPattern,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let nextNumber = 1;

  if (lastRecord && lastRecord[fieldName]) {
    // Extract the number from the reference
    const parts = lastRecord[fieldName].split("-");
    const lastNumber = useDateFormat ? parts[2] : parts[1];
    if (lastNumber) {
      nextNumber = Number(lastNumber) + 1;
    }
  }

  // Format the number with leading zeros
  const formattedNumber = String(nextNumber).padStart(6, "0");

  // Build the final reference
  if (useDateFormat) {
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    return `${prefix}-${today}-${formattedNumber}`;
  } else {
    return `${prefix}-${formattedNumber}`;
  }
}

/**
 * Get model and field configuration based on reference type
 * @param {string} type - Reference type
 * @returns {object} Configuration with modelName and fieldName
 */
function getModelConfig(type) {
  const config = {
    INV: { modelName: "inventory", fieldName: "sku" },
    PUR: { modelName: "purchase", fieldName: "purchaseNumber" },
    REC: { modelName: "reception", fieldName: "receptionNumber" },
    SAL: { modelName: "sale", fieldName: "orderNumber" },
    EXP: { modelName: "expense", fieldName: "expenseNumber" },
    CUS: { modelName: "customer", fieldName: "customerNumber" },
    SUP: { modelName: "supplier", fieldName: "supplierNumber" },
  };

  if (!config[type]) {
    throw new Error(`No model configuration found for type "${type}"`);
  }

  return config[type];
}

module.exports = {
  generateReference,
  REFERENCE_TYPES,
};
