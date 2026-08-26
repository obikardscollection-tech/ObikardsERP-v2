import { useMemo, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import AddInventoryDrawer from "../components/drawer/AddInventoryDrawer";
import DeleteInventoryModal from "../components/inventory/DeleteInventoryModal";
import StockAdjustmentModal from "../components/inventory/stock/StockAdjustmentModal";
import InventoryCsvImportModal from "../components/inventory/import/InventoryCsvImportModal";

import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryContent from "../components/inventory/InventoryContent";

import useInventory from "../hooks/useInventory";
import useStock from "../hooks/useStock";
import { refreshInventoryMarket } from "../services/inventoryService";

function Inventory() {
  const {
    loading,
    refreshing,
    error,
    categories,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    selectedItems,
    clearSelection,
    resetFilters,
    sortField,
    sortDirection,
    handleSort,
    getSortMeta,
    sortedItems,
    loadInventory,
    handleDelete: deleteInventoryItem,
    handleRefreshMarket,
    handleToggleSelect,
    handleToggleSelectAll,
    selectedCount,
  } = useInventory();

  const {
    loading: stockLoading,
    stockModalOpen,
    selectedStockItem,
    movements,
    historyLoading,
    openStockModal,
    closeStockModal,
    submitStock,
  } = useStock(loadInventory);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [marketSelectionItem, setMarketSelectionItem] = useState(null);
  const [marketSelectionMatches, setMarketSelectionMatches] = useState([]);
  const [submittingMarketSelection, setSubmittingMarketSelection] = useState(false);

  const marketSelectionOptions = useMemo(
    () => marketSelectionMatches.map((match) => ({
      ...match,
      priceLabel:
        match.loosePrice !== null && match.loosePrice !== undefined
          ? `${Number(match.loosePrice) / 100} $`
          : "—",
    })),
    [marketSelectionMatches]
  );

  function handleCreate() {
    setSelectedItem(null);
    setDrawerOpen(true);
  }

  function handleDelete(item) {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  }

  function handleCloseDeleteModal() {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) {
      return;
    }

    await deleteInventoryItem(itemToDelete);
    handleCloseDeleteModal();
  }

  function handleEdit(item) {
    setSelectedItem(item);
    setDrawerOpen(true);
  }

  async function handleRefreshMarketItem(item) {
    const action = await handleRefreshMarket(item);

    if (action && action.type === "multiple_matches") {
      setMarketSelectionItem(action.item);
      setMarketSelectionMatches(action.matches);
    }
  }

  async function handleSelectMarketVariant(sportsCardsProId) {
    if (!marketSelectionItem) {
      return;
    }

    try {
      setSubmittingMarketSelection(true);
      await refreshInventoryMarket(marketSelectionItem.id, { sportsCardsProId });
      await loadInventory({ silent: true });
      setMarketSelectionItem(null);
      setMarketSelectionMatches([]);
    } finally {
      setSubmittingMarketSelection(false);
    }
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedItem(null);
  }

  function handleOpenCsvImport() {
    setCsvImportOpen(true);
  }

  function handleCloseCsvImport() {
    setCsvImportOpen(false);
  }

  async function handleImportedCsv() {
    await loadInventory();
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 xl:p-8">
        <InventoryHeader
          totalItems={sortedItems.length}
          selectedCount={selectedCount}
          refreshing={refreshing}
          onCreate={handleCreate}
          onImportCsv={handleOpenCsvImport}
          onRefresh={() => loadInventory({ silent: true })}
        />

        <InventoryContent
          loading={loading}
          refreshing={refreshing}
          error={error}
          sortedItems={sortedItems}
          categories={categories}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onReset={resetFilters}
          selectedItems={selectedItems}
          clearSelection={clearSelection}
          loadInventory={loadInventory}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefreshMarket={handleRefreshMarketItem}
          onAdjustStock={openStockModal}
          sortField={sortField}
          sortDirection={sortDirection}
          getSortMeta={getSortMeta}
          onSort={handleSort}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </main>

      <AddInventoryDrawer
        open={drawerOpen}
        item={selectedItem}
        onClose={handleCloseDrawer}
        onCreated={loadInventory}
      />

      <DeleteInventoryModal
        open={deleteModalOpen}
        item={itemToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />

      <StockAdjustmentModal
        open={stockModalOpen}
        item={selectedStockItem}
        onClose={closeStockModal}
        onSubmit={submitStock}
        movements={movements}
        historyLoading={historyLoading}
        loading={stockLoading}
      />

      <InventoryCsvImportModal
        open={csvImportOpen}
        onClose={handleCloseCsvImport}
        onImported={handleImportedCsv}
      />

      {marketSelectionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-600">Sélectionner la carte SportsCardsPro</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">{marketSelectionItem.title || marketSelectionItem.sku}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMarketSelectionItem(null);
                  setMarketSelectionMatches([]);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-3">
              {marketSelectionOptions.length === 0 ? (
                <p className="text-sm text-slate-600">Aucun candidat disponible.</p>
              ) : (
                marketSelectionOptions.map((candidate) => (
                  <div
                    key={candidate.sportsCardsProId}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div>
                      <div className="text-base font-semibold text-slate-800">
                        {candidate.productName || "Produit sans nom"}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {candidate.parallel || candidate.variation || candidate.subset || "Variante inconnue"}
                        {' · '}
                        {candidate.set || "Série inconnue"}
                        {' · '}
                        {candidate.priceLabel}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={submittingMarketSelection}
                      onClick={() => handleSelectMarketVariant(candidate.sportsCardsProId)}
                      className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Sélectionner
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;