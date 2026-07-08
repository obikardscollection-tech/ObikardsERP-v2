import { useCallback, useEffect, useState } from "react";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/suppliersService";

export default function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    loadSuppliers();
  }, [loadSuppliers]);

  async function addSupplier(supplier) {
    await createSupplier(supplier);
    await loadSuppliers();
  }

  async function editSupplier(id, supplier) {
    await updateSupplier(id, supplier);
    await loadSuppliers();
  }

  async function removeSupplier(id) {
    await deleteSupplier(id);
    await loadSuppliers();
  }

  return {
    suppliers,
    loading,
    loadSuppliers,
    addSupplier,
    editSupplier,
    removeSupplier,
  };
}