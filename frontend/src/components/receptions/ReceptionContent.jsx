import ReceptionFilters from "./ReceptionFilters";
import ReceptionPagination from "./ReceptionPagination";
import ReceptionStats from "./ReceptionStats";
import ReceptionTable from "./ReceptionTable";
import ReceptionToolbar from "./ReceptionToolbar";

function ReceptionLoadingSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" role="status" aria-live="polite">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-11 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}

export default function ReceptionContent({
  loading,
  refreshing,
  error,
  statsReceptions,
  receptions,
  totalResults,
  purchases,
  filtersOpen,
  onToggleFilters,
  onRetry,
  onRefresh,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onReceiveAll,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  purchaseFilter,
  onPurchaseChange,
  dateFilter,
  onDateChange,
  onReset,
  sortField,
  sortDirection,
  getSortMeta,
  onSort,
  selectedItems,
  onToggleSelect,
  onToggleSelectAll,
  clearSelection,
  currentPage,
  totalPages,
  itemsPerPage,
  pageStart,
  pageEnd,
  onPageChange,
  onItemsPerPageChange,
}) {
  const hasItems = totalResults > 0;
  const receptionsForStats = statsReceptions || receptions;

  return (
    <section className="space-y-6">
      <ReceptionStats receptions={receptionsForStats} />

      <ReceptionToolbar
        onCreate={onCreate}
        onRefresh={onRefresh}
        refreshing={refreshing}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        filtersOpen={filtersOpen}
        onToggleFilters={onToggleFilters}
        resultCount={totalResults}
        selectedCount={selectedItems.length}
        onClearSelection={clearSelection}
      />

      {filtersOpen ? (
        <ReceptionFilters
          dateFilter={dateFilter}
          onDateChange={onDateChange}
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          purchaseFilter={purchaseFilter}
          onPurchaseChange={onPurchaseChange}
          purchases={purchases}
          onReset={onReset}
        />
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="text-sm font-medium">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm text-white transition hover:bg-rose-700"
          >
            Réessayer
          </button>
        </div>
      ) : loading ? (
        <ReceptionLoadingSkeleton />
      ) : !hasItems ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Aucune réception trouvée</h3>
          <p className="mt-2 text-sm text-slate-500">
            Ajustez la recherche ou les filtres pour voir des résultats.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <ReceptionTable
          receptions={receptions}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onReceiveAll={onReceiveAll}
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

      {hasItems ? (
        <ReceptionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          totalResults={totalResults}
          pageStart={pageStart}
          pageEnd={pageEnd}
        />
      ) : null}
    </section>
  );
}