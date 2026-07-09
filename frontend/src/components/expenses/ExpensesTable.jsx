import { Eye, Pencil, Trash2 } from "lucide-react";
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

function ExpensesTable({ expenses = [], onView, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">N° dépense</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Catégorie</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Fournisseur</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Paiement</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Montant</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>

        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                Aucune dépense.
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.id} className="border-t">
                <td className="px-6 py-4 font-mono font-semibold text-blue-600">{expense.expenseNumber || "-"}</td>
                <td className="px-6 py-4">{formatDate(expense.expenseDate)}</td>
                <td className="px-6 py-4">{getExpenseCategoryLabel(expense.category) || "-"}</td>
                <td className="px-6 py-4">{expense.supplier?.name || expense.supplier?.company || "-"}</td>
                <td className="px-6 py-4">{getPaymentMethodLabel(expense.paymentMethod) || "-"}</td>
                <td className="px-6 py-4">{formatAmount(expense.amountTTC)}</td>
                <td className="px-6 py-4">{getStatusLabel(expense.paymentStatus) || "-"}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button type="button" onClick={() => onView(expense)} className="text-slate-600 hover:text-slate-900" title="Voir">
                      <Eye size={18} />
                    </button>

                    <button type="button" onClick={() => onEdit(expense)} className="text-blue-600 hover:text-blue-800" title="Modifier">
                      <Pencil size={18} />
                    </button>

                    <button type="button" onClick={() => onDelete(expense)} className="text-red-600 hover:text-red-800" title="Supprimer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ExpensesTable;
