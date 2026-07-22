import InventoryStats from "./InventoryStats";
import InventoryToolbar from "./InventoryToolbar";
import InventoryTable from "../InventoryTable";
import BulkActions from "./BulkActions";
import ExportActions from "./ExportActions";

function InventoryLoadingSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}

export default function InventoryContent({
  loading,
  refreshing,
  error,
  sortedItems,

  searchTerm,
  onSearchChange,

  categoryFilter,
  onCategoryChange,

  statusFilter,
  onStatusChange,

  categories,
  onReset,

  selectedItems,
  loadInventory,
  clearSelection,

  onEdit,
  onDelete,
  onAdjustStock,

  sortField,
  sortDirection,
  getSortMeta,
  onSort,

  onToggleSelect,
  onToggleSelectAll,
}) {
  const hasItems = sortedItems.length > 0;

  return (
    <section className="space-y-6">
      <InventoryStats
        items={sortedItems}
      />

      <InventoryToolbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryChange}
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
        categories={categories}
        onReset={onReset}
        resultCount={sortedItems.length}
      />

      <BulkActions
        selectedItems={selectedItems}
        loadInventory={loadInventory}
        clearSelection={clearSelection}
      />

      <ExportActions
        items={sortedItems}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => loadInventory()}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm text-white transition hover:bg-rose-700"
          >
            Reessayer
          </button>
        </div>
      ) : loading ? (
        <InventoryLoadingSkeleton />
      ) : !hasItems ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Aucun article trouve</h3>
          <p className="mt-2 text-sm text-slate-500">
            Ajustez la recherche ou les filtres pour voir des resultats.
          </p>
          <button
            onClick={onReset}
            className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reinitialiser les filtres
          </button>
        </div>
      ) : (
        <InventoryTable
          items={sortedItems}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdjustStock={onAdjustStock}
          sortField={sortField}
          sortDirection={sortDirection}
          getSortMeta={getSortMeta}
          onSort={onSort}
          selectedItems={selectedItems}
          onToggleSelect={onToggleSelect}
          onToggleSelectAll={onToggleSelectAll}
          refreshing={refreshing}
        />
      )}
    </section>
  );
}