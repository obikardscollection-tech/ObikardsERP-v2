import { getSalePlatformLabel, getStatusLabel } from "../../constants/labels";

function SaleFilters({ platformFilter, onPlatformChange, customerFilter, onCustomerChange, statusFilter, onStatusChange, dateFilter, onDateChange, platforms = [], customers = [], statuses = [], onReset }) {
  return (
    <div className="mb-4 rounded-xl bg-white p-4 shadow">
      <div className="grid gap-4 md:grid-cols-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Plateforme</label>
          <select value={platformFilter} onChange={(event) => onPlatformChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5">
            <option value="">Toutes</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {getSalePlatformLabel(platform)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Client</label>
          <select value={customerFilter} onChange={(event) => onCustomerChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5">
            <option value="">Tous</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name || customer.company || customer.email || customer.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
          <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5">
            <option value="">Tous</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
          <input type="date" value={dateFilter} onChange={(event) => onDateChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5" />
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

export default SaleFilters;
