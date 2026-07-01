import { useEffect, useMemo, useState } from "react";

import {
  getInventory,
  deleteInventory,
} from "../services/inventoryService";

import useSort from "./useSort";

export default function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [selectedItems, setSelectedItems] =
    useState([]);

  async function loadInventory() {
    try {
      setLoading(true);

      const data = await getInventory();

      setItems(data);
      setSelectedItems([]);
    } catch (error) {
      console.error(error);
      alert(
        "Impossible de charger l'inventaire."
      );
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
      const search = searchTerm
        .trim()
        .toLowerCase();

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
  }, [
    items,
    searchTerm,
    categoryFilter,
    statusFilter,
  ]);

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
    const ids = currentItems.map(
      (item) => item.id
    );

    const allSelected = ids.every((id) =>
      selectedItems.includes(id)
    );

    if (allSelected) {
      setSelectedItems((previous) =>
        previous.filter(
          (id) => !ids.includes(id)
        )
      );
    } else {
      setSelectedItems((previous) => [
        ...new Set([
          ...previous,
          ...ids,
        ]),
      ]);
    }
  }
    async function handleDelete(item) {
    const confirmed = window.confirm(
      `Supprimer définitivement :\n\n${item.title}\n(${item.sku}) ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteInventory(item.id);

      await loadInventory();
    } catch (error) {
      console.error(error);

      alert("Impossible de supprimer la carte.");
    }
  }

  return {
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
  };
}