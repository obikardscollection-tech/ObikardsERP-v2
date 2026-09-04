import { formatCurrency, formatNumber, formatPercent } from "../../../utils/statisticsFormatter";

export default function ExpenseCategoriesTable({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Depenses par categorie</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Categorie</th>
              <th className="px-3 py-3">Nombre</th>
              <th className="px-3 py-3">HT</th>
              <th className="px-3 py-3">TVA</th>
              <th className="px-3 py-3">TTC</th>
              <th className="px-3 py-3">Part TTC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.category} className="hover:bg-slate-50">
                <td className="px-3 py-3 font-medium text-slate-700">{row.category.replaceAll("_", " ")}</td>
                <td className="px-3 py-3 text-slate-700">{formatNumber(row.nombreDepenses)}</td>
                <td className="px-3 py-3 text-slate-700">{formatCurrency(row.depensesHT)}</td>
                <td className="px-3 py-3 text-slate-700">{formatCurrency(row.tvaDepenses)}</td>
                <td className="px-3 py-3 text-slate-900">{formatCurrency(row.depensesTTC)}</td>
                <td className="px-3 py-3 text-slate-700">{formatPercent(row.partDepensesTTC)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 ? <p className="mt-4 text-sm text-slate-500">Aucune depense par categorie.</p> : null}
    </section>
  );
}