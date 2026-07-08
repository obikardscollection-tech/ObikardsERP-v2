import {
  Pencil,
  Trash2,
} from "lucide-react";

function PurchaseTable({
  purchases = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              N° Achat
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
              Fournisseur
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
                colSpan="6"
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
                <td className="px-6 py-4 font-medium">
                  {purchase.purchaseNumber}
                </td>

                <td className="px-6 py-4">
                  {purchase.supplier?.name ??
                    "-"}
                </td>

                <td className="px-6 py-4">
                  {purchase.totalItems ?? 0}
                </td>

                <td className="px-6 py-4">
                  {Number(
                    purchase.totalAmount ?? 0
                  ).toFixed(2)} €
                </td>

                <td className="px-6 py-4">
                  {purchase.purchaseDate
                    ? new Date(
                        purchase.purchaseDate
                      ).toLocaleDateString(
                        "fr-FR"
                      )
                    : "-"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() =>
                        onEdit(purchase)
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() =>
                        onDelete(purchase)
                      }
                      className="text-red-600 hover:text-red-800"
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