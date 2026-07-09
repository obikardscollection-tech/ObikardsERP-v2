import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  createPurchase,
  updatePurchase,
} from "../../services/purchaseService";
import { getPurchaseSourceLabel, getPurchaseStatusLabel } from "../../constants/labels";
import PurchaseItems, { emptyItem } from "./PurchaseItems";

const defaultForm = {
  supplierId: "",
  platform: "DIRECT",
  status: "PENDING",
  shippingCost: 0,
  taxes: 0,
  discount: 0,
  currency: "EUR",
  notes: "",
  purchasedAt: "",
  items: [{ ...emptyItem }],
};

const platforms = [
  "EBAY",
  "WHATNOT",
  "WOOCOMMERCE",
  "CARDMARKET",
  "WEBSITE",
  "DIRECT",
  "CARD_SHOW",
  "FACEBOOK",
  "INSTAGRAM",
  "SHOP",
  "DISTRIBUTOR",
  "OTHER",
];

const statuses = [
  "PENDING",
  "RECEIVED",
  "PARTIALLY_RECEIVED",
  "CANCELLED",
];

function formatDateInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function PurchaseForm({
  purchase,
  suppliers = [],
  onSaved,
  onClose,
}) {
  const isEditing = Boolean(purchase);

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (purchase) {
      setForm({
        supplierId: purchase.supplierId ?? "",
        platform: purchase.platform ?? "DIRECT",
        status: purchase.status ?? "PENDING",
        shippingCost: purchase.shippingCost ?? 0,
        taxes: purchase.taxes ?? 0,
        discount: purchase.discount ?? 0,
        currency: purchase.currency ?? "EUR",
        notes: purchase.notes ?? "",
        purchasedAt: formatDateInput(purchase.purchasedAt),
        items:
          purchase.purchaseItems?.length > 0
            ? purchase.purchaseItems
            : [{ ...emptyItem }],
      });
    } else {
      setForm(defaultForm);
    }

    setErrors({});
  }, [purchase]);

  const totals = useMemo(() => {
    const itemsAmount = form.items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0) *
          Number(item.unitPrice || 0),
      0
    );

    const totalItems = form.items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

    const totalAmount =
      itemsAmount +
      Number(form.shippingCost || 0) +
      Number(form.taxes || 0) -
      Number(form.discount || 0);

    return {
      totalItems,
      totalAmount,
    };
  }, [form]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function handleItemsChange(items) {
    setForm((previous) => ({
      ...previous,
      items,
    }));

    setErrors((previous) => ({
      ...previous,
      items: "",
    }));
  }

  function validate() {
    const newErrors = {};

    if (!form.supplierId) {
      newErrors.supplierId =
        "Le fournisseur est obligatoire.";
    }

    if (!form.platform) {
      newErrors.platform =
        "La plateforme est obligatoire.";
    }

    if (!isEditing) {
      if (!form.items.length) {
        newErrors.items =
          "Au moins une ligne est obligatoire.";
      }

      form.items.forEach((item, index) => {
        if (!item.name?.trim()) {
          newErrors[`items.${index}.name`] =
            "Le nom est obligatoire.";
        }

        if (Number(item.quantity || 0) <= 0) {
          newErrors[`items.${index}.quantity`] =
            "La quantite doit etre superieure a 0.";
        }

        if (Number(item.unitPrice || 0) < 0) {
          newErrors[`items.${index}.unitPrice`] =
            "Le prix ne peut pas etre negatif.";
        }
      });
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function buildPayload() {
    const payload = {
      supplierId: form.supplierId,
      platform: form.platform,
      status: form.status,
      shippingCost: Number(form.shippingCost || 0),
      taxes: Number(form.taxes || 0),
      discount: Number(form.discount || 0),
      currency: form.currency || "EUR",
      notes: form.notes || null,
      purchasedAt: form.purchasedAt || undefined,
    };

    if (!isEditing) {
      payload.items = form.items.map((item) => ({
        name: item.name,
        cardReference: item.cardReference || null,
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        condition: item.condition || null,
        sku: item.sku || null,
        notes: item.notes || null,
      }));
    }

    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await updatePurchase(purchase.id, buildPayload());
        toast.success("Achat modifie avec succes.");
      } else {
        await createPurchase(buildPayload());
        toast.success("Achat cree avec succes.");
      }

      await onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'enregistrer l'achat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <select
            className="w-full rounded-lg border p-3"
            name="supplierId"
            value={form.supplierId}
            onChange={handleChange}
          >
            <option value="">Fournisseur</option>
            {suppliers.map((supplier) => (
              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name || supplier.company}
              </option>
            ))}
          </select>

          {errors.supplierId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.supplierId}
            </p>
          )}
        </div>

        <select
          className="w-full rounded-lg border p-3"
          name="platform"
          value={form.platform}
          onChange={handleChange}
        >
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {getPurchaseSourceLabel(platform)}
            </option>
          ))}
        </select>

        <select
          className="w-full rounded-lg border p-3"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {getPurchaseStatusLabel(status)}
            </option>
          ))}
        </select>

        <input
          className="w-full rounded-lg border p-3"
          name="purchasedAt"
          type="date"
          value={form.purchasedAt}
          onChange={handleChange}
        />

        <input
          className="w-full rounded-lg border p-3"
          name="currency"
          placeholder="Devise"
          value={form.currency}
          onChange={handleChange}
        />

        <input
          className="w-full rounded-lg border p-3"
          name="shippingCost"
          type="number"
          min="0"
          step="0.01"
          placeholder="Frais de port"
          value={form.shippingCost}
          onChange={handleChange}
        />

        <input
          className="w-full rounded-lg border p-3"
          name="taxes"
          type="number"
          min="0"
          step="0.01"
          placeholder="Taxes"
          value={form.taxes}
          onChange={handleChange}
        />

        <input
          className="w-full rounded-lg border p-3"
          name="discount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Remise"
          value={form.discount}
          onChange={handleChange}
        />
      </div>

      <textarea
        className="w-full rounded-lg border p-3"
        rows={4}
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
      />

      <PurchaseItems
        items={form.items}
        onChange={handleItemsChange}
        readOnly={isEditing}
        errors={errors}
      />

      <div className="rounded-lg bg-slate-100 p-4 text-right">
        <div className="text-sm text-slate-600">
          Articles: {totals.totalItems}
        </div>

        <div className="text-xl font-bold text-slate-900">
          Total: {totals.totalAmount.toFixed(2)}{" "}
          {form.currency || "EUR"}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-5 py-3"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

export default PurchaseForm;
