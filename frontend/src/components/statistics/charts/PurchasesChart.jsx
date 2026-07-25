import {
  formatCurrency,
  formatNumber,
} from "../../../utils/statisticsFormatter";

export default function PurchasesChart({ data = [], quantites = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Evolution des achats</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Periode</th>
              <th className="px-3 py-3">Montant achat</th>
              <th className="px-3 py-3">Quantite achetee</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => (
              <tr key={row.period} className="hover:bg-slate-50">
                <td className="px-3 py-3 font-medium text-slate-700">{row.period}</td>
                <td className="px-3 py-3 text-slate-900">{formatCurrency(row.value)}</td>
                <td className="px-3 py-3 text-slate-700">{formatNumber(quantites[index]?.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 ? <p className="mt-4 text-sm text-slate-500">Aucune donnee disponible.</p> : null}
    </section>
  );
}
