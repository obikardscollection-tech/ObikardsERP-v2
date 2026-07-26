import { useCallback, useEffect, useRef, useState } from "react";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/suppliersService";

export default function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedInitiallyRef = useRef(false);

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getSuppliers();

      setSuppliers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des fournisseurs :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedInitiallyRef.current) {
      return;
    }

    hasLoadedInitiallyRef.current = true;
    loadSuppliers();
  }, [loadSuppliers]);

  const addSupplier = useCallback(async (supplier) => {
    await createSupplier(supplier);
    await loadSuppliers();
  }, [loadSuppliers]);

  const editSupplier = useCallback(async (id, supplier) => {
    await updateSupplier(id, supplier);
    await loadSuppliers();
  }, [loadSuppliers]);

  const removeSupplier = useCallback(async (id) => {
    await deleteSupplier(id);
    await loadSuppliers();
  }, [loadSuppliers]);

  return {
    suppliers,
    loading,
    loadSuppliers,
    addSupplier,
    editSupplier,
    removeSupplier,
  };
}