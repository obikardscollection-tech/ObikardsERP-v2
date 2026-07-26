import { useCallback, useMemo, useState } from "react";
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

  const search = useMemo(
    () => searchTerm.toLowerCase(),
    [searchTerm]
  );

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) => {
        if (!search) {
          return true;
        }

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
      }),
    [suppliers, search]
  );

  const handleCreate = useCallback(() => {
    setSelectedSupplier(null);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((supplier) => {
    setSelectedSupplier(supplier);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedSupplier(null);
  }, []);

  const handleAskDelete = useCallback((supplier) => {
    setSupplierToDelete(supplier);
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!supplierToDelete) {
      return;
    }

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
  }, [removeSupplier, supplierToDelete]);

  const handleCloseDelete = useCallback(() => {
    setDeleteOpen(false);
    setSupplierToDelete(null);
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 xl:p-8">
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
          onReset={handleResetSearch}
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