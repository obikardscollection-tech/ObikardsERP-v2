import { X } from "lucide-react";

import SaleItems from "./SaleItems";
import { getSalePlatformLabel, getStatusLabel } from "../../constants/labels";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("fr-FR");
}

function formatAmount(value) {
  return `${Number(value ?? 0).toFixed(2)} EUR`;
}

function SaleDetails({ open, sale, onClose }) {
  if (!open || !sale) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{sale.orderNumber}</h2>
            <p className="text-sm text-slate-500">Détails de la vente</p>
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
                <p className="text-sm text-slate-500">Plateforme</p>
                <p className="font-medium">{getSalePlatformLabel(sale.platform) || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Statut</p>
                <p className="font-medium">{getStatusLabel(sale.status) || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-medium">{formatDate(sale.soldAt)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Client</p>
                <p className="font-medium">{sale.customer?.name || sale.customerName || sale.customer?.company || "-"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Articles vendus</h3>
            <SaleItems items={sale.saleItems || []} />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Totaux</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Total : {formatAmount(sale.totalAmount)}</p>
              <p>Marge : {formatAmount(sale.profit)}</p>
              <p>Remise : {formatAmount(sale.discount)}</p>
              <p>Frais de port : {formatAmount(sale.shippingCost)}</p>
              <p>Frais plateforme : {formatAmount(sale.platformFees)}</p>
              <p>Taxes : {formatAmount(sale.taxes)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">Dates</h3>
            <p className="text-sm text-slate-600">Créée le {formatDate(sale.createdAt)}</p>
            <p className="text-sm text-slate-600">Dernière mise à jour le {formatDate(sale.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaleDetails;
