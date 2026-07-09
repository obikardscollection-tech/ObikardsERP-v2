import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
} from "../services/expensesService";

export default function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les dépenses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const filteredExpenses = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !search ||
        expense.expenseNumber?.toLowerCase().includes(search) ||
        expense.supplier?.name?.toLowerCase().includes(search) ||
        expense.supplier?.company?.toLowerCase().includes(search) ||
        expense.category?.toLowerCase().includes(search) ||
        expense.title?.toLowerCase().includes(search);

      const matchesCategory = !categoryFilter || expense.category === categoryFilter;
      const matchesPaymentMethod = !paymentMethodFilter || expense.paymentMethod === paymentMethodFilter;
      const matchesDate = !dateFilter || new Date(expense.expenseDate).toISOString().slice(0, 10) === dateFilter;

      return matchesSearch && matchesCategory && matchesPaymentMethod && matchesDate;
    });
  }, [categoryFilter, dateFilter, expenses, paymentMethodFilter, searchTerm]);

  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map((expense) => expense.category).filter(Boolean))).sort();
  }, [expenses]);

  const paymentMethods = useMemo(() => {
    return Array.from(new Set(expenses.map((expense) => expense.paymentMethod).filter(Boolean))).sort();
  }, [expenses]);

  function resetFilters() {
    setSearchTerm("");
    setCategoryFilter("");
    setPaymentMethodFilter("");
    setDateFilter("");
  }

  async function addExpense(payload) {
    await createExpense(payload);
    await loadExpenses();
  }

  async function editExpense(id, payload) {
    await updateExpense(id, payload);
    await loadExpenses();
  }

  async function removeExpense(id) {
    await deleteExpense(id);
    await loadExpenses();
  }

  async function fetchExpense(id) {
    return getExpense(id);
  }

  return {
    expenses,
    filteredExpenses,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    dateFilter,
    setDateFilter,
    categories,
    paymentMethods,
    resetFilters,
    loadExpenses,
    addExpense,
    editExpense,
    removeExpense,
    fetchExpense,
  };
}
