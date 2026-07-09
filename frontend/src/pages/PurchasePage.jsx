import { useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/layout/Sidebar";
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

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedPurchase(null);
  }

  function handleCloseDetails() {
    setDetailsOpen(false);
    setSelectedPurchase(null);
  }

  async function handleDelete(purchase) {
    const confirmed = window.confirm(
      `Supprimer l'achat ${purchase.purchaseNumber} ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await removePurchase(purchase.id);
      toast.success("Achat supprime avec succes.");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de supprimer l'achat.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
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
    </div>
  );
}

export default PurchasePage;
