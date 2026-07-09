import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createSale,
  deleteSale,
  getSale,
  getSales,
  updateSale,
} from "../services/salesService";

export default function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSales();
      setSales(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les ventes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const filteredSales = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return sales.filter((sale) => {
      const matchesSearch =
        !search ||
        sale.orderNumber?.toLowerCase().includes(search) ||
        sale.customerName?.toLowerCase().includes(search) ||
        sale.customer?.name?.toLowerCase().includes(search) ||
        sale.customer?.company?.toLowerCase().includes(search) ||
        sale.platform?.toLowerCase().includes(search);

      const matchesPlatform = !platformFilter || sale.platform === platformFilter;
      const matchesCustomer = !customerFilter || sale.customerId === customerFilter;
      const matchesStatus = !statusFilter || sale.status === statusFilter;
      const matchesDate = !dateFilter || new Date(sale.soldAt).toISOString().slice(0, 10) === dateFilter;

      return matchesSearch && matchesPlatform && matchesCustomer && matchesStatus && matchesDate;
    });
  }, [customerFilter, dateFilter, platformFilter, sales, searchTerm, statusFilter]);

  const platforms = useMemo(() => {
    return Array.from(new Set(sales.map((sale) => sale.platform).filter(Boolean))).sort();
  }, [sales]);

  const customers = useMemo(() => {
    return Array.from(new Set(sales.map((sale) => sale.customerId).filter(Boolean))).sort();
  }, [sales]);

  const statuses = useMemo(() => {
    return Array.from(new Set(sales.map((sale) => sale.status).filter(Boolean))).sort();
  }, [sales]);

  function resetFilters() {
    setSearchTerm("");
    setPlatformFilter("");
    setCustomerFilter("");
    setStatusFilter("");
    setDateFilter("");
  }

  async function addSale(payload) {
    await createSale(payload);
    await loadSales();
  }

  async function editSale(id, payload) {
    await updateSale(id, payload);
    await loadSales();
  }

  async function removeSale(id) {
    await deleteSale(id);
    await loadSales();
  }

  async function fetchSale(id) {
    return getSale(id);
  }

  return {
    sales,
    filteredSales,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    platformFilter,
    setPlatformFilter,
    customerFilter,
    setCustomerFilter,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    platforms,
    customers,
    statuses,
    resetFilters,
    loadSales,
    addSale,
    editSale,
    removeSale,
    fetchSale,
  };
}
