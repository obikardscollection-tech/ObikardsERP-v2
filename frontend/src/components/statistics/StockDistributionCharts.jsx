function formatCurrency(value) {
  const numberValue = Number(value) || 0;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(numberValue);
}

function formatPercent(value) {
  const numberValue = Number(value) || 0;
  return `${numberValue.toFixed(2)}%`;
}

function DistributionBars({ title, data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>

      {data.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune donnee disponible.</p>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 8).map((entry) => (
            <div key={entry.key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium text-slate-700">{entry.key}</span>
                <span className="text-slate-500">{formatPercent(entry.part)}</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: `${Math.max(0, Math.min(entry.part, 100))}%` }}
                />
              </div>

              <p className="mt-1 text-xs text-slate-500">{formatCurrency(entry.valeurMarche)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function StockDistributionCharts({ distribution }) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <DistributionBars
        title="Distribution valeur par sport"
        data={distribution.bySport}
      />

      <DistributionBars
        title="Distribution valeur par marque"
        data={distribution.byBrand}
      />
    </section>
  );
}