import { Search, RotateCcw } from "lucide-react";

function CustomerFilters({
  searchTerm,
  onSearchChange,
  onReset,
}) {
  return (
    <div className="mb-6 rounded-xl bg-white p-6 shadow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 transition hover:bg-slate-100"
        >
          <RotateCcw size={18} />
          Réinitialiser
        </button>

      </div>
    </div>
  );
}

export default CustomerFilters;