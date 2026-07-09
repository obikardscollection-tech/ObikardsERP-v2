import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getPurchaseReceptions } from "../../services/receptionService";

const defaultForm = {
  purchaseId: "",
  receivedAt: "",
  notes: "",
  items: [],
};

function formatDateInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function ReceptionForm({ reception, purchases = [], onClose, onSaved, addReception, editReception }) {
  const isEditing = Boolean(reception);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (reception) {
      setForm({
        purchaseId: reception.purchaseId || "",
        receivedAt: formatDateInput(reception.receivedAt),
        notes: reception.notes || "",
        items: reception.receptionItems?.map((item) => ({
          purchaseItemId: item.purchaseItemId,
          quantityReceived: item.quantityReceived,
          notes: item.notes || "",
        })) || [],
      });
    } else {
      setForm(defaultForm);
    }

    setErrors({});
  }, [reception]);

  useEffect(() => {
    async function loadPurchaseItems() {
      if (!form.purchaseId) {
        setPurchaseItems([]);
        return;
      }

      try {
        const data = await getPurchaseReceptions(form.purchaseId);
        const purchase = purchases.find((entry) => entry.id === form.purchaseId);
        const availableItems = (purchase?.purchaseItems || []).map((item) => ({
          ...item,
          currentReceived: (data || []).reduce((sum, reception) => sum + Number(reception.receptionItems?.find((entry) => entry.purchaseItemId === item.id)?.quantityReceived || 0), 0),
        }));

        setPurchaseItems(availableItems);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les lignes d'achat.");
      }
    }

    loadPurchaseItems();
  }, [form.purchaseId, purchases]);

  const totals = useMemo(() => {
    return form.items.reduce((total, item) => total + Number(item.quantityReceived || 0), 0);
  }, [form]);

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

    if (!form.purchaseId) {
      newErrors.purchaseId = "Le choix d'un achat est obligatoire.";
    }

    if (!form.items.length) {
      newErrors.items = "Au moins une ligne est obligatoire.";
    }

    form.items.forEach((item, index) => {
      if (!item.purchaseItemId) {
        newErrors[`items.${index}.purchaseItemId`] = "La ligne est obligatoire.";
      }

      if (Number(item.quantityReceived || 0) <= 0) {
        newErrors[`items.${index}.quantityReceived`] = "La quantité reçue doit être supérieure à 0.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function buildPayload() {
    return {
      purchaseId: form.purchaseId,
      receivedAt: form.receivedAt || undefined,
      notes: form.notes || null,
      items: form.items.map((item) => ({
        purchaseItemId: item.purchaseItemId,
        quantityReceived: Number(item.quantityReceived || 0),
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
        await editReception(reception.id, buildPayload());
      } else {
        await addReception(buildPayload());
      }

      await onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'enregistrer la réception.");
    } finally {
      setLoading(false);
    }
  }

  function addLine() {
    setForm((previous) => ({ ...previous, items: [...previous.items, { purchaseItemId: "", quantityReceived: 1, notes: "" }] }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Achat réceptionnable</label>
          <select name="purchaseId" value={form.purchaseId} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3">
            <option value="">Sélectionner un achat</option>
            {purchases.map((purchase) => (
              <option key={purchase.id} value={purchase.id}>
                {purchase.purchaseNumber} — {purchase.supplier?.name || purchase.supplier?.company || "-"}
              </option>
            ))}
          </select>
          {errors.purchaseId && <p className="mt-1 text-sm text-red-600">{errors.purchaseId}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
          <input type="date" name="receivedAt" value={form.receivedAt} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
        <textarea name="notes" rows={4} value={form.notes} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-3" placeholder="Notes" />
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Lignes reçues</h3>
          <button type="button" onClick={addLine} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Ajouter une ligne
          </button>
        </div>

        {form.items.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune ligne sélectionnée.</p>
        ) : (
          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div key={`${item.purchaseItemId || index}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-[2fr_1fr_1fr]">
                <div>
                  <label className="mb-2 block text-sm text-slate-700">Article</label>
                  <select value={item.purchaseItemId} onChange={(event) => handleItemChange(index, "purchaseItemId", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5">
                    <option value="">Sélectionner</option>
                    {purchaseItems.map((purchaseItem) => (
                      <option key={purchaseItem.id} value={purchaseItem.id}>
                        {purchaseItem.name} — Qty {purchaseItem.quantity}
                      </option>
                    ))}
                  </select>
                  {errors[`items.${index}.purchaseItemId`] && <p className="mt-1 text-sm text-red-600">{errors[`items.${index}.purchaseItemId`]}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-700">Quantité reçue</label>
                  <input type="number" min="1" value={item.quantityReceived} onChange={(event) => handleItemChange(index, "quantityReceived", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5" />
                  {errors[`items.${index}.quantityReceived`] && <p className="mt-1 text-sm text-red-600">{errors[`items.${index}.quantityReceived`]}</p>}
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
        <div className="text-xl font-bold text-slate-900">Total reçu : {totals}</div>
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

export default ReceptionForm;
