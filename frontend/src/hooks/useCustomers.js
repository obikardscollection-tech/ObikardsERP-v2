import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  getCustomers,
  deleteCustomer,
} from "../services/customersService";

export default function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  async function loadCustomers() {
    try {
      setLoading(true);

      const data = await getCustomers();

      setCustomers(data);
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de charger les clients."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return customers;
    }

    return customers.filter((customer) =>
      Object.values(customer).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search)
      )
    );
  }, [customers, searchTerm]);

  function resetFilters() {
    setSearchTerm("");
  }

  async function handleDelete(customer) {
    try {
      await deleteCustomer(customer.id);

      toast.success(
        "Client supprimé avec succès."
      );

      await loadCustomers();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de supprimer le client."
      );
    }
  }

  return {
    customers,
    filteredCustomers,

    loading,

    searchTerm,
    setSearchTerm,

    resetFilters,

    loadCustomers,
    handleDelete,
  };
}