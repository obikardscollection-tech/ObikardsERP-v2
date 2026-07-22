import CardMatchingDetails from "./CardMatchingDetails";

export default function PreviewRowsTable({ rows, missingCriticalColumns }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-slate-900">Apercu des lignes</h4>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Ligne</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Identifiant</th>
              <th className="px-3 py-2 text-left">Matching</th>
              <th className="px-3 py-2 text-left">Avertissements</th>
              <th className="px-3 py-2 text-left">Details Card Matching</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.row} className="border-b border-slate-100">
                <td className="px-3 py-2">{row.row}</td>
                <td className="px-3 py-2">{row.status || "-"}</td>
                <td className="px-3 py-2">{row.identifier || "-"}</td>
                <td className="px-3 py-2">{row?.matching?.status || "UNKNOWN"}</td>
                <td className="px-3 py-2">{Array.isArray(row.warnings) ? row.warnings.join(" | ") : "-"}</td>
                <td className="px-3 py-2 align-top">
                  <details>
                    <summary className="cursor-pointer text-xs font-semibold text-slate-700">Afficher</summary>
                    <div className="mt-2">
                      <CardMatchingDetails
                        row={row}
                        fallbackMissingCriticalColumns={missingCriticalColumns}
                      />
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
