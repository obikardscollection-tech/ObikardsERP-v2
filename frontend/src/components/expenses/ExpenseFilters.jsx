import { getExpenseCategoryLabel, getPaymentMethodLabel } from "../../constants/labels";

function ExpenseFilters({
  categoryFilter,
  onCategoryChange,
  paymentMethodFilter,
  onPaymentMethodChange,
  dateFilter,
  onDateChange,
  categories = [],
  paymentMethods = [],
  onReset,
}) {
  return (
    <div className="mb-4 rounded-xl bg-white p-4 shadow">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Catégorie</label>
          <select value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5">
            <option value="">Toutes</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {getExpenseCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Méthode de paiement</label>
          <select value={paymentMethodFilter} onChange={(event) => onPaymentMethodChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5">
            <option value="">Toutes</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {getPaymentMethodLabel(method)}
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

export default ExpenseFilters;
