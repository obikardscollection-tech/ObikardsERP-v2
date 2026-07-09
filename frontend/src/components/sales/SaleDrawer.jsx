import { X } from "lucide-react";

import SaleForm from "./SaleForm";
import SaleItems from "./SaleItems";

function SaleDrawer({ open, sale, inventoryItems = [], customers = [], onClose, onSaved, addSale, editSale }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{sale ? "Modifier une vente" : "Ajouter une vente"}</h2>

          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900" title="Fermer">
            <X size={24} />
          </button>
        </div>

        <SaleForm sale={sale} inventoryItems={inventoryItems} customers={customers} onClose={onClose} onSaved={onSaved} addSale={addSale} editSale={editSale} />

        {sale && (
          <div className="mt-8 rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Articles vendus</h3>
            <SaleItems items={sale.saleItems || []} />
          </div>
        )}
      </div>
    </div>
  );
}

export default SaleDrawer;
