import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  getInventory,
  deleteInventory,
  refreshInventoryMarket,
} from "../services/inventoryService";

import useSort from "./useSort";

export default function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [selectedItems, setSelectedItems] =
    useState([]);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const searchIndex = useMemo(() => {
    return new Map(
      items.map((item) => {
        const searchable = [
          item.sku,
          item.title,
          item.category,
          item.status,
          item.brand,
          item.sport,
          item.team,
          item.player,
          item.series,
          item.cardNumber,
          item.condition,
        ]
          .filter((value) => value !== null && value !== undefined)
          .join(" ")
          .toLowerCase();

        return [item.id, searchable];
      })
    );
  }, [items]);

  const loadInventory = useCallback(async ({ silent = false } = {}) => {
    try {
      setError("");

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getInventory();

      setItems(data);
      setSelectedItems((previous) => {
        const validIds = new Set(data.map((item) => item.id));
        return previous.filter((id) => validIds.has(id));
      });
    } catch (error) {
      console.error(error);

      const message = "Impossible de charger l'inventaire.";
      setError(message);

      if (silent) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

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
    const search = deferredSearchTerm
      .trim()
      .toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !search ||
        (searchIndex.get(item.id) || "").includes(search);

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
    deferredSearchTerm,
    categoryFilter,
    statusFilter,
    searchIndex,
  ]);

  const {
    sortedItems,
    sortField,
    sortDirection,
    handleSort,
    getSortMeta,
  } = useSort(filteredItems);

  const selectedItemsSet = useMemo(
    () => new Set(selectedItems),
    [selectedItems]
  );

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("");
    clearSelection();
  }, [clearSelection]);

  const handleToggleSelect = useCallback((id) => {
    setSelectedItems((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (itemId) => itemId !== id
        );
      }

      return [...previous, id];
    });
  }, []);

  const handleToggleSelectAll = useCallback((currentItems) => {
    const ids = currentItems.map(
      (item) => item.id
    );

    const allSelected = ids.every((id) =>
      selectedItemsSet.has(id)
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
  }, [selectedItemsSet]);

  async function handleDelete(item) {
    try {
      await deleteInventory(item.id);

      await loadInventory();
      toast.success("Article supprime.");
    } catch (error) {
      console.error(error);

      toast.error("Impossible de supprimer la carte.");
    }
  }

  async function handleRefreshMarket(item) {
    try {
      const result = await refreshInventoryMarket(item.id);
      await loadInventory({ silent: true });

      if (result && result.marketLinkStatus === "MULTIPLE_MATCHES") {
        return {
          type: "multiple_matches",
          item,
          matches: result.marketMatches || [],
        };
      }

      toast.success("Mise a jour Market appliquee.");
      return { type: "updated", item, result };
    } catch (error) {
      console.error(error);
      toast.error("Impossible de rafraichir le Market pour cette carte.");
      return { type: "error", item };
    }
  }

  const selectedCount = selectedItems.length;

  return {
    loading,
    refreshing,
    error,
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
    getSortMeta,

    sortedItems,

    loadInventory,
    handleDelete,
    handleRefreshMarket,

    handleToggleSelect,
    handleToggleSelectAll,

    selectedCount,
  };
}