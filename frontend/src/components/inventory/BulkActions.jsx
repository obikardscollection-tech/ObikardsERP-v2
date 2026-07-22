import { deleteInventoryBatch } from "../../services/inventoryService";

export default function BulkActions({
  selectedItems,
  loadInventory,
  clearSelection,
}) {
  if (selectedItems.length === 0) {
    return null;
  }

  async function handleDeleteSelected() {
    const confirmed = window.confirm(
      `Supprimer définitivement ${selectedItems.length} article(s) ?`
    );

    if (!confirmed) return;

    try {
      await deleteInventoryBatch(selectedItems);

      await loadInventory();
      clearSelection();

      alert(
        `${selectedItems.length} article(s) supprimé(s).`
      );
    } catch (error) {
      console.error(error);

      alert(
        "Une erreur est survenue pendant la suppression."
      );
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="font-medium text-blue-900">
        {selectedItems.length} article(s) sélectionné(s)
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDeleteSelected}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Supprimer
        </button>

        <button
          onClick={clearSelection}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
        >
          Annuler la sélection
        </button>
      </div>
    </div>
  );
}