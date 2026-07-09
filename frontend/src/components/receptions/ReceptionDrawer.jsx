import { X } from "lucide-react";

import ReceptionForm from "./ReceptionForm";
import ReceptionItems from "./ReceptionItems";

function ReceptionDrawer({ open, reception, purchases = [], onClose, onSaved, addReception, editReception }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{reception ? "Modifier une réception" : "Ajouter une réception"}</h2>

          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900" title="Fermer">
            <X size={24} />
          </button>
        </div>

        <ReceptionForm
          reception={reception}
          purchases={purchases}
          onClose={onClose}
          onSaved={onSaved}
          addReception={addReception}
          editReception={editReception}
        />

        {reception && (
          <div className="mt-8 rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Lignes déjà reçues</h3>
            <ReceptionItems items={reception.receptionItems || []} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ReceptionDrawer;
