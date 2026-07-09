import { X } from "lucide-react";
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

function PurchaseDetails({ open, purchase, onClose }) {
  if (!open || !purchase) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {purchase.purchaseNumber}
            </h2>

            <p className="mt-1 text-slate-500">
              {purchase.supplier?.name ??
                purchase.supplier?.company ??
                "Fournisseur"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900"
            title="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-slate-500">Plateforme</p>
            <p className="font-medium">{getPurchaseSourceLabel(purchase.platform)}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-slate-500">Statut</p>
            <p className="font-medium">{getPurchaseStatusLabel(purchase.status)}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-slate-500">Date</p>
            <p className="font-medium">
              {formatDate(purchase.purchasedAt)}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="font-medium">
              {formatAmount(
                purchase.totalAmount,
                purchase.currency
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border p-4">
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <div>
              <p className="text-sm text-slate-500">
                Articles
              </p>
              <p className="font-medium">
                {purchase.totalItems ?? 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Port
              </p>
              <p className="font-medium">
                {formatAmount(
                  purchase.shippingCost,
                  purchase.currency
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Taxes
              </p>
              <p className="font-medium">
                {formatAmount(
                  purchase.taxes,
                  purchase.currency
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Remise
              </p>
              <p className="font-medium">
                {formatAmount(
                  purchase.discount,
                  purchase.currency
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold">
            Lignes
          </h3>

          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Quantite
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Prix
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {purchase.purchaseItems?.length ? (
                  purchase.purchaseItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3">
                        {formatAmount(
                          item.unitPrice,
                          purchase.currency
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatAmount(
                          item.totalPrice,
                          purchase.currency
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Aucune ligne.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {purchase.notes && (
          <div className="mt-6 rounded-lg border p-4">
            <p className="text-sm text-slate-500">Notes</p>
            <p className="mt-2 whitespace-pre-wrap">
              {purchase.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PurchaseDetails;
