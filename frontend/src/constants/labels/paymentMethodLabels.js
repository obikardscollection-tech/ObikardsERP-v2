/**
 * Traductions centralisées des méthodes de paiement
 */
export const PAYMENT_METHOD_LABELS = {
  CASH: "Espèces",
  CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement",
  PAYPAL: "PayPal",
  CHECK: "Chèque",
  STRIPE: "Stripe",
  OTHER: "Autre",
};

export const getPaymentMethodLabel = (method) => {
  return PAYMENT_METHOD_LABELS[method] || method;
};
