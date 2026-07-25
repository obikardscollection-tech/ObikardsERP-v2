import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../../../utils/statisticsFormatter";

function formatRowValue(value, type) {
  if (type === "currency") {
    return formatCurrency(value);
  }

  if (type === "percent") {
    return formatPercent(value);
  }

  return formatNumber(value);
}

export default function BusinessDistributionTable({
  title,
  dimensionLabel,
  data = [],
  maxItems = 10,
}) {
  const rows = data.slice(0, maxItems);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">{dimensionLabel}</th>
              <th className="px-3 py-3">Ventes</th>
              <th className="px-3 py-3">Quantite</th>
              <th className="px-3 py-3">Chiffre affaires</th>
              <th className="px-3 py-3">Cout</th>
              <th className="px-3 py-3">Benefice</th>
              <th className="px-3 py-3">Marge</th>
              <th className="px-3 py-3">ROI</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50">
                <td className="px-3 py-3 font-medium text-slate-700">{row.key}</td>
                <td className="px-3 py-3 text-slate-700">{formatRowValue(row.nombreVentes, "number")}</td>
                <td className="px-3 py-3 text-slate-700">{formatRowValue(row.quantite, "number")}</td>
                <td className="px-3 py-3 text-slate-700">{formatRowValue(row.chiffreAffaires, "currency")}</td>
                <td className="px-3 py-3 text-slate-700">{formatRowValue(row.cout, "currency")}</td>
                <td className="px-3 py-3 text-slate-900">{formatRowValue(row.benefice, "currency")}</td>
                <td className="px-3 py-3 text-slate-700">{formatRowValue(row.marge, "percent")}</td>
                <td className="px-3 py-3 text-slate-700">{formatRowValue(row.roi, "percent")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Aucune donnee disponible.</p>
      ) : null}
    </section>
  );
}
