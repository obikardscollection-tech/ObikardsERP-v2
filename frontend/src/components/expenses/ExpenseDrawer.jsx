import { X } from "lucide-react";

import ExpenseForm from "./ExpenseForm";

function ExpenseDrawer({ open, expense, suppliers = [], onClose, onSaved, addExpense, editExpense }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{expense ? "Modifier une dépense" : "Ajouter une dépense"}</h2>

          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900" title="Fermer">
            <X size={24} />
          </button>
        </div>

        <ExpenseForm expense={expense} suppliers={suppliers} onClose={onClose} onSaved={onSaved} addExpense={addExpense} editExpense={editExpense} />
      </div>
    </div>
  );
}

export default ExpenseDrawer;
