import exportCsv from "../../utils/exportCsv";
import exportExcel from "../../utils/exportExcel";
import exportPdf from "../../utils/exportPdf";

export default function ExportActions({
  items,
}) {
  const hasItems = items.length > 0;

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">Exports</p>
        {!hasItems ? (
          <p className="text-xs text-slate-500">Aucune donnee a exporter</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
      <button
        onClick={() => exportCsv(items)}
        disabled={!hasItems}
        className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export CSV
      </button>

      <button
        onClick={() => exportExcel(items)}
        disabled={!hasItems}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export Excel
      </button>

      <button
        onClick={() => exportPdf(items)}
        disabled={!hasItems}
        className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export PDF
      </button>
      </div>
    </div>
  );
}