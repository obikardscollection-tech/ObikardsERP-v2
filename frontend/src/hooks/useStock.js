import { useState } from "react";
import toast from "react-hot-toast";

import {
  adjustStock,
  getStockHistory,
} from "../services/stockMovementService";

export default function useStock(loadInventory) {
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState(null);

  const [movements, setMovements] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  async function loadHistory(inventoryId) {
    try {
      setHistoryLoading(true);

      const data = await getStockHistory(inventoryId);

      setMovements(data);
    } catch (error) {
      console.error(error);

      toast.error("Impossible de charger l'historique.");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function openStockModal(item) {
    setSelectedStockItem(item);

    await loadHistory(item.id);

    setStockModalOpen(true);
  }

  function closeStockModal() {
    setSelectedStockItem(null);

    setMovements([]);

    setStockModalOpen(false);
  }

  async function submitStock(data) {
    try {
      setLoading(true);

      await adjustStock(data);

      await loadInventory();

      await loadHistory(data.inventoryId);

      closeStockModal();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.error ??
          "Impossible de modifier le stock."
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,

    stockModalOpen,
    selectedStockItem,

    movements,
    historyLoading,

    openStockModal,
    closeStockModal,

    submitStock,
  };
}