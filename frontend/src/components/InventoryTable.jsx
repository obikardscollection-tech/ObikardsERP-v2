import InventoryActions from "./inventory/InventoryActions";
import { getInventoryCategoryLabel, getInventoryStatusLabel } from "../constants/labels";

export default function InventoryTable({
  items = [],
  onEdit,
  onDelete,
  onAdjustStock,
  sortField,
  sortDirection,
  getSortMeta,
  onSort,
  selectedItems,
  onToggleSelect,
  onToggleSelectAll,
  refreshing,
}) {
  const selectedSet = new Set(selectedItems);

  function renderSortIcon(field) {
    const meta = getSortMeta
      ? getSortMeta(field)
      : {
        isActive: sortField === field,
        direction: sortField === field ? sortDirection : null,
      };

    if (!meta.isActive) {
      return (
        <span className="ml-2 text-sm text-slate-400" aria-hidden="true">
          <span className="inline-block -translate-y-px">↕</span>
        </span>
      );
    }

    return (
      <span className="ml-2 text-xs font-semibold text-blue-600" aria-hidden="true">
        {meta.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  }

  function SortableHeader({ field, children }) {
    const meta = getSortMeta
      ? getSortMeta(field)
      : {
        ariaSort: sortField === field
          ? sortDirection === "asc"
            ? "ascending"
            : "descending"
          : "none",
        ariaLabel: `Trier par ${children}`,
      };

    return (
      <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200" aria-sort={meta.ariaSort}>
        <button
          type="button"
          onClick={() => onSort(field)}
          className="inline-flex items-center rounded-md px-2 py-1 text-left transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label={meta.ariaLabel}
        >
          {children}
          {renderSortIcon(field)}
        </button>
      </th>
    );
  }

  const allSelected =
    items.length > 0 &&
    items.every((item) => selectedSet.has(item.id));

  const selectedOnPage = items.filter((item) => selectedSet.has(item.id)).length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
        {refreshing ? "Mise a jour en cours..." : `${selectedOnPage} selectionne(s) sur cette vue`}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse">
          <thead className="bg-slate-900 text-white">
          <tr>
            <th className="w-12 p-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleSelectAll(items)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                aria-label="Selectionner les lignes affichees"
              />
            </th>

            <SortableHeader field="sku">
              SKU
            </SortableHeader>

            <SortableHeader field="category">
              Catégorie
            </SortableHeader>

            <SortableHeader field="title">
              Titre
            </SortableHeader>

            <SortableHeader field="purchasePrice">
              Achat
            </SortableHeader>

            <SortableHeader field="salePrice">
              Vente
            </SortableHeader>

            <SortableHeader field="quantity">
              Qté
            </SortableHeader>

            <SortableHeader field="status">
              Statut
            </SortableHeader>

            <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-200">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan="9"
                className="p-10 text-center text-gray-500"
              >
                Aucun article dans l'inventaire.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={`border-b border-slate-100 transition hover:bg-slate-50 focus-within:bg-slate-50 ${
                  selectedSet.has(item.id)
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <td className="p-3 align-middle">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Selectionner ${item.sku || item.title || "article"}`}
                  />
                </td>

                <td className="p-3 align-middle font-medium text-slate-900">
                  {item.sku}
                </td>

                <td className="p-3 align-middle text-slate-700">
                  {getInventoryCategoryLabel(item.category)}
                </td>

                <td className="p-3 align-middle text-slate-700">
                  {item.title}
                </td>

                <td className="p-3 align-middle tabular-nums text-slate-700">
                  {item.purchasePrice ?? "-"} €
                </td>

                <td className="p-3 align-middle tabular-nums text-slate-700">
                  {item.salePrice ?? "-"} €
                </td>

                <td className="p-3 align-middle tabular-nums font-medium text-slate-700">
                  {item.quantity}
                </td>

                <td className="p-3 align-middle">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.status === "IN_STOCK"
                        ? "bg-green-100 text-green-700"
                        : item.status === "SOLD"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {getInventoryStatusLabel(item.status)}
                  </span>
                </td>

                <td className="p-3 align-middle">
                  <InventoryActions
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAdjustStock={onAdjustStock}
                  />
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