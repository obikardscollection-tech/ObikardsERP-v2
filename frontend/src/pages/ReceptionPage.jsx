import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "../components/layout/Sidebar";
import DeleteReceptionModal from "../components/receptions/DeleteReceptionModal";
import ReceptionContent from "../components/receptions/ReceptionContent";
import ReceptionDetails from "../components/receptions/ReceptionDetails";
import ReceptionDrawer from "../components/receptions/ReceptionDrawer";
import ReceptionHeader from "../components/receptions/ReceptionHeader";
import useReceptions from "../hooks/useReceptions";
import { getPurchases } from "../services/purchaseService";
import {
  createReception,
  deleteReception,
  updateReception,
} from "../services/receptionService";

function ReceptionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    loading,
    refreshing,
    error,
    sortedReceptions,
    paginatedReceptions,
    totalResults,

    searchTerm,
    setSearchTerm,

    statusFilter,
    setStatusFilter,

    purchaseFilter,
    setPurchaseFilter,

    dateFilter,
    setDateFilter,

    selectedItems,
    selectedCount,
    clearSelection,
    handleToggleSelect,
    handleToggleSelectAll,

    sortField,
    sortDirection,
    handleSort,
    getSortMeta,

    currentPage,
    totalPages,
    itemsPerPage,
    pageStart,
    pageEnd,
    handlePageChange,
    handleItemsPerPageChange,

    resetFilters,
    loadReceptions,
  } = useReceptions();

  const [purchases, setPurchases] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedReception, setSelectedReception] = useState(null);
  const [initialPurchaseId, setInitialPurchaseId] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [receptionToDelete, setReceptionToDelete] = useState(null);
  const [receiveAllConfirmOpen, setReceiveAllConfirmOpen] = useState(false);
  const [receptionToReceiveAll, setReceptionToReceiveAll] = useState(null);

  useEffect(() => {
    async function loadPurchases() {
      try {
        const data = await getPurchases();
        setPurchases(data);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les achats.");
      }
    }

    loadPurchases();
  }, []);

  useEffect(() => {
    const purchaseId = location.state?.purchaseId;

    if (!purchaseId) {
      return;
    }

    setSelectedReception(null);
    setInitialPurchaseId(purchaseId);
    setDrawerOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  function handleCreate() {
    setSelectedReception(null);
    setInitialPurchaseId("");
    setDrawerOpen(true);
  }

  function handleEdit(reception) {
    setSelectedReception(reception);
    setInitialPurchaseId("");
    setDrawerOpen(true);
  }

  function handleView(reception) {
    setSelectedReception(reception);
    setDetailsOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedReception(null);
    setInitialPurchaseId("");
  }

  function handleCloseDetails() {
    setDetailsOpen(false);
    setSelectedReception(null);
  }

  function handleDelete(reception) {
    if (reception?.isVirtual) {
      toast.error("Un plan de reception ne peut pas etre supprime.");
      return;
    }

    setReceptionToDelete(reception);
    setDeleteModalOpen(true);
  }

  function handleCloseDeleteModal() {
    setDeleteModalOpen(false);
    setReceptionToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!receptionToDelete) {
      return;
    }

    try {
      await deleteReception(receptionToDelete.id);
      await loadReceptions();
      toast.success("Reception supprimee avec succes.");
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer la reception.");
    }
  }

  async function handleAddReception(payload) {
    await createReception(payload);
  }

  async function handleEditReception(id, payload) {
    await updateReception(id, payload);
  }

  function handleReceiveAll(reception) {
    if (!reception || Number(reception.remainingQuantity || 0) <= 0) {
      return;
    }

    setReceptionToReceiveAll(reception);
    setReceiveAllConfirmOpen(true);
  }

  function handleCloseReceiveAllConfirm() {
    setReceiveAllConfirmOpen(false);
    setReceptionToReceiveAll(null);
  }

  async function handleConfirmReceiveAll() {
    if (!receptionToReceiveAll || Number(receptionToReceiveAll.remainingQuantity || 0) <= 0) {
      handleCloseReceiveAllConfirm();
      return;
    }

    try {
      const items = (receptionToReceiveAll.receptionItems || []).map((item) => ({
        purchaseItemId: item.purchaseItemId,
        quantityReceived: Number(item.quantityReceived || 0) + Number(item.quantityRemaining || 0),
        notes: item.notes || null,
      }));

      await updateReception(receptionToReceiveAll.id, {
        purchaseId: receptionToReceiveAll.purchaseId,
        receivedAt: receptionToReceiveAll.receivedAt,
        notes: receptionToReceiveAll.notes || null,
        items,
      });

      await loadReceptions();
      toast.success("Reception complete enregistree.");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de tout receptionner.");
    } finally {
      handleCloseReceiveAllConfirm();
    }
  }

  async function handleSaved() {
    try {
      await loadReceptions();
      toast.success("Reception enregistree avec succes.");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de rafraichir la liste.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 xl:p-8">
        <ReceptionHeader
          totalItems={totalResults}
          selectedCount={selectedCount}
          refreshing={refreshing}
          onCreate={handleCreate}
          onRefresh={() => loadReceptions({ silent: true })}
        />

        <ReceptionContent
          loading={loading}
          refreshing={refreshing}
          error={error}
          statsReceptions={sortedReceptions}
          receptions={paginatedReceptions}
          totalResults={totalResults}
          purchases={purchases}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((previous) => !previous)}
          onRetry={() => loadReceptions()}
          onRefresh={() => loadReceptions({ silent: true })}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReceiveAll={handleReceiveAll}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          purchaseFilter={purchaseFilter}
          onPurchaseChange={setPurchaseFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          onReset={resetFilters}
          sortField={sortField}
          sortDirection={sortDirection}
          getSortMeta={getSortMeta}
          onSort={handleSort}
          selectedItems={selectedItems}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          clearSelection={clearSelection}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          pageStart={pageStart}
          pageEnd={pageEnd}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </main>

      <ReceptionDrawer
        open={drawerOpen}
        reception={selectedReception}
        initialPurchaseId={initialPurchaseId}
        purchases={purchases}
        onClose={handleCloseDrawer}
        onSaved={handleSaved}
        addReception={handleAddReception}
        editReception={handleEditReception}
      />

      <ReceptionDetails
        open={detailsOpen}
        reception={selectedReception}
        onClose={handleCloseDetails}
      />

      <DeleteReceptionModal
        open={deleteModalOpen}
        reception={receptionToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />

      {receiveAllConfirmOpen && receptionToReceiveAll ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">
              Tout receptionner
            </h2>

            <p className="mt-4 text-slate-600">
              Voulez-vous receptionner toutes les quantites restantes de cette reception ?
            </p>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={handleCloseReceiveAllConfirm}
                className="rounded-lg border border-slate-300 px-5 py-2 transition hover:bg-slate-100"
              >
                Annuler
              </button>

              <button
                onClick={handleConfirmReceiveAll}
                className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white transition hover:bg-emerald-700"
              >
                Tout receptionner
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ReceptionPage;
