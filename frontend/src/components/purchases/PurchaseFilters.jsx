import { RotateCcw } from "lucide-react";

import PurchaseSearch from "./PurchaseSearch";
import { getPurchaseSourceLabel, getPurchaseStatusLabel } from "../../constants/labels";

function PurchaseFilters({
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformChange,
  statusFilter,
  onStatusChange,
  platforms = [],
  statuses = [],
  onReset,
}) {
  return (
    <div className="mb-6 rounded-xl bg-white p-6 shadow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <PurchaseSearch
          value={searchTerm}
          onChange={onSearchChange}
        />

        <select
          value={platformFilter}
          onChange={(event) =>
            onPlatformChange(event.target.value)
          }
          className="rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Toutes plateformes</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {getPurchaseSourceLabel(platform)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          className="rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tous statuts</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {getPurchaseStatusLabel(status)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 transition hover:bg-slate-100"
        >
          <RotateCcw size={18} />
          Reinitialiser
        </button>
      </div>
    </div>
  );
}

export default PurchaseFilters;
