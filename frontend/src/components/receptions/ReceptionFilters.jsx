import { getReceptionStatusLabel } from "../../constants/labels";

function ReceptionFilters({ dateFilter, onDateChange, statusFilter, onStatusChange, purchaseFilter, onPurchaseChange, purchases = [], onReset }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="reception-date-filter" className="mb-2 block text-sm font-medium text-slate-700">Date</label>
          <input id="reception-date-filter" type="date" value={dateFilter} onChange={(event) => onDateChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5" />
        </div>

        <div>
          <label htmlFor="reception-status-filter" className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
          <select id="reception-status-filter" value={statusFilter} onChange={(event) => onStatusChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5">
            <option value="">Tous</option>
            <option value="PENDING">{getReceptionStatusLabel("PENDING")}</option>
            <option value="PARTIALLY_RECEIVED">{getReceptionStatusLabel("PARTIALLY_RECEIVED")}</option>
            <option value="COMPLETED">{getReceptionStatusLabel("COMPLETED")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="reception-purchase-filter" className="mb-2 block text-sm font-medium text-slate-700">Achat</label>
          <select id="reception-purchase-filter" value={purchaseFilter} onChange={(event) => onPurchaseChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5">
            <option value="">Tous</option>
            {purchases.map((purchase) => (
              <option key={purchase.id} value={purchase.id}>
                {purchase.purchaseNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button type="button" onClick={onReset} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 hover:bg-slate-50">
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceptionFilters;
