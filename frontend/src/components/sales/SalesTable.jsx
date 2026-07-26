import { Eye, Pencil, Trash2 } from "lucide-react";
import { getSalePlatformLabel, getStatusLabel } from "../../constants/labels";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("fr-FR");
}

function formatAmount(value) {
  return `${Number(value ?? 0).toFixed(2)} EUR`;
}

function SalesTable({ sales = [], onView, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Référence</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Client</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Plateforme</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Articles</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Total</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>

        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                Aucune vente.
              </td>
            </tr>
          ) : (
            sales.map((sale) => (
              <tr key={sale.id} className="border-t">
                <td className="px-6 py-4 font-mono font-semibold text-blue-600">{sale.orderNumber || "-"}</td>
                <td className="px-6 py-4">{formatDate(sale.soldAt)}</td>
                <td className="px-6 py-4">{sale.customer?.name || sale.customerName || sale.customer?.company || "-"}</td>
                <td className="px-6 py-4">{getSalePlatformLabel(sale.platform) || "-"}</td>
                <td className="px-6 py-4">{sale.totalItems ?? 0}</td>
                <td className="px-6 py-4">{formatAmount(sale.totalAmount)}</td>
                <td className="px-6 py-4">{getStatusLabel(sale.status) || "-"}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onView(sale)}
                      className="text-slate-600 hover:text-slate-900"
                      title="Voir"
                      aria-label={`Voir ${sale.orderNumber || "la vente"}`}
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(sale)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                      aria-label={`Modifier ${sale.orderNumber || "la vente"}`}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(sale)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                      aria-label={`Supprimer ${sale.orderNumber || "la vente"}`}
                    >
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
    </div>
  );
}

export default SalesTable;
