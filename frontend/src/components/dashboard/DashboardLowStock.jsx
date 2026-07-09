import { AlertTriangle } from "lucide-react";

export function DashboardLowStock({ data, loading }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Stock faible</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-900">Stock faible</h3>
        {data.lowStockItems.length > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {data.lowStockItems.length}
          </span>
        )}
      </div>

      {data.lowStockItems.length === 0 ? (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500">Tous les stocks sont satisfaisants</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {data.lowStockItems.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-3">
              <AlertTriangle className="mt-1 h-4 w-4 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-900">{item.productName}</p>
                <p className="text-xs text-red-700">
                  {item.quantityOnHand} en stock (minimum: {item.reorderLevel || 10})
                </p>
              </div>
            </div>
          ))}
          {data.lowStockItems.length > 5 && (
            <p className="text-xs text-slate-500">
              +{data.lowStockItems.length - 5} article(s) en stock faible
            </p>
          )}
        </div>
      )}
    </div>
  );
}
