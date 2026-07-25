import { formatCurrency, formatPercent } from "../../../utils/statisticsFormatter";

export default function InvestmentPotentialTable({ data = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Potentiel d'investissement</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Carte</th>
              <th className="px-3 py-3">Prix achat</th>
              <th className="px-3 py-3">Valeur marche</th>
              <th className="px-3 py-3">Profit snapshot</th>
              <th className="px-3 py-3">ROI snapshot</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row) => {
              const roiClass = Number(row.roiSnapshot) >= 0 ? "text-emerald-700" : "text-rose-700";

              return (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-slate-700">
                    <p className="font-medium text-slate-900">{row.title || row.sku || "Sans titre"}</p>
                    <p className="text-xs text-slate-500">{row.sku || "-"}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{formatCurrency(row.purchasePrice)}</td>
                  <td className="px-3 py-3 text-slate-700">{formatCurrency(row.marketValue)}</td>
                  <td className="px-3 py-3 text-slate-700">{formatCurrency(row.profitSnapshot)}</td>
                  <td className={`px-3 py-3 font-medium ${roiClass}`}>{formatPercent(row.roiSnapshot)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 ? <p className="mt-4 text-sm text-slate-500">Aucune donnee disponible.</p> : null}
    </section>
  );
}
