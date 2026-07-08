import { useCallback, useEffect, useState } from "react";

import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../services/purchasesService";

export default function usePurchases() {
  const [purchases, setPurchases] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadPurchases =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getPurchases();

        setPurchases(data);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des achats :",
          error
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  async function addPurchase(
    purchase
  ) {
    await createPurchase(purchase);

    await loadPurchases();
  }

  async function editPurchase(
    id,
    purchase
  ) {
    await updatePurchase(
      id,
      purchase
    );

    await loadPurchases();
  }

  async function removePurchase(id) {
    await deletePurchase(id);

    await loadPurchases();
  }

  return {
    purchases,
    loading,

    loadPurchases,

    addPurchase,
    editPurchase,
    removePurchase,
  };
}