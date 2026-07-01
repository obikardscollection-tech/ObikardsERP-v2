import InventoryStats from "./InventoryStats";
import InventoryToolbar from "./InventoryToolbar";
import InventoryTable from "../InventoryTable";
import BulkActions from "./BulkActions";
import ExportActions from "./ExportActions";

export default function InventoryContent({
  loading,
  sortedItems,

  searchTerm,
  onSearchChange,

  categoryFilter,
  onCategoryChange,

  statusFilter,
  onStatusChange,

  categories,
  onReset,

  selectedItems,
  loadInventory,
  clearSelection,

  onEdit,
  onDelete,
  onAdjustStock,

  sortField,
  sortDirection,
  onSort,

  onToggleSelect,
  onToggleSelectAll,
}) {
  return (
    <>
      <InventoryStats
        items={sortedItems}
      />

      <InventoryToolbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryChange}
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
        categories={categories}
        onReset={onReset}
      />

      <BulkActions
        selectedItems={selectedItems}
        loadInventory={loadInventory}
        clearSelection={clearSelection}
      />

      <ExportActions
        items={sortedItems}
      />

      {loading ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          Chargement...
        </div>
      ) : (
        <InventoryTable
          items={sortedItems}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdjustStock={onAdjustStock}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          selectedItems={selectedItems}
          onToggleSelect={onToggleSelect}
          onToggleSelectAll={onToggleSelectAll}
        />
      )}
    </>
  );
}