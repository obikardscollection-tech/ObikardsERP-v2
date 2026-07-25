import { formatCurrency, formatNumber, formatPercent } from '../../../utils/statisticsFormatter';

function SalesPlatformTable({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Ventes par plateforme</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Plateforme</th>
              <th className="px-3 py-3">Ventes</th>
              <th className="px-3 py-3">CA</th>
              <th className="px-3 py-3">Part CA</th>
              <th className="px-3 py-3">Part benefice</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50">
                <td className="px-3 py-3 font-medium text-slate-700">{row.key}</td>
                <td className="px-3 py-3 text-slate-700">{formatNumber(row.salesCount)}</td>
                <td className="px-3 py-3 text-slate-700">{formatCurrency(row.chiffreAffaires)}</td>
                <td className="px-3 py-3 text-slate-700">{formatPercent(row.partChiffreAffaires)}</td>
                <td className="px-3 py-3 text-slate-900">{formatPercent(row.partBenefice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 ? <p className="mt-4 text-sm text-slate-500">Aucune donnee disponible.</p> : null}
    </section>
  );
}

export default SalesPlatformTable;