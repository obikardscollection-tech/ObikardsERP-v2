import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import Sidebar from "./components/Sidebar";
import InventoryTable from "./components/InventoryTable";
import AddInventoryDrawer from "./components/drawer/AddInventoryDrawer";
import InventoryToolbar from "./components/inventory/InventoryToolbar";
import InventoryStats from "./components/inventory/InventoryStats";
import BulkActions from "./components/inventory/BulkActions";

import useSort from "./hooks/useSort";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedItems, setSelectedItems] = useState([]);

  async function loadInventory() {
    try {
      setLoading(true);

      const { data } = await axios.get(
        "http://localhost:3000/inventory"
      );

      setItems(data);
      setSelectedItems([]);
    } catch (error) {
      console.error(error);
      alert("Impossible de charger l'inventaire.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        items
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        Object.values(item).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(search)
        );

      const matchesCategory =
        !categoryFilter ||
        item.category === categoryFilter;

      const matchesStatus =
        !statusFilter ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [items, searchTerm, categoryFilter, statusFilter]);

  const {
    sortedItems,
    sortField,
    sortDirection,
    handleSort,
  } = useSort(filteredItems);

  function clearSelection() {
    setSelectedItems([]);
  }

  function resetFilters() {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("");
    clearSelection();
  }

  function handleToggleSelect(id) {
    setSelectedItems((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (itemId) => itemId !== id
        );
      }

      return [...previous, id];
    });
  }

  function handleToggleSelectAll(currentItems) {
    const ids = currentItems.map((item) => item.id);

    const allSelected = ids.every((id) =>
      selectedItems.includes(id)
    );

    if (allSelected) {
      setSelectedItems((previous) =>
        previous.filter((id) => !ids.includes(id))
      );
    } else {
      setSelectedItems((previous) => [
        ...new Set([...previous, ...ids]),
      ]);
    }
  }

  function handleCreate() {
    setSelectedItem(null);
    setDrawerOpen(true);
  }

  function handleEdit(item) {
    setSelectedItem(item);
    setDrawerOpen(true);
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Supprimer définitivement :\n\n${item.title}\n(${item.sku}) ?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:3000/inventory/${item.id}`
      );

      await loadInventory();
    } catch (error) {
      console.error(error);
      alert("Impossible de supprimer la carte.");
    }
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedItem(null);
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Inventaire
            </h1>

            <p className="text-gray-500 mt-1">
              {sortedItems.length} article(s)
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow"
          >
            + Ajouter un article
          </button>
        </div>

        <InventoryStats
          items={sortedItems}
        />

        <InventoryToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categories={categories}
          onReset={resetFilters}
        />

        <BulkActions
          selectedItems={selectedItems}
          loadInventory={loadInventory}
          clearSelection={clearSelection}
        />

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            Chargement...
          </div>
        ) : (
          <InventoryTable
            items={sortedItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            selectedItems={selectedItems}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
          />
        )}
      </main>

      <AddInventoryDrawer
        open={drawerOpen}
        item={selectedItem}
        onClose={handleCloseDrawer}
        onCreated={loadInventory}
      />
    </div>
  );
}

export default App;