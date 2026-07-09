function SalesStats({ sales = [], revenue = 0, profit = 0, items = 0, averageBasket = 0 }) {
  const cards = [
    { label: "Nombre de ventes", value: sales.length, tone: "bg-slate-900 text-white" },
    { label: "Chiffre d'affaires", value: `${Number(revenue || 0).toFixed(2)} EUR`, tone: "bg-emerald-100 text-emerald-700" },
    { label: "Marge", value: `${Number(profit || 0).toFixed(2)} EUR`, tone: "bg-blue-100 text-blue-700" },
    { label: "Articles vendus", value: items, tone: "bg-amber-100 text-amber-700" },
    { label: "Panier moyen", value: `${Number(averageBasket || 0).toFixed(2)} EUR`, tone: "bg-slate-100 text-slate-700" },
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl p-4 shadow ${card.tone}`}>
          <p className="text-sm opacity-80">{card.label}</p>
          <p className="mt-2 text-xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default SalesStats;
