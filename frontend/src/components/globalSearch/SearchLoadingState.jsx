function SearchLoadingState() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border border-slate-200 bg-slate-100 px-3 py-2">
          <div className="h-3 w-1/2 rounded bg-slate-300" />
          <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default SearchLoadingState;
