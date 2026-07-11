import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getPurchaseSourceLabel, getPurchaseStatusLabel } from "../../constants/labels";

const defaultForm = {
  customerId: "",
  customerName: "",
  customerEmail: "",
  platform: "DIRECT",
  status: "PENDING",
  shippingCost: 0,
  platformFees: 0,
  taxes: 0,
  discount: 0,
  notes: "",
  soldAt: "",
  items: [],
};

const platforms = ["EBAY", "WHATNOT", "WOOCOMMERCE", "CARDMARKET", "WEBSITE", "DIRECT", "CARD_SHOW", "FACEBOOK", "INSTAGRAM", "SHOP", "DISTRIBUTOR", "OTHER"];
const statuses = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];

function formatDateInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function SaleForm({ sale, inventoryItems = [], customers = [], onClose, onSaved, addSale, editSale }) {
  const isEditing = Boolean(sale);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sale) {
      setForm({
        customerId: sale.customerId || "",
        customerName: sale.customerName || "",
        customerEmail: sale.customerEmail || "",
        platform: sale.platform || "DIRECT",
        status: sale.status || "PENDING",
        shippingCost: sale.shippingCost ?? 0,
        platformFees: sale.platformFees ?? 0,
        taxes: sale.taxes ?? 0,
        discount: sale.discount ?? 0,
        notes: sale.notes || "",
        soldAt: formatDateInput(sale.soldAt),
        items: sale.saleItems?.map((item) => ({ inventoryId: item.inventoryId, quantity: item.quantity, notes: item.notes || "" })) || [],
      });
    } else {
      setForm(defaultForm);
    }

    setErrors({});
  }, [sale]);

  const totals = useMemo(() => {
    return form.items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }, [form.items]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  }

  function handleItemChange(index, field, value) {
    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  }

  function validate() {
    const newErrors = {};

    if (!form.platform) {
      newErrors.platform = "La plateforme est obligatoire.";
    }

    if (!form.items.length) {
      newErrors.items = "Au moins un article est obligatoire.";
    }

    form.items.forEach((item, index) => {
      if (!item.inventoryId) {
        newErrors[`items.${index}.inventoryId`] = "L'article est obligatoire.";
      }

      if (Number(item.quantity || 0) <= 0) {
        newErrors[`items.${index}.quantity`] = "La quantité doit être supérieure à 0.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function buildPayload() {
    return {
      customerId: form.customerId || undefined,
      customerName: form.customerName || null,
      customerEmail: form.customerEmail || null,
      platform: form.platform,
      status: form.status,
      shippingCost: Number(form.shippingCost || 0),
      platformFees: Number(form.platformFees || 0),
      taxes: Number(form.taxes || 0),
      discount: Number(form.discount || 0),
      notes: form.notes || null,
      soldAt: form.soldAt || undefined,
      items: form.items.map((item) => ({
        inventoryId: item.inventoryId,
        quantity: Number(item.quantity || 0),
        notes: item.notes || null,
      })),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await editSale(sale.id, buildPayload());
      } else {
        await addSale(buildPayload());
      }

      await onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'enregistrer la vente.");
    } finally {
      setLoading(false);
    }
  }

  function addLine() {
    setForm((previous) => ({ ...previous, items: [...previous.items, { inventoryId: "", quantity: 1, notes: "" }] }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">Client</label>
          <select name="customerId" value={form.customerId} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3">
            <option value="">Sélectionner un client</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name || customer.company || customer.email || customer.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Plateforme</label>
          <select name="platform" value={form.platform} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3">
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {getPurchaseSourceLabel(platform)}
              </option>
            ))}
          </select>
          {errors.platform && <p className="mt-1 text-sm text-red-600">{errors.platform}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3">
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "PENDING"
                  ? "En attente"
                  : status === "PAID"
                    ? "Payée"
                    : status === "SHIPPED"
                      ? "Expédiée"
                      : status === "CANCELLED"
                        ? "Annulée"
                        : status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
          <input type="date" name="soldAt" value={form.soldAt} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Nom client</label>
          <input name="customerName" value={form.customerName} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" placeholder="Nom du client" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email client</label>
          <input name="customerEmail" value={form.customerEmail} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" placeholder="client@example.com" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Remise</label>
          <input type="number" min="0" step="0.01" name="discount" value={form.discount} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Frais de port</label>
          <input type="number" min="0" step="0.01" name="shippingCost" value={form.shippingCost} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Frais plateforme</label>
          <input type="number" min="0" step="0.01" name="platformFees" value={form.platformFees} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Taxes</label>
          <input type="number" min="0" step="0.01" name="taxes" value={form.taxes} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
        <textarea name="notes" rows={4} value={form.notes} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" placeholder="Notes" />
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Articles vendus</h3>
          <button type="button" onClick={addLine} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Ajouter un article
          </button>
        </div>

        {form.items.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun article sélectionné.</p>
        ) : (
          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div key={`${item.inventoryId || index}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-[2fr_1fr_1fr]">
                <div>
                  <label className="mb-2 block text-sm text-slate-700">Article</label>
                  <select value={item.inventoryId} onChange={(event) => handleItemChange(index, "inventoryId", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5">
                    <option value="">Sélectionner</option>
                    {inventoryItems.map((inventoryItem) => (
                      <option key={inventoryItem.id} value={inventoryItem.id}>
                        {inventoryItem.title || inventoryItem.sku || inventoryItem.id}
                      </option>
                    ))}
                  </select>
                  {errors[`items.${index}.inventoryId`] && <p className="mt-1 text-sm text-red-600">{errors[`items.${index}.inventoryId`]}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-700">Quantité</label>
                  <input type="number" min="1" value={item.quantity} onChange={(event) => handleItemChange(index, "quantity", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5" />
                  {errors[`items.${index}.quantity`] && <p className="mt-1 text-sm text-red-600">{errors[`items.${index}.quantity`]}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-700">Notes</label>
                  <input type="text" value={item.notes || ""} onChange={(event) => handleItemChange(index, "notes", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5" />
                </div>
              </div>
            ))}
          </div>
        )}
        {errors.items && <p className="mt-3 text-sm text-red-600">{errors.items}</p>}
      </div>

      <div className="rounded-lg bg-slate-100 p-4 text-right">
        <div className="text-xl font-bold text-slate-900">Articles sélectionnés : {totals}</div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="rounded-lg border px-5 py-3">
          Annuler
        </button>

        <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

export default SaleForm;
