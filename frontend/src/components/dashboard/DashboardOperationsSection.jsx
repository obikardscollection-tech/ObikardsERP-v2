import { AlertTriangle, Boxes, PackageCheck, PackageOpen, Repeat2, Warehouse } from "lucide-react";
import { formatCurrency, formatDateTime, formatNumber } from "./dashboardFormatters";

function Metric({ icon: Icon, label, value, detail, warning = false }) {
  return (
    <div className={`border-l-2 px-4 py-2 ${warning ? "border-amber-500" : "border-slate-300"}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
        <Icon className={`h-4 w-4 ${warning ? "text-amber-600" : "text-slate-600"}`} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function OperationsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded bg-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="h-52 animate-pulse rounded bg-slate-100" />
        <div className="h-52 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

function EmptyState({ children }) {
  return <p className="py-6 text-center text-sm text-slate-500">{children}</p>;
}

export function DashboardOperationsSection({ overview, operations, loading = false }) {
  if (loading) {
    return <OperationsSkeleton />;
  }

  const receptions = operations?.receptions || {};
  const movements = operations?.stockMovements || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric
          icon={Boxes}
          label="Quantite en stock"
          value={formatNumber(overview.totalQuantity)}
          detail="Unites IN_STOCK"
        />
        <Metric
          icon={Warehouse}
          label="References"
          value={formatNumber(overview.totalItems)}
          detail="Inventaires distincts IN_STOCK"
        />
        <Metric
          icon={PackageOpen}
          label="Valeur au cout"
          value={formatCurrency(overview.estimatedStockValue)}
          detail="Prix d'achat x quantite"
        />
        <Metric
          icon={AlertTriangle}
          label="Stock faible"
          value={formatNumber(overview.lowQuantityCount)}
          detail="References avec 1 unite ou moins"
          warning={overview.lowQuantityCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="border-t border-slate-200 pt-4">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                <PackageCheck className="h-5 w-5 text-emerald-700" />
                Receptions
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {formatNumber(receptions.count)} reception(s), {formatNumber(receptions.receivedQuantity)} unite(s) recue(s)
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{formatNumber(receptions.awaitingPurchasesCount)}</p>
              <p className="text-xs text-slate-500">achat(s) a receptionner</p>
            </div>
          </header>

          {(receptions.recent || []).length === 0 ? (
            <EmptyState>Aucune reception sur la periode</EmptyState>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {receptions.recent.map((reception) => (
                <div key={reception.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{reception.receptionNumber}</p>
                    <p className="truncate text-xs text-slate-500">{reception.purchase?.purchaseNumber || "Achat non renseigne"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-emerald-700">+{formatNumber(reception.totalQuantity)}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(reception.receivedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-slate-200 pt-4">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                <Repeat2 className="h-5 w-5 text-blue-700" />
                Mouvements de stock
              </h3>
              <p className="mt-1 text-xs text-slate-500">{formatNumber(movements.count)} mouvement(s) sur la periode</p>
            </div>
            <div className="flex gap-3 text-right text-xs">
              <span className="font-semibold text-emerald-700">+{formatNumber(movements.entriesQuantity)}</span>
              <span className="font-semibold text-rose-700">-{formatNumber(movements.exitsQuantity)}</span>
              <span className="font-semibold text-slate-900">Net {Number(movements.netQuantity) > 0 ? "+" : ""}{formatNumber(movements.netQuantity)}</span>
            </div>
          </header>

          {(movements.recent || []).length === 0 ? (
            <EmptyState>Aucun mouvement sur la periode</EmptyState>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {movements.recent.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{movement.inventory?.sku || "Reference inconnue"}</p>
                    <p className="truncate text-xs text-slate-500">{movement.inventory?.title || movement.type}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`font-semibold ${movement.quantity >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {movement.quantity > 0 ? "+" : ""}{formatNumber(movement.quantity)}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateTime(movement.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}