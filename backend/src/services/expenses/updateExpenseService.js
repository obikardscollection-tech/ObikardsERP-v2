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

async function updateExpense(id, data) {
  const expense = await prisma.expense.update({
    where: {
      id,
    },
    data: {
      // expenseNumber is immutable after creation
      category: normalizeEnumValue(data.category, "OTHER"),

      supplierId: data.supplierId || null,

      title: data.title,
      description: data.description || null,

      amountHT: data.amountHT || 0,
      tax: data.tax || 0,
      amountTTC: data.amountTTC || 0,

      paymentMethod: normalizeEnumValue(data.paymentMethod, "OTHER"),
      paymentStatus: normalizeEnumValue(data.paymentStatus, "PAID"),

      expenseDate: data.expenseDate
        ? new Date(data.expenseDate)
        : undefined,

      invoiceNumber: data.invoiceNumber || null,
      receiptUrl: data.receiptUrl || null,

      notes: data.notes || null,
    },
  });

  return expense;
}

module.exports = {
  updateExpense,
};