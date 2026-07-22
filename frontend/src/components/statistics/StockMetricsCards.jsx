function formatCurrency(value) {
  const numberValue = Number(value) || 0;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(numberValue);
}

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR").format(Number(value) || 0);
}

function formatPercent(value) {
  const numberValue = Number(value) || 0;
  return `${numberValue.toFixed(2)}%`;
}

export default function StockMetricsCards({ metrics }) {
  const cards = [
    {
      label: "Cartes en stock",
      value: formatNumber(metrics.nombreTotalCartes),
    },
    {
      label: "Quantite totale",
      value: formatNumber(metrics.quantiteTotale),
    },
    {
      label: "Valeur marche stock",
      value: formatCurrency(metrics.valeurMarcheStock),
    },
    {
      label: "Benefice potentiel",
      value: formatCurrency(metrics.beneficePotentiel),
    },
    {
      label: "ROI potentiel",
      value: formatPercent(metrics.roiPotentiel),
    },
    {
      label: "Rotation stock",
      value: formatPercent(metrics.rotationStock),
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
        </article>
      ))}
    </section>
  );
}