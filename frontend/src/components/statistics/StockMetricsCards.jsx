import { stockMetricsCards } from "../../constants/stockMetrics";

export default function StockMetricsCards({ metrics }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stockMetricsCards.map((card) => (
        <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{card.getValue(metrics)}</p>
        </article>
      ))}
    </section>
  );
}