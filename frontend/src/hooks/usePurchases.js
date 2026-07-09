import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../services/purchaseService";

export default function usePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getPurchases();

      setPurchases(data);
    } catch (error) {
      console.error("Erreur lors du chargement des achats :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const filteredPurchases = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return purchases.filter((purchase) => {
      const matchesSearch =
        !search ||
        purchase.purchaseNumber
          ?.toLowerCase()
          .includes(search) ||
        purchase.supplier?.name
          ?.toLowerCase()
          .includes(search) ||
        purchase.supplier?.company
          ?.toLowerCase()
          .includes(search) ||
        purchase.notes
          ?.toLowerCase()
          .includes(search);

      const matchesPlatform =
        !platformFilter ||
        purchase.platform === platformFilter;

      const matchesStatus =
        !statusFilter ||
        purchase.status === statusFilter;

      return (
        matchesSearch &&
        matchesPlatform &&
        matchesStatus
      );
    });
  }, [
    purchases,
    searchTerm,
    platformFilter,
    statusFilter,
  ]);

  const platforms = useMemo(() => {
    return Array.from(
      new Set(
        purchases
          .map((purchase) => purchase.platform)
          .filter(Boolean)
      )
    ).sort();
  }, [purchases]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        purchases
          .map((purchase) => purchase.status)
          .filter(Boolean)
      )
    ).sort();
  }, [purchases]);

  function resetFilters() {
    setSearchTerm("");
    setPlatformFilter("");
    setStatusFilter("");
  }

  async function addPurchase(purchase) {
    await createPurchase(purchase);
    await loadPurchases();
  }

  async function editPurchase(id, purchase) {
    await updatePurchase(id, purchase);
    await loadPurchases();
  }

  async function removePurchase(id) {
    await deletePurchase(id);
    await loadPurchases();
  }

  return {
    purchases,
    filteredPurchases,
    loading,
    searchTerm,
    setSearchTerm,
    platformFilter,
    setPlatformFilter,
    statusFilter,
    setStatusFilter,
    platforms,
    statuses,
    resetFilters,
    loadPurchases,
    addPurchase,
    editPurchase,
    removePurchase,
  };
}
