const prisma = require("../../lib/prisma");

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

function normalizeExpensePayload(data, existingExpense = null) {
  const category = normalizeEnumValue(data.category ?? existingExpense?.category, null);
  const paymentMethod = normalizeEnumValue(data.paymentMethod ?? existingExpense?.paymentMethod, null);
  const paymentStatus = normalizeEnumValue(data.paymentStatus ?? existingExpense?.paymentStatus ?? "PAID", "PAID");

  if (!category) {
    throw new Error("La catégorie de dépense est obligatoire.");
  }

  const title = parseRequiredString(data.title ?? existingExpense?.title, "libellé");

  const amountHT = parseAmount(data.amountHT ?? existingExpense?.amountHT, "Montant HT");
  const tax = parseAmount(data.tax ?? existingExpense?.tax, "TVA");

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

  if (data.expenseDate === null || data.expenseDate === undefined || data.expenseDate === "") {
    if (!existingExpense?.expenseDate) {
      throw new Error("La date de dépense est obligatoire.");
    }
  }

  const expenseDate = data.expenseDate ? new Date(data.expenseDate) : existingExpense?.expenseDate ? new Date(existingExpense.expenseDate) : null;

  if (!expenseDate || Number.isNaN(expenseDate.getTime())) {
    throw new Error("La date de dépense est invalide.");
  }

  return {
    category,
    supplierId: data.supplierId ?? existingExpense?.supplierId ?? null,
    title,
    description: data.description ?? existingExpense?.description ?? null,
    amountHT: Number(amountHT.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    amountTTC: Number(amountTTCValue.toFixed(2)),
    paymentMethod,
    paymentStatus,
    expenseDate,
    invoiceNumber: data.invoiceNumber ?? existingExpense?.invoiceNumber ?? null,
    receiptUrl: data.receiptUrl ?? existingExpense?.receiptUrl ?? null,
    notes: data.notes ?? existingExpense?.notes ?? null,
  };
}

async function updateExpense(id, data) {
  const existingExpense = await prisma.expense.findUnique({ where: { id } });

  if (!existingExpense) {
    throw new Error("La dépense n'existe pas.");
  }

  const payload = normalizeExpensePayload(data, existingExpense);

  const expense = await prisma.expense.update({
    where: { id },
    data: payload,
  });

  return expense;
}

module.exports = {
  updateExpense,
};