import { Search } from "lucide-react";

function PurchaseSearch({ value, onChange }) {
  return (
    <div className="relative flex-1">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        placeholder="Rechercher un achat..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}

export default PurchaseSearch;
