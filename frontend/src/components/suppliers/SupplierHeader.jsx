import { Truck } from "lucide-react";

function SupplierHeader({
  totalSuppliers,
  onCreate,
}) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Fournisseurs
        </h1>

        <p className="mt-1 text-slate-500">
          {totalSuppliers} fournisseur(s)
        </p>
      </div>

      <button
        onClick={onCreate}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
      >
        <Truck size={20} />
        Ajouter un fournisseur
      </button>
    </div>
  );
}

export default SupplierHeader;