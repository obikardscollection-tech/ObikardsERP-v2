import SearchResultCard from "./SearchResultCard";

function SearchCategory({ label, results = [], onSelectResult, selectedResultId }) {
  if (results.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <header className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h4>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {results.length}
        </span>
      </header>

      <div className="space-y-2">
        {results.map((result) => (
          <SearchResultCard
            key={result.id}
            result={result}
            onSelect={onSelectResult}
            isSelected={result.id === selectedResultId}
          />
        ))}
      </div>
    </section>
  );
}

export default SearchCategory;
