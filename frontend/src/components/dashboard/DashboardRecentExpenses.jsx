import { Eye } from "lucide-react";

export function DashboardRecentExpenses({ data, loading }) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Dernières dépenses</h3>
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
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Dernières dépenses</h3>
      {data.recentExpenses.length === 0 ? (
        <p className="text-center text-sm text-slate-500">Aucune dépense</p>
      ) : (
        <div className="space-y-3">
          {data.recentExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{expense.expenseNumber}</p>
                <p className="text-xs text-slate-500">{formatDate(expense.expenseDate)}</p>
              </div>
              <p className="font-semibold text-slate-900">{formatCurrency(expense.amountTTC)}</p>
              <button className="ml-2 rounded-lg p-1 hover:bg-slate-100">
                <Eye className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
