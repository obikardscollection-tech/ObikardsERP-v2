import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getExpenseCategoryLabel,
  getPaymentMethodLabel,
  getStatusLabel,
} from "../../constants/labels";

const defaultForm = {
  category: "OTHER",
  supplierId: "",
  title: "",
  description: "",
  amountHT: 0,
  tax: 0,
  amountTTC: 0,
  paymentMethod: "BANK_TRANSFER",
  paymentStatus: "PAID",
  expenseDate: "",
  invoiceNumber: "",
  receiptUrl: "",
  notes: "",
};

const categories = ["OFFICE", "SHIPPING", "SUPPLIES", "SOFTWARE", "MARKETING", "TRAVEL", "FUEL", "BANK", "ACCOUNTING", "INSURANCE", "RENT", "PHONE", "INTERNET", "EBAY_FEES", "WHATNOT_FEES", "WOOCOMMERCE_FEES", "PAYPAL_FEES", "STRIPE_FEES", "SALARY", "TRAINING", "OTHER"];
const paymentMethods = ["CARD", "BANK_TRANSFER", "PAYPAL", "STRIPE", "CASH", "CHECK", "OTHER"];
const paymentStatuses = ["PAID", "PENDING", "REFUNDED"];

function formatDateInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function ExpenseForm({ expense, suppliers = [], onClose, onSaved, addExpense, editExpense }) {
  const isEditing = Boolean(expense);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setForm({
        category: expense.category || "OTHER",
        supplierId: expense.supplierId || "",
        title: expense.title || "",
        description: expense.description || "",
        amountHT: Number(expense.amountHT || 0),
        tax: Number(expense.tax || 0),
        amountTTC: Number(expense.amountTTC || 0),
        paymentMethod: expense.paymentMethod || "BANK_TRANSFER",
        paymentStatus: expense.paymentStatus || "PAID",
        expenseDate: formatDateInput(expense.expenseDate),
        invoiceNumber: expense.invoiceNumber || "",
        receiptUrl: expense.receiptUrl || "",
        notes: expense.notes || "",
      });
    } else {
      setForm(defaultForm);
    }

    setErrors({});
  }, [expense]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  }

  function handleNumberChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: Number(value || 0) }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  }

  function validate() {
    const newErrors = {};

    if (!form.category) {
      newErrors.category = "La catégorie est obligatoire.";
    }

    if (!form.title.trim()) {
      newErrors.title = "Le titre est obligatoire.";
    }

    if (!form.paymentMethod) {
      newErrors.paymentMethod = "La méthode de paiement est obligatoire.";
    }

    if (!form.expenseDate) {
      newErrors.expenseDate = "La date est obligatoire.";
    }

    if (Number(form.amountTTC || 0) <= 0) {
      newErrors.amountTTC = "Le montant TTC doit être supérieur à 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function buildPayload() {
    return {
      category: form.category,
      supplierId: form.supplierId || undefined,
      title: form.title,
      description: form.description || null,
      amountHT: Number(form.amountHT || 0),
      tax: Number(form.tax || 0),
      amountTTC: Number(form.amountTTC || 0),
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
      expenseDate: form.expenseDate || new Date().toISOString(),
      invoiceNumber: form.invoiceNumber || null,
      receiptUrl: form.receiptUrl || null,
      notes: form.notes || null,
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
        await editExpense(expense.id, buildPayload());
      } else {
        await addExpense(buildPayload());
      }

      await onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'enregistrer la dépense.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Catégorie *</label>
          <select name="category" value={form.category} onChange={handleChange} className={`w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 ${errors.category ? "border-red-500" : "border-slate-200"}`}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getExpenseCategoryLabel(cat)}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Titre *</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Ex: Fournitures de bureau" className={`w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 ${errors.title ? "border-red-500" : "border-slate-200"}`} />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Détails de la dépense..." className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500" rows="3" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Montant HT</label>
          <input type="number" name="amountHT" value={form.amountHT} onChange={handleNumberChange} placeholder="0.00" step="0.01" className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">TVA</label>
          <input type="number" name="tax" value={form.tax} onChange={handleNumberChange} placeholder="0.00" step="0.01" className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Montant TTC *</label>
          <input type="number" name="amountTTC" value={form.amountTTC} onChange={handleNumberChange} placeholder="0.00" step="0.01" className={`w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 ${errors.amountTTC ? "border-red-500" : "border-slate-200"}`} />
          {errors.amountTTC && <p className="mt-1 text-sm text-red-600">{errors.amountTTC}</p>}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Fournisseur</label>
        <select name="supplierId" value={form.supplierId} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500">
          <option value="">Aucun</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name || supplier.company || supplier.email}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Méthode de paiement *</label>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={`w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 ${errors.paymentMethod ? "border-red-500" : "border-slate-200"}`}>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {getPaymentMethodLabel(method)}
              </option>
            ))}
          </select>
          {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Statut de paiement</label>
          <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange} className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500">
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Date *</label>
        <input type="date" name="expenseDate" value={form.expenseDate} onChange={handleChange} className={`w-full rounded-lg border p-2.5 outline-none focus:border-blue-500 ${errors.expenseDate ? "border-red-500" : "border-slate-200"}`} />
        {errors.expenseDate && <p className="mt-1 text-sm text-red-600">{errors.expenseDate}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">N° facture</label>
          <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} placeholder="Ex: INV-2026-001" className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Justificatif (URL)</label>
          <input type="url" name="receiptUrl" value={form.receiptUrl} onChange={handleChange} placeholder="https://..." className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Remarques supplémentaires..." className="w-full rounded-lg border border-slate-200 p-2.5 outline-none focus:border-blue-500" rows="3" />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:bg-slate-400">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>

        <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 hover:bg-slate-50">
          Annuler
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;
