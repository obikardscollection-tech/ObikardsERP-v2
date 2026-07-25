import SearchCategory from "./SearchCategory";
import SearchEmptyState from "./SearchEmptyState";
import SearchLoadingState from "./SearchLoadingState";

function GlobalSearchResults({
  loading,
  error,
  hasSearched,
  query,
  totalResults,
  categoryOrder = [],
  categoryLabels = {},
  resultsByCategory = {},
  onSelectResult,
  selectedResultId,
}) {
  if (loading) {
    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <SearchLoadingState />
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        {error ? error : `${totalResults} resultat(s)`}
      </div>

      {error ? null : totalResults === 0 ? (
        <SearchEmptyState query={query} />
      ) : (
        <div className="space-y-4 overflow-y-auto p-3">
          {categoryOrder.map((category) => (
            <SearchCategory
              key={category}
              label={categoryLabels[category] || category}
              results={resultsByCategory[category] || []}
              onSelectResult={onSelectResult}
              selectedResultId={selectedResultId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GlobalSearchResults;
