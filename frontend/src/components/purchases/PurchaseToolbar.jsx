import { Plus } from "lucide-react";

function PurchaseToolbar({ onCreate }) {
  return (
    <div className="mb-6 flex justify-end">
      <button
        type="button"
        onClick={onCreate}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
      >
        <Plus size={18} />
        Ajouter
      </button>
    </div>
  );
}

export default PurchaseToolbar;
