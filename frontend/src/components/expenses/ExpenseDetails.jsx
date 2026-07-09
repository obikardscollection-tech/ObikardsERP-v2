import { X } from "lucide-react";
import { getExpenseCategoryLabel, getPaymentMethodLabel, getStatusLabel } from "../../constants/labels";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("fr-FR");
}

function formatAmount(value) {
  return `${Number(value ?? 0).toFixed(2)} EUR`;
}

function ExpenseDetails({ open, expense, onClose }) {
  if (!open || !expense) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{expense.expenseNumber}</h2>
            <p className="text-sm text-slate-500">Détails de la dépense</p>
          </div>

          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900" title="Fermer">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Informations générales</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Titre</p>
                <p className="font-medium">{expense.title || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Catégorie</p>
                <p className="font-medium">{getExpenseCategoryLabel(expense.category) || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-medium">{formatDate(expense.expenseDate)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Fournisseur</p>
                <p className="font-medium">{expense.supplier?.name || expense.supplier?.company || "-"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Paiement</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Méthode de paiement</p>
                <p className="font-medium">{getPaymentMethodLabel(expense.paymentMethod) || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Statut</p>
                <p className="font-medium">{getStatusLabel(expense.paymentStatus) || "-"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Montants</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Montant HT : {formatAmount(expense.amountHT)}</p>
              <p>TVA : {formatAmount(expense.tax)}</p>
              <p>Montant TTC : {formatAmount(expense.amountTTC)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Références</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">N° facture</p>
                <p className="font-medium">{expense.invoiceNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Justificatif</p>
                <p className="font-medium">{expense.receiptUrl ? "Présent" : "-"}</p>
              </div>
            </div>
          </div>

          {expense.description && (
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 font-semibold text-slate-800">Description</h3>
              <p className="text-sm text-slate-600">{expense.description}</p>
            </div>
          )}

          {expense.notes && (
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 font-semibold text-slate-800">Notes</h3>
              <p className="text-sm text-slate-600">{expense.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Dates</h3>
            <p className="text-sm text-slate-600">Créée le {formatDate(expense.createdAt)}</p>
            <p className="text-sm text-slate-600">Dernière mise à jour le {formatDate(expense.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseDetails;
