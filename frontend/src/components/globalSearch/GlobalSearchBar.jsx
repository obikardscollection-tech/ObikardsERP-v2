import { Search, X } from "lucide-react";

function GlobalSearchBar({
  value,
  onChange,
  onClear,
  onFocus,
  onKeyDown,
  loading = false,
  placeholder = "Rechercher partout...",
  inputRef,
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-9 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-blue-500"
      />

      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {loading ? (
        <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-400 animate-pulse" />
      ) : null}
    </div>
  );
}

export default GlobalSearchBar;
