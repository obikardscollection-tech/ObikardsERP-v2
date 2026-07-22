export default function ReceptionPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  totalResults,
  pageStart,
  pageEnd,
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-slate-600">
        {totalResults === 0
          ? "Aucun resultat"
          : `Affichage ${pageStart}-${pageEnd} sur ${totalResults}`}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700" htmlFor="reception-items-per-page">
          Lignes
          <select
            id="reception-items-per-page"
            value={itemsPerPage}
            onChange={(event) => onItemsPerPageChange(Number(event.target.value))}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={999999}>Tous</option>
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ◀
          </button>

          <span className="min-w-28 text-center text-sm font-medium text-slate-700">
            Page {totalPages === 0 ? 0 : currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
