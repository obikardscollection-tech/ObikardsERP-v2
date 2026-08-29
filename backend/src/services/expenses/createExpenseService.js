const prisma = require("../../lib/prisma");
const { generateReference } = require("../common/referenceGeneratorService");

function normalizeEnumValue(value, fallback) {
  if (!value) return fallback;

  const normalized = String(value).trim().toUpperCase();

  const mapping = {
    OPERATING: "OTHER",
    OPERATIONAL: "OTHER",
    OFFICE_EXPENSE: "OFFICE",
    SHIPPING_COST: "SHIPPING",
    SUPPLY: "SUPPLIES",
    SUPPLIES_EXPENSE: "SUPPLIES",
    SOFTWARE_COST: "SOFTWARE",
    MARKETING_EXPENSE: "MARKETING",
    TRAVEL_EXPENSE: "TRAVEL",
    FUEL_COST: "FUEL",
    BANK_FEES: "BANK",
    ACCOUNTING_FEES: "ACCOUNTING",
    INSURANCE_COST: "INSURANCE",
    RENT_COST: "RENT",
    PHONE_COST: "PHONE",
    INTERNET_COST: "INTERNET",
    EBAY_FEE: "EBAY_FEES",
    WHATNOT_FEE: "WHATNOT_FEES",
    WOOCOMMERCE_FEE: "WOOCOMMERCE_FEES",
    PAYPAL_FEE: "PAYPAL_FEES",
    STRIPE_FEE: "STRIPE_FEES",
    SALARY_EXPENSE: "SALARY",
    TRAINING_COST: "TRAINING",
    BANKTRANSFER: "BANK_TRANSFER",
    "BANK-TRANSFER": "BANK_TRANSFER",
    CARD_PAYMENT: "CARD",
    CASH_PAYMENT: "CASH",
    CHECK_PAYMENT: "CHECK",
    PAYPAL_PAYMENT: "PAYPAL",
    STRIPE_PAYMENT: "STRIPE",
    PAID_STATUS: "PAID",
    PENDING_STATUS: "PENDING",
    REFUNDED_STATUS: "REFUNDED",
  };

  return mapping[normalized] || normalized;
}

function parseAmount(value, fieldLabel) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    throw new Error(`Le champ ${fieldLabel} doit être un nombre valide.`);
  }

  return numeric;
}

function parseRequiredString(value, fieldLabel) {
  if (value === null || value === undefined) {
    throw new Error(`Le champ ${fieldLabel} est obligatoire.`);
  }

  const normalized = String(value).trim();

  if (!normalized) {
    throw new Error(`Le champ ${fieldLabel} est obligatoire.`);
  }

  return normalized;
}

function parseExpenseDate(value) {
  if (!value) {
    throw new Error("La date de dépense est obligatoire.");
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("La date de dépense est invalide.");
  }

  return date;
}

function normalizeExpensePayload(data) {
  const category = normalizeEnumValue(data.category, null);
  const paymentMethod = normalizeEnumValue(data.paymentMethod, null);
  const paymentStatus = normalizeEnumValue(data.paymentStatus, "PAID");

  if (!category) {
    throw new Error("La catégorie de dépense est obligatoire.");
  }

  const title = parseRequiredString(data.title, "libellé");

  const amountHT = parseAmount(data.amountHT, "Montant HT");
  const tax = parseAmount(data.tax, "TVA");

  if (amountHT < 0) {
    throw new Error("Le montant HT ne peut pas être négatif.");
  }

  if (tax < 0) {
    throw new Error("La TVA ne peut pas être négative.");
  }

  const computedAmountTTC = Number((amountHT + tax).toFixed(2));
  const amountTTCValue =
    data.amountTTC !== null && data.amountTTC !== undefined && String(data.amountTTC).trim() !== ""
      ? parseAmount(data.amountTTC, "Montant TTC")
      : computedAmountTTC;

  if (amountTTCValue <= 0) {
    throw new Error("Le montant TTC doit être supérieur à 0.");
  }

  if (Math.abs(amountTTCValue - computedAmountTTC) > 0.01) {
    throw new Error("Le montant TTC doit correspondre à HT + TVA.");
  }

  if (!paymentMethod) {
    throw new Error("La méthode de paiement est obligatoire.");
  }

  const expenseDate = parseExpenseDate(data.expenseDate);

  return {
    category,
    supplierId: data.supplierId || null,
    title,
    description: data.description || null,
    amountHT: Number(amountHT.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    amountTTC: Number(amountTTCValue.toFixed(2)),
    paymentMethod,
    paymentStatus,
    expenseDate,
    invoiceNumber: data.invoiceNumber || null,
    receiptUrl: data.receiptUrl || null,
    notes: data.notes || null,
  };
}

async function createExpense(data) {
  return prisma.$transaction(async (tx) => {
    const payload = normalizeExpensePayload(data);
    const expenseNumber = await generateReference("EXP", tx);

    const expense = await tx.expense.create({
      data: {
        expenseNumber,
        ...payload,
      },
    });

    return expense;
  });
}

module.exports = {
  createExpense,
};