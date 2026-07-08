import { useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/layout/Sidebar";

import SupplierHeader from "../components/suppliers/SupplierHeader";
import SupplierStats from "../components/suppliers/SupplierStats";
import SupplierFilters from "../components/suppliers/SupplierFilters";
import SupplierTable from "../components/suppliers/SupplierTable";
import SupplierDrawer from "../components/suppliers/SupplierDrawer";
import DeleteSupplierModal from "../components/suppliers/DeleteSupplierModal";

import useSuppliers from "../hooks/useSuppliers";

function Suppliers() {
  const {
    suppliers,
    loading,
    loadSuppliers,
    removeSupplier,
  } = useSuppliers();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState(null);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [supplierToDelete, setSupplierToDelete] =
    useState(null);

  const filteredSuppliers =
    suppliers.filter((supplier) => {
      const search =
        searchTerm.toLowerCase();

      return (
        supplier.name
          ?.toLowerCase()
          .includes(search) ||
        supplier.company
          ?.toLowerCase()
          .includes(search) ||
        supplier.email
          ?.toLowerCase()
          .includes(search) ||
        supplier.city
          ?.toLowerCase()
          .includes(search)
      );
    });

  function handleCreate() {
    setSelectedSupplier(null);
    setDrawerOpen(true);
  }

  function handleEdit(supplier) {
    setSelectedSupplier(supplier);
    setDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedSupplier(null);
  }

  function handleAskDelete(supplier) {
    setSupplierToDelete(supplier);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    try {
      await removeSupplier(
        supplierToDelete.id
      );

      toast.success(
        "Fournisseur supprimé avec succès."
      );

      setDeleteOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible de supprimer le fournisseur."
      );
    }
  }

  function handleCloseDelete() {
    setDeleteOpen(false);
    setSupplierToDelete(null);
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <SupplierHeader
          totalSuppliers={
            filteredSuppliers.length
          }
          onCreate={handleCreate}
        />

        <SupplierStats
          suppliers={filteredSuppliers}
        />

        <SupplierFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={() =>
            setSearchTerm("")
          }
        />

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            Chargement...
          </div>
        ) : (
          <SupplierTable
            suppliers={filteredSuppliers}
            onEdit={handleEdit}
            onDelete={handleAskDelete}
          />
        )}
      </main>

      <SupplierDrawer
        open={drawerOpen}
        supplier={selectedSupplier}
        onClose={handleCloseDrawer}
        onSaved={loadSuppliers}
      />

      <DeleteSupplierModal
        open={deleteOpen}
        supplier={supplierToDelete}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default Suppliers;