import { Plus, RefreshCw, SlidersHorizontal } from "lucide-react";

import ReceptionSearch from "./ReceptionSearch";

function ReceptionToolbar({
  onCreate,
  onRefresh,
  refreshing,
  searchTerm,
  onSearchChange,
  filtersOpen,
  onToggleFilters,
  resultCount,
  selectedCount,
  onClearSelection,
}) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Filtres et recherche</p>

        <div className="flex items-center gap-2">
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {resultCount} résultat(s)
          </p>

          {selectedCount > 0 ? (
            <button
              type="button"
              onClick={onClearSelection}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-200"
            >
              {selectedCount} sélectionnée(s) • Effacer
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onCreate} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700">
            <Plus size={18} />
            Nouvelle réception
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </button>

          <button type="button" onClick={onToggleFilters} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 ${filtersOpen ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
            <SlidersHorizontal size={18} />
            Filtres
          </button>
        </div>

        <div className="w-full xl:w-[360px]">
          <ReceptionSearch value={searchTerm} onChange={onSearchChange} />
        </div>
      </div>
    </div>
  );
}

export default ReceptionToolbar;
