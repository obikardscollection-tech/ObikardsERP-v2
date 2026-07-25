import { formatCurrency, formatNumber, formatPercent } from "../../../utils/statisticsFormatter";

export default function TopSportsTable({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Top sports</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Sport</th>
              <th className="px-3 py-3">CA</th>
              <th className="px-3 py-3">Benefice</th>
              <th className="px-3 py-3">ROI</th>
              <th className="px-3 py-3">Ventes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50">
                <td className="px-3 py-3 font-medium text-slate-700">{row.key}</td>
                <td className="px-3 py-3 text-slate-900">{formatCurrency(row.chiffreAffaires)}</td>
                <td className="px-3 py-3 text-slate-900">{formatCurrency(row.benefice)}</td>
                <td className="px-3 py-3 text-slate-900">{formatPercent(row.roi)}</td>
                <td className="px-3 py-3 text-slate-700">{formatNumber(row.salesCount || row.nombreVentes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 ? <p className="mt-4 text-sm text-slate-500">Aucune donnee disponible.</p> : null}
    </section>
  );
}
