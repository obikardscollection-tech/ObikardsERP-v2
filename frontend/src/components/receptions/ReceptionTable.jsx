import { Eye, Pencil, Trash2 } from "lucide-react";
import { getReceptionStatusLabel } from "../../constants/labels";
import { formatReceptionDate, getReceptionStatus, getReceptionSupplierName } from "../../utils/receptionUtils";

function SortableHeader({ field, onSort, getSortMeta, children }) {
  const meta = getSortMeta
    ? getSortMeta(field)
    : {
      isActive: false,
      direction: null,
      ariaSort: "none",
      ariaLabel: `Trier par ${children}`,
    };

  return (
    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700" aria-sort={meta.ariaSort}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center rounded-md px-1 py-0.5 text-left transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label={meta.ariaLabel}
      >
        {children}
        <span className="ml-2 text-xs font-semibold text-blue-600" aria-hidden="true">
          {meta.isActive ? (meta.direction === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

function ReceptionTable({
  receptions = [],
  onView,
  onEdit,
  onDelete,
  onReceiveAll,
  getSortMeta,
  onSort,
  selectedItems,
  onToggleSelect,
  onToggleSelectAll,
  refreshing,
}) {
  const selectedSet = new Set(selectedItems);
  const allSelected = receptions.length > 0 && receptions.every((reception) => selectedSet.has(reception.id));
  const selectedOnPage = receptions.filter((reception) => selectedSet.has(reception.id)).length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
        {refreshing ? "Mise à jour en cours..." : `${selectedOnPage} sélectionnée(s) sur cette vue`}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full">
          <thead className="bg-slate-100">
            <tr>
            <th className="w-12 px-4 py-4">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleSelectAll(receptions)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                aria-label="Sélectionner les lignes affichées"
              />
            </th>

            <SortableHeader field="receptionNumber" onSort={onSort} getSortMeta={getSortMeta}>Référence</SortableHeader>
            <SortableHeader field="_purchaseNumber" onSort={onSort} getSortMeta={getSortMeta}>Achat</SortableHeader>
            <SortableHeader field="receivedAt" onSort={onSort} getSortMeta={getSortMeta}>Date</SortableHeader>
            <SortableHeader field="_supplierName" onSort={onSort} getSortMeta={getSortMeta}>Fournisseur</SortableHeader>
            <SortableHeader field="_itemCount" onSort={onSort} getSortMeta={getSortMeta}>Articles</SortableHeader>
            <SortableHeader field="_status" onSort={onSort} getSortMeta={getSortMeta}>Statut</SortableHeader>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>

        <tbody>
          {receptions.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                Aucune réception.
              </td>
            </tr>
          ) : (
            receptions.map((reception) => {
              const status = getReceptionStatus(reception);
              const supplierName = getReceptionSupplierName(reception);
              const canReceiveAll = Number(reception.remainingQuantity || 0) > 0;
              const isVirtual = Boolean(reception.isVirtual);

              return (
                <tr key={reception.id} className={`border-t ${selectedSet.has(reception.id) ? "bg-blue-50" : ""}`}>
                  <td className="px-4 py-4 align-middle">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(reception.id)}
                      onChange={() => onToggleSelect(reception.id)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Sélectionner ${reception.receptionNumber || "réception"}`}
                    />
                  </td>

                  <td className="px-6 py-4 font-mono font-semibold text-blue-600">{reception.receptionNumber || "-"}</td>
                  <td className="px-6 py-4">{reception.purchase?.purchaseNumber || "-"}</td>
                  <td className="px-6 py-4">{formatReceptionDate(reception.receivedAt)}</td>
                  <td className="px-6 py-4">{supplierName}</td>
                  <td className="px-6 py-4">{reception.receptionItems?.length ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : status === "PARTIALLY_RECEIVED" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                      {getReceptionStatusLabel(status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      {canReceiveAll ? (
                        <button
                          type="button"
                          onClick={() => onReceiveAll(reception)}
                          className="text-emerald-600 hover:text-emerald-800"
                          title="Tout recevoir"
                        >
                          Tout recevoir
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => onView(reception)}
                        className="text-slate-600 hover:text-slate-900"
                        title="Voir"
                        aria-label={`Voir ${reception.receptionNumber || "la reception"}`}
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(reception)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                        aria-label={`Modifier ${reception.receptionNumber || "la reception"}`}
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(reception)}
                        disabled={isVirtual}
                        className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                        title={isVirtual ? "Plan de réception non supprimable" : "Supprimer"}
                        aria-label={isVirtual ? `Suppression indisponible pour ${reception.receptionNumber || "ce plan"}` : `Supprimer ${reception.receptionNumber || "la reception"}`}
                      >
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
    </div>
  );
}

export default ReceptionTable;
