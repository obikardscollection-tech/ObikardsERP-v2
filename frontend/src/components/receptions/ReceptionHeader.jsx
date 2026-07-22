export default function ReceptionHeader({
  totalItems,
  selectedCount,
  refreshing,
  onCreate,
  onRefresh,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Réceptions</h1>
          <p className="mt-1 text-sm text-slate-500">{totalItems} réception(s) visible(s)</p>

          {selectedCount > 0 ? (
            <p className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {selectedCount} sélectionnée(s)
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Actualisation..." : "Actualiser"}
          </button>

          <button
            type="button"
            onClick={onCreate}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white shadow transition hover:bg-blue-700"
          >
            + Nouvelle réception
          </button>
        </div>
      </div>
    </div>
  );
}