import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/layout/Sidebar";
import DeletePurchaseModal from "../components/purchases/DeletePurchaseModal";
import PurchaseDetails from "../components/purchases/PurchaseDetails";
import PurchaseDrawer from "../components/purchases/PurchaseDrawer";
import PurchaseFilters from "../components/purchases/PurchaseFilters";
import PurchaseHeader from "../components/purchases/PurchaseHeader";
import PurchaseStats from "../components/purchases/PurchaseStats";
import PurchaseTable from "../components/purchases/PurchaseTable";
import PurchaseToolbar from "../components/purchases/PurchaseToolbar";
import usePurchases from "../hooks/usePurchases";
import useSuppliers from "../hooks/useSuppliers";

function PurchasePage() {
  const navigate = useNavigate();
  const {
    purchases,
    filteredPurchases,
    loading,
    searchTerm,
    setSearchTerm,
    platformFilter,
    setPlatformFilter,
    statusFilter,
    setStatusFilter,
    platforms,
    statuses,
    resetFilters,
    loadPurchases,
    removePurchase,
  } = usePurchases();

  const { suppliers } = useSuppliers();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  function handleCreate() {
    setSelectedPurchase(null);
    setDrawerOpen(true);
  }

  function handleEdit(purchase) {
    setSelectedPurchase(purchase);
    setDrawerOpen(true);
  }

  function handleView(purchase) {
    setSelectedPurchase(purchase);
    setDetailsOpen(true);
  }

  function handleReceive(purchase) {
    navigate("/receptions", { state: { purchaseId: purchase.id } });
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedPurchase(null);
  }

  function handleCloseDetails() {
    setDetailsOpen(false);
    setSelectedPurchase(null);
  }

  async function handleDelete(purchase) {
    setPurchaseToDelete(purchase);
    setDeleteModalOpen(true);
  }

  function handleCloseDeleteModal() {
    setDeleteModalOpen(false);
    setPurchaseToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!purchaseToDelete) {
      return;
    }

    try {
      await removePurchase(purchaseToDelete.id);
      toast.success("Achat supprime avec succes.");
      handleCloseDeleteModal();
    } catch (error) {
      console.error(error);
      toast.error("Impossible de supprimer l'achat.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 xl:p-8">
        <PurchaseHeader
          totalPurchases={filteredPurchases.length}
          onCreate={handleCreate}
        />

        <PurchaseStats purchases={purchases} />

        <PurchaseToolbar onCreate={handleCreate} />

        <PurchaseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          platforms={platforms}
          statuses={statuses}
          onReset={resetFilters}
        />

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            Chargement...
          </div>
        ) : (
          <PurchaseTable
            purchases={filteredPurchases}
            onView={handleView}
            onEdit={handleEdit}
            onReceive={handleReceive}
            onDelete={handleDelete}
          />
        )}
      </main>

      <PurchaseDrawer
        open={drawerOpen}
        purchase={selectedPurchase}
        suppliers={suppliers}
        onClose={handleCloseDrawer}
        onSaved={loadPurchases}
      />

      <PurchaseDetails
        open={detailsOpen}
        purchase={selectedPurchase}
        onClose={handleCloseDetails}
      />

      <DeletePurchaseModal
        open={deleteModalOpen}
        purchase={purchaseToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default PurchasePage;
