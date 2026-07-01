import { useState } from "react";

import Sidebar from "./components/Sidebar";
import AddInventoryDrawer from "./components/drawer/AddInventoryDrawer";
import StockAdjustmentModal from "./components/inventory/stock/StockAdjustmentModal";

import InventoryHeader from "./components/inventory/InventoryHeader";
import InventoryContent from "./components/inventory/InventoryContent";

import useInventory from "./hooks/useInventory";
import useStock from "./hooks/useStock";

function App() {
  const {
    loading,
    items,
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
    handleDelete,
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

  function handleCreate() {
    setSelectedItem(null);
    setDrawerOpen(true);
  }

  function handleEdit(item) {
    setSelectedItem(item);
    setDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedItem(null);
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <InventoryHeader
          totalItems={sortedItems.length}
          onCreate={handleCreate}
        />

        <InventoryContent
          loading={loading}
          items={items}
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

      <StockAdjustmentModal
        open={stockModalOpen}
        item={selectedStockItem}
        onClose={closeStockModal}
        onSubmit={submitStock}
        movements={movements}
        historyLoading={historyLoading}
        loading={stockLoading}
      />
    </div>
  );
}

export default App;