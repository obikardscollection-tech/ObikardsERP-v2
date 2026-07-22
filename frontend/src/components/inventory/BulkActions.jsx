import { useState } from "react";
import toast from "react-hot-toast";

import { deleteInventoryBatch } from "../../services/inventoryService";

export default function BulkActions({
  selectedItems,
  loadInventory,
  clearSelection,
}) {
  const [deleting, setDeleting] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  async function handleDeleteSelected() {
    const confirmed = window.confirm(
      `Supprimer définitivement ${selectedItems.length} article(s) ?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteInventoryBatch(selectedItems);

      await loadInventory();
      clearSelection();

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
          onClick={handleDeleteSelected}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? "Suppression..." : "Supprimer"}
        </button>

        <button
          onClick={clearSelection}
          disabled={deleting}
          className="rounded-lg bg-gray-300 px-4 py-2 transition hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Annuler la sélection
        </button>
      </div>
    </div>
  );
}