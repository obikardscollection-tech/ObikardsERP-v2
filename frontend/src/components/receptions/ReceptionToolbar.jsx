import { Plus, RefreshCw, SlidersHorizontal } from "lucide-react";

import ReceptionSearch from "./ReceptionSearch";

function ReceptionToolbar({ onCreate, onRefresh, searchTerm, onSearchChange, filtersOpen, onToggleFilters }) {
  return (
    <div className="mb-4 flex flex-col gap-4 rounded-xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onCreate} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700">
          <Plus size={18} />
          Nouvelle réception
        </button>

        <button type="button" onClick={onRefresh} className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 hover:bg-slate-50">
          <RefreshCw size={18} />
          Actualiser
        </button>

        <button type="button" onClick={onToggleFilters} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 ${filtersOpen ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
          <SlidersHorizontal size={18} />
          Filtres
        </button>

        <button type="button" className="rounded-lg border border-slate-200 px-4 py-2.5 text-slate-500" disabled>
          Réception complète
        </button>

        <button type="button" className="rounded-lg border border-slate-200 px-4 py-2.5 text-slate-500" disabled>
          Tout recevoir
        </button>
      </div>

      <ReceptionSearch value={searchTerm} onChange={onSearchChange} />
    </div>
  );
}

export default ReceptionToolbar;
