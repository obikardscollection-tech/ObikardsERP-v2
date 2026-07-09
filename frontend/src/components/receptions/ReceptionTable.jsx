import { Eye, Pencil, Trash2 } from "lucide-react";
import { getReceptionStatusLabel } from "../../constants/labels";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("fr-FR");
}

function getReceptionStatus(reception) {
  if (!reception) {
    return "PENDING";
  }

  if (Number(reception.remainingQuantity || 0) <= 0) {
    return "COMPLETED";
  }

  if (Number(reception.totalQuantity || 0) <= 0) {
    return "PENDING";
  }

  return "PARTIALLY_RECEIVED";
}

function ReceptionTable({ receptions = [], onView, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Réception</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Achat</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Fournisseur</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Articles</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>

        <tbody>
          {receptions.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                Aucune réception.
              </td>
            </tr>
          ) : (
            receptions.map((reception) => {
              const status = getReceptionStatus(reception);

              return (
                <tr key={reception.id} className="border-t">
                  <td className="px-6 py-4 font-medium">{reception.receptionNumber}</td>
                  <td className="px-6 py-4">{reception.purchase?.purchaseNumber || "-"}</td>
                  <td className="px-6 py-4">{formatDate(reception.receivedAt)}</td>
                  <td className="px-6 py-4">{reception.purchase?.supplier?.name || reception.purchase?.supplier?.company || "-"}</td>
                  <td className="px-6 py-4">{reception.receptionItems?.length ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : status === "PARTIALLY_RECEIVED" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                      {getReceptionStatusLabel(status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button type="button" onClick={() => onView(reception)} className="text-slate-600 hover:text-slate-900" title="Voir">
                        <Eye size={18} />
                      </button>

                      <button type="button" onClick={() => onEdit(reception)} className="text-blue-600 hover:text-blue-800" title="Modifier">
                        <Pencil size={18} />
                      </button>

                      <button type="button" onClick={() => onDelete(reception)} className="text-red-600 hover:text-red-800" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReceptionTable;
