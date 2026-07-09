import { X } from "lucide-react";

import ReceptionItems from "./ReceptionItems";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("fr-FR");
}

function getReceptionStatus(reception) {
  if (!reception) {
    return "EN_ATTENTE";
  }

  if (Number(reception.remainingQuantity || 0) <= 0) {
    return "TERMINEE";
  }

  if (Number(reception.totalQuantity || 0) <= 0) {
    return "EN_ATTENTE";
  }

  return "PARTIELLE";
}

function ReceptionDetails({ open, reception, onClose }) {
  if (!open || !reception) {
    return null;
  }

  const status = getReceptionStatus(reception);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-8 shadow-2xl">
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
                <p className="font-medium">{reception.purchase?.supplier?.name || reception.purchase?.supplier?.company || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-medium">{formatDate(reception.receivedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Statut</p>
                <p className="font-medium">{status === "TERMINEE" ? "Terminée" : status === "PARTIELLE" ? "Partielle" : "En attente"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Lignes reçues</h3>
            <ReceptionItems items={reception.receptionItems || []} />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Quantités restantes</h3>
            <p className="text-sm text-slate-600">Total réceptionné : {reception.totalQuantity ?? 0}</p>
            <p className="text-sm text-slate-600">Restant : {reception.remainingQuantity ?? 0}</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Historique</h3>
            <p className="text-sm text-slate-600">Créée le {formatDate(reception.createdAt)}</p>
            <p className="text-sm text-slate-600">Dernière mise à jour le {formatDate(reception.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionDetails;
