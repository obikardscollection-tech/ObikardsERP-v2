import { useState } from "react";
import toast from "react-hot-toast";

import { deleteInventoryBatch } from "../../services/inventoryService";

export default function BulkActions({
  selectedItems,
  loadInventory,
  clearSelection,
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  async function handleDeleteSelected() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    try {
      setDeleting(true);
      await deleteInventoryBatch(selectedItems);

      await loadInventory();
      clearSelection();
      setConfirmingDelete(false);

      toast.success(`${selectedItems.length} article(s) supprime(s).`);
    } catch (error) {
      console.error(error);

      toast.error("Une erreur est survenue pendant la suppression.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-blue-900">Actions de masse</p>
        <p className="text-sm text-blue-800">{selectedItems.length} article(s) selectionne(s)</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={deleting}
          className={`rounded-lg px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmingDelete ? "bg-rose-700 hover:bg-rose-800" : "bg-red-600 hover:bg-red-700"}`}
        >
          {deleting ? "Suppression..." : confirmingDelete ? "Confirmer la suppression" : "Supprimer"}
        </button>

        <button
          type="button"
          onClick={clearSelection}
          disabled={deleting}
          className="rounded-lg bg-gray-300 px-4 py-2 transition hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Annuler la sélection
        </button>

        {confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            disabled={deleting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler suppression
          </button>
        ) : null}
      </div>
    </div>
  );
}