import { X } from "lucide-react";

import ReceptionItems from "./ReceptionItems";
import ReceptionTimeline from "./ReceptionTimeline";
import { getReceptionStatus, getReceptionSupplierName, formatReceptionDate } from "../../utils/receptionUtils";

function ReceptionDetails({ open, reception, onClose }) {
  if (!open || !reception) {
    return null;
  }

  const status = getReceptionStatus(reception);
  const supplierName = getReceptionSupplierName(reception);
  const supplier = reception.purchase?.supplier;
  const totalOrdered = (reception.receptionItems || []).reduce(
    (sum, item) => sum + Number(item.purchaseItem?.quantity || 0),
    0
  );
  const totalReceived = Number(reception.totalQuantity || 0);
  const totalRemaining = Number(reception.remainingQuantity || 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="presentation">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-8 shadow-2xl" role="dialog" aria-modal="true" aria-label="Détails de réception">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{reception.receptionNumber}</h2>
            <p className="text-sm text-slate-500">Détails de la réception</p>
          </div>

          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900" title="Fermer">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Informations générales</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Numéro achat</p>
                <p className="font-medium">{reception.purchase?.purchaseNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Fournisseur</p>
                <p className="font-medium">{supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Contact fournisseur</p>
                <p className="font-medium">{supplier?.email || supplier?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-medium">{formatReceptionDate(reception.receivedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Statut</p>
                <p className="font-medium">{status === "COMPLETED" ? "Terminée" : status === "PARTIALLY_RECEIVED" ? "Partielle" : "En attente"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Lignes reçues</h3>
            <ReceptionItems items={reception.receptionItems || []} />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Quantités restantes</h3>
            <p className="text-sm text-slate-600">Total commande : {totalOrdered}</p>
            <p className="text-sm text-slate-600">Total receptionne : {totalReceived}</p>
            <p className="text-sm text-slate-600">Restant : {totalRemaining}</p>
          </div>

          <ReceptionTimeline reception={reception} />
        </div>
      </div>
    </div>
  );
}

export default ReceptionDetails;
