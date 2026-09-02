import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/layout/Sidebar";
import ExpenseDetails from "../components/expenses/ExpenseDetails";
import ExpenseDrawer from "../components/expenses/ExpenseDrawer";
import ExpenseFilters from "../components/expenses/ExpenseFilters";
import DeleteExpenseModal from "../components/expenses/DeleteExpenseModal";
import ExpensesStats from "../components/expenses/ExpensesStats";
import ExpensesTable from "../components/expenses/ExpensesTable";
import ExpensesToolbar from "../components/expenses/ExpensesToolbar";
import useExpenses from "../hooks/useExpenses";
import { getSuppliers } from "../services/suppliersService";

function ExpensesPage() {
  const {
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
  } = useExpenses();

  const [supplierList, setSupplierList] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  useEffect(() => {
    async function loadRelatedData() {
      try {
        const suppliersData = await getSuppliers();
        setSupplierList(suppliersData);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les fournisseurs.");
      }
    }

    loadRelatedData();
  }, []);

  function handleCreate() {
    setSelectedExpense(null);
    setDrawerOpen(true);
  }

  function handleEdit(expense) {
    setSelectedExpense(expense);
    setDrawerOpen(true);
  }

  function handleView(expense) {
    setSelectedExpense(expense);
    setDetailsOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedExpense(null);
  }

  function handleCloseDetails() {
    setDetailsOpen(false);
    setSelectedExpense(null);
  }

  async function handleDelete(expense) {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  }

  function handleCloseDeleteModal() {
    setDeleteModalOpen(false);
    setExpenseToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!expenseToDelete) {
      return;
    }

    try {
      await removeExpense(expenseToDelete.id);
      toast.success("Dépense supprimée avec succès.");
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer la dépense.");
    }
  }

  async function handleSaved() {
    toast.success("Dépense enregistrée avec succès.");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 xl:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dépenses</h1>
            <p className="mt-1 text-sm text-slate-500">Gestion et suivi des dépenses.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-slate-500">Chargement des dépenses...</p>
          </div>
        ) : (
          <>
            <ExpensesStats expenses={filteredExpenses} />

            <ExpensesToolbar
              onCreate={handleCreate}
              onRefresh={loadExpenses}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filtersOpen={filtersOpen}
              onToggleFilters={() => setFiltersOpen((value) => !value)}
            />

            {filtersOpen && (
              <ExpenseFilters
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                paymentMethodFilter={paymentMethodFilter}
                onPaymentMethodChange={setPaymentMethodFilter}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
                categories={categories}
                paymentMethods={paymentMethods}
                onReset={resetFilters}
              />
            )}

            <ExpensesTable expenses={filteredExpenses} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
          </>
        )}

        <ExpenseDrawer open={drawerOpen} expense={selectedExpense} suppliers={supplierList} onClose={handleCloseDrawer} onSaved={handleSaved} addExpense={addExpense} editExpense={editExpense} />

        <ExpenseDetails open={detailsOpen} expense={selectedExpense} onClose={handleCloseDetails} />

        <DeleteExpenseModal
          open={deleteModalOpen}
          expense={expenseToDelete}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </div>
  );
}

export default ExpensesPage;
