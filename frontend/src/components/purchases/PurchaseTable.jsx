import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { getPurchaseSourceLabel, getPurchaseStatusLabel } from "../../constants/labels";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("fr-FR");
}

function formatAmount(value, currency = "EUR") {
  return `${Number(value ?? 0).toFixed(2)} ${currency}`;
}

function PurchaseTable({
  purchases = [],
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              N achat
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Fournisseur
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Plateforme
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Statut
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Articles
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Total
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Date
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {purchases.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                className="px-6 py-10 text-center text-slate-500"
              >
                Aucun achat.
              </td>
            </tr>
          ) : (
            purchases.map((purchase) => (
              <tr
                key={purchase.id}
                className="border-t"
              >
                <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                  {purchase.purchaseNumber || "-"}
                </td>

                <td className="px-6 py-4">
                  {purchase.supplier?.name ??
                    purchase.supplier?.company ??
                    "-"}
                </td>

                <td className="px-6 py-4">
                  {getPurchaseSourceLabel(purchase.platform) || "-"}
                </td>

                <td className="px-6 py-4">
                  {getPurchaseStatusLabel(purchase.status) || "-"}
                </td>

                <td className="px-6 py-4">
                  {purchase.totalItems ?? 0}
                </td>

                <td className="px-6 py-4">
                  {formatAmount(
                    purchase.totalAmount,
                    purchase.currency
                  )}
                </td>

                <td className="px-6 py-4">
                  {formatDate(purchase.purchasedAt)}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onView(purchase)}
                      className="text-slate-600 hover:text-slate-900"
                      title="Voir"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(purchase)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(purchase)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
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
  );
}

export default PurchaseTable;
