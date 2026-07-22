import { DashboardSection } from "./DashboardSection";

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function renderSummaryRows(overview) {
  return [
    {
      label: "Ventes",
      value: `${formatNumber(overview.totalSalesCount)} (${formatCurrency(overview.totalSalesAmount)})`,
    },
    {
      label: "Achats",
      value: `${formatNumber(overview.totalPurchasesCount)} (${formatCurrency(overview.totalPurchasesAmount)})`,
    },
    {
      label: "Depenses",
      value: `${formatNumber(overview.totalExpensesCount)} (${formatCurrency(overview.totalExpensesAmount)})`,
    },
    {
      label: "Clients",
      value: formatNumber(overview.totalCustomers),
    },
  ];
}

export function DashboardSummary({ overview, generatedAt, loading = false }) {
  const rows = renderSummaryRows(overview);

  return (
    <DashboardSection
      title="Synthese business"
      subtitle="Vue rapide des flux de l'ERP"
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-8 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-4 rounded-lg bg-slate-100 p-3">
            <p className="text-sm text-slate-700">
              Valeur de stock estimee (base prix d'achat des articles IN_STOCK):
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrency(overview.estimatedStockValue)}
            </p>
          </div>

          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{row.label}</span>
                <span className="font-semibold text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>

          {generatedAt ? (
            <p className="mt-4 text-xs text-slate-500">
              Derniere mise a jour: {new Date(generatedAt).toLocaleString("fr-FR")}
            </p>
          ) : null}
        </div>
      )}
    </DashboardSection>
  );
}
