import { useState } from "react";

import Sidebar from "../components/layout/Sidebar";

import CustomerHeader from "../components/customers/CustomerHeader";
import CustomerStats from "../components/customers/CustomerStats";
import CustomerFilters from "../components/customers/CustomerFilters";
import CustomerTable from "../components/customers/CustomerTable";
import CustomerDrawer from "../components/customers/CustomerDrawer";
import DeleteCustomerModal from "../components/customers/DeleteCustomerModal";

import useCustomers from "../hooks/useCustomers";

function Customers() {
  const {
    filteredCustomers,
    loading,

    searchTerm,
    setSearchTerm,
    resetFilters,

    loadCustomers,
    handleDelete,
  } = useCustomers();

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [customerToDelete, setCustomerToDelete] =
    useState(null);

  function handleCreate() {
    setSelectedCustomer(null);
    setDrawerOpen(true);
  }

  function handleEdit(customer) {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedCustomer(null);
  }

  function handleAskDelete(customer) {
    setCustomerToDelete(customer);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    await handleDelete(customerToDelete);

    setDeleteOpen(false);
    setCustomerToDelete(null);
  }

  function handleCloseDelete() {
    setDeleteOpen(false);
    setCustomerToDelete(null);
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 xl:p-8">
        <CustomerHeader
          totalCustomers={filteredCustomers.length}
          onCreate={handleCreate}
        />

        <CustomerStats
          customers={filteredCustomers}
        />

        <CustomerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={resetFilters}
        />

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            Chargement...
          </div>
        ) : (
          <CustomerTable
            customers={filteredCustomers}
            onEdit={handleEdit}
            onDelete={handleAskDelete}
          />
        )}
      </main>

      <CustomerDrawer
        open={drawerOpen}
        customer={selectedCustomer}
        onClose={handleCloseDrawer}
        onSaved={loadCustomers}
      />

      <DeleteCustomerModal
        open={deleteOpen}
        customer={customerToDelete}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default Customers;