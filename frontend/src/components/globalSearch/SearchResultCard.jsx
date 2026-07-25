import { ChevronRight } from "lucide-react";

function SearchResultCard({ result, onSelect, isSelected = false }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      data-search-result-id={result.id}
      aria-selected={isSelected}
      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
        isSelected
          ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{result.title}</p>

        {result.subtitle ? (
          <p className="truncate text-xs text-slate-600">{result.subtitle}</p>
        ) : null}

        {Array.isArray(result.meta) && result.meta.length > 0 ? (
          <p className="mt-1 truncate text-[11px] text-slate-500">{result.meta.join(" • ")}</p>
        ) : null}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}

export default SearchResultCard;
