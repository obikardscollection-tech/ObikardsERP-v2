import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import {
  getReceptions,
} from "../services/receptionService";
import { getReceptionStatus, getReceptionSupplierName } from "../utils/receptionUtils";

import useSort from "./useSort";

export default function useReceptions() {
  const [receptions, setReceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [purchaseFilter, setPurchaseFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [selectedItems, setSelectedItems] = useState([]);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const indexedReceptions = useMemo(() => {
    return receptions.map((reception) => {
      const status = getReceptionStatus(reception);
      const supplierName = getReceptionSupplierName(reception);

      return {
        ...reception,
        _status: status,
        _purchaseNumber: reception.purchase?.purchaseNumber || "",
        _supplierName: supplierName,
        _itemCount: Number(reception.receptionItems?.length || 0),
        _totalQuantity: Number(reception.totalQuantity || 0),
        _remainingQuantity: Number(reception.remainingQuantity || 0),
      };
    });
  }, [receptions]);

  const searchIndex = useMemo(() => {
    return new Map(
      indexedReceptions.map((reception) => {
        const searchable = [
          reception.receptionNumber,
          reception._purchaseNumber,
          reception._supplierName,
          reception.notes,
          reception._status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return [reception.id, searchable];
      })
    );
  }, [indexedReceptions]);

  const loadReceptions = useCallback(async ({ silent = false } = {}) => {
    try {
      setError("");

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getReceptions();
      setReceptions(data);
      setSelectedItems((previous) => {
        const ids = new Set(data.map((reception) => reception.id));
        return previous.filter((id) => ids.has(id));
      });
    } catch (err) {
      console.error(err);

      setError("Impossible de charger les réceptions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReceptions();
  }, [loadReceptions]);

  const filteredReceptions = useMemo(() => {
    const search = deferredSearchTerm.trim().toLowerCase();

    return indexedReceptions.filter((reception) => {
      const matchesSearch =
        !search ||
        (searchIndex.get(reception.id) || "").includes(search);

      const matchesStatus = !statusFilter || reception._status === statusFilter;
      const matchesPurchase = !purchaseFilter || reception.purchaseId === purchaseFilter;
      const matchesDate =
        !dateFilter ||
        new Date(reception.receivedAt).toISOString().slice(0, 10) === dateFilter;

      return matchesSearch && matchesStatus && matchesPurchase && matchesDate;
    });
  }, [dateFilter, deferredSearchTerm, indexedReceptions, purchaseFilter, searchIndex, statusFilter]);

  const {
    sortedItems: sortedReceptions,
    sortField,
    sortDirection,
    handleSort,
    getSortMeta,
  } = useSort(filteredReceptions);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchTerm, statusFilter, purchaseFilter, dateFilter]);

  const totalResults = sortedReceptions.length;
  const totalPages =
    itemsPerPage >= totalResults
      ? 1
      : Math.max(1, Math.ceil(totalResults / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedReceptions = useMemo(() => {
    if (itemsPerPage >= totalResults) {
      return sortedReceptions;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedReceptions.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, sortedReceptions, totalResults]);

  const pageStart = totalResults === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const pageEnd = totalResults === 0
    ? 0
    : Math.min((currentPage - 1) * itemsPerPage + paginatedReceptions.length, totalResults);

  const selectedItemsSet = useMemo(
    () => new Set(selectedItems),
    [selectedItems]
  );

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setPurchaseFilter("");
    setDateFilter("");
    setCurrentPage(1);
    clearSelection();
  }, [clearSelection]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage((previous) => {
      const nextPage = Number(page);

      if (Number.isNaN(nextPage)) {
        return previous;
      }

      if (nextPage < 1) {
        return 1;
      }

      if (nextPage > totalPages) {
        return totalPages;
      }

      return nextPage;
    });
  }, [totalPages]);

  const handleItemsPerPageChange = useCallback((value) => {
    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue) || parsedValue <= 0) {
      return;
    }

    setItemsPerPage(parsedValue);
    setCurrentPage(1);
  }, []);

  const handleToggleSelect = useCallback((id) => {
    setSelectedItems((previous) => {
      if (previous.includes(id)) {
        return previous.filter((itemId) => itemId !== id);
      }

      return [...previous, id];
    });
  }, []);

  const handleToggleSelectAll = useCallback((currentItems) => {
    const ids = currentItems.map((item) => item.id);
    const allSelected = ids.every((id) => selectedItemsSet.has(id));

    if (allSelected) {
      setSelectedItems((previous) => previous.filter((id) => !ids.includes(id)));
      return;
    }

    setSelectedItems((previous) => [...new Set([...previous, ...ids])]);
  }, [selectedItemsSet]);

  return {
    receptions,
    filteredReceptions,
    sortedReceptions,
    paginatedReceptions,
    totalResults,
    loading,
    refreshing,
    error,

    searchTerm,
    setSearchTerm,

    statusFilter,
    setStatusFilter,

    purchaseFilter,
    setPurchaseFilter,

    dateFilter,
    setDateFilter,

    selectedItems,
    selectedCount: selectedItems.length,
    clearSelection,
    handleToggleSelect,
    handleToggleSelectAll,

    sortField,
    sortDirection,
    handleSort,
    getSortMeta,

    currentPage,
    totalPages,
    itemsPerPage,
    pageStart,
    pageEnd,
    handlePageChange,
    handleItemsPerPageChange,

    resetFilters,
    loadReceptions,
  };
}
