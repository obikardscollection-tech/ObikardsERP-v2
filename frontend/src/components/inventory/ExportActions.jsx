import exportCsv from "../../utils/exportCsv";
import exportExcel from "../../utils/exportExcel";
import exportPdf from "../../utils/exportPdf";

export default function ExportActions({
  items,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-3">
      <button
        onClick={() => exportCsv(items)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
      >
        Export CSV
      </button>

      <button
        onClick={() => exportExcel(items)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
      >
        Export Excel
      </button>

      <button
        onClick={() => exportPdf(items)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
      >
        Export PDF
      </button>
    </div>
  );
}