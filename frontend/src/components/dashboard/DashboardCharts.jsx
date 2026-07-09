/**
 * DashboardCharts component
 * 
 * Architecture for charts:
 * - Placeholder for chart implementations
 * - Ready for Chart.js, Recharts, or similar libraries
 * - Currently shows data in text format
 * - Can be extended with actual charts later
 */
import { getExpenseCategoryLabel } from "../../constants/labels";

export function DashboardCharts({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-6">
            <div className="h-64 animate-pulse rounded bg-slate-100"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Sales Evolution Chart - Placeholder */}
      <div className="rounded-lg border border-slate-200 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Évolution des ventes</h3>
        <div className="flex items-center justify-center rounded-lg bg-slate-50 p-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {data.stats.saleCount} ventes
            </p>
            <p className="mt-2 text-sm text-slate-500">Graphique à venir</p>
          </div>
        </div>
      </div>

      {/* Purchases Evolution Chart - Placeholder */}
      <div className="rounded-lg border border-slate-200 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Évolution des achats</h3>
        <div className="flex items-center justify-center rounded-lg bg-slate-50 p-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {data.stats.purchaseCount} achats
            </p>
            <p className="mt-2 text-sm text-slate-500">Graphique à venir</p>
          </div>
        </div>
      </div>

      {/* Expenses Distribution by Category - Placeholder */}
      <div className="rounded-lg border border-slate-200 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Dépenses par catégorie</h3>
        {Object.keys(data.expensesByCategory).length === 0 ? (
          <div className="flex items-center justify-center rounded-lg bg-slate-50 p-8">
            <p className="text-sm text-slate-500">Aucune dépense</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(data.expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, amount]) => {
                const total = Object.values(data.expensesByCategory).reduce((sum, val) => sum + val, 0);
                const percent = total > 0 ? (amount / total) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">{getExpenseCategoryLabel(category)}</span>
                      <span className="text-slate-500">{percent.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
