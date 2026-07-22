import { useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import AddInventoryDrawer from "../components/drawer/AddInventoryDrawer";
import DeleteInventoryModal from "../components/inventory/DeleteInventoryModal";
import StockAdjustmentModal from "../components/inventory/stock/StockAdjustmentModal";
import InventoryCsvImportModal from "../components/inventory/import/InventoryCsvImportModal";

import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryContent from "../components/inventory/InventoryContent";

import useInventory from "../hooks/useInventory";
import useStock from "../hooks/useStock";

function Inventory() {
  const {
    loading,
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
    sortedItems,
    loadInventory,
    handleDelete: deleteInventoryItem,
    handleToggleSelect,
    handleToggleSelectAll,
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

      <main className="flex-1 p-8">
        <InventoryHeader
          totalItems={sortedItems.length}
          onCreate={handleCreate}
          onImportCsv={handleOpenCsvImport}
        />

        <InventoryContent
          loading={loading}
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
          onAdjustStock={openStockModal}
          sortField={sortField}
          sortDirection={sortDirection}
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
    </div>
  );
}

export default Inventory;