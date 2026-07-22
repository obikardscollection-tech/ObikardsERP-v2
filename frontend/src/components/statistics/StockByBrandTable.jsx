function formatCurrency(value) {
  const numberValue = Number(value) || 0;

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(numberValue);
}

export default function StockByBrandTable({ stockData = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Stock par marque</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Marque</th>
              <th className="px-3 py-3">Cartes</th>
              <th className="px-3 py-3">Quantite</th>
              <th className="px-3 py-3">Valeur achat</th>
              <th className="px-3 py-3">Valeur vente</th>
              <th className="px-3 py-3">Valeur marche</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {stockData.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50">
                <td className="px-3 py-3 font-medium text-slate-700">{row.key}</td>
                <td className="px-3 py-3 text-slate-700">{row.nombreCartes}</td>
                <td className="px-3 py-3 text-slate-700">{row.quantite}</td>
                <td className="px-3 py-3 text-slate-700">{formatCurrency(row.valeurAchat)}</td>
                <td className="px-3 py-3 text-slate-700">{formatCurrency(row.valeurVente)}</td>
                <td className="px-3 py-3 font-semibold text-slate-900">{formatCurrency(row.valeurMarche)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stockData.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Aucune donnee disponible.</p>
      ) : null}
    </section>
  );
}