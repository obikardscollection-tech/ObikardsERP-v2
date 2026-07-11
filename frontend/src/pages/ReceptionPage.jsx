import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/layout/Sidebar";
import ReceptionDetails from "../components/receptions/ReceptionDetails";
import ReceptionDrawer from "../components/receptions/ReceptionDrawer";
import ReceptionFilters from "../components/receptions/ReceptionFilters";
import ReceptionStats from "../components/receptions/ReceptionStats";
import ReceptionTable from "../components/receptions/ReceptionTable";
import ReceptionToolbar from "../components/receptions/ReceptionToolbar";
import useReceptions from "../hooks/useReceptions";
import { getPurchases } from "../services/purchaseService";

function getReceptionStatus(reception) {
  if (!reception) {
    return "EN_ATTENTE";
  }

  if (Number(reception.remainingQuantity || 0) <= 0) {
    return "TERMINEE";
  }

  if (Number(reception.totalQuantity || 0) <= 0) {
    return "EN_ATTENTE";
  }

  return "PARTIELLE";
}

function formatStatusLabel(status) {
  switch (status) {
    case "TERMINEE":
      return "Terminée";
    case "PARTIELLE":
      return "Partielle";
    default:
      return "En attente";
  }
}

function ReceptionPage() {
  const {
    receptions,
    loading,
    error,
    loadReceptions,
    addReception,
    editReception,
    removeReception,
  } = useReceptions();

  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [purchaseFilter, setPurchaseFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedReception, setSelectedReception] = useState(null);
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

  const filteredReceptions = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return receptions.filter((reception) => {
      const status = getReceptionStatus(reception);
      const matchesSearch =
        !search ||
        reception.receptionNumber?.toLowerCase().includes(search) ||
        reception.purchase?.purchaseNumber?.toLowerCase().includes(search) ||
        reception.purchase?.supplier?.name?.toLowerCase().includes(search) ||
        reception.purchase?.supplier?.company?.toLowerCase().includes(search);

      const matchesStatus = !statusFilter || status === statusFilter;
      const matchesPurchase = !purchaseFilter || reception.purchaseId === purchaseFilter;
      const matchesDate =
        !dateFilter ||
        new Date(reception.receivedAt).toISOString().slice(0, 10) === dateFilter;

      return matchesSearch && matchesStatus && matchesPurchase && matchesDate;
    });
  }, [dateFilter, purchaseFilter, receptions, searchTerm, statusFilter]);

  function handleCreate() {
    setSelectedReception(null);
    setDrawerOpen(true);
  }

  function handleEdit(reception) {
    setSelectedReception(reception);
    setDrawerOpen(true);
  }

  function handleView(reception) {
    setSelectedReception(reception);
    setDetailsOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedReception(null);
  }

  function handleCloseDetails() {
    setDetailsOpen(false);
    setSelectedReception(null);
  }

  async function handleDelete(reception) {
    const confirmed = window.confirm(`Supprimer la réception ${reception.receptionNumber} ?`);

    if (!confirmed) {
      return;
    }

    try {
      await removeReception(reception.id);
      toast.success("Réception supprimée avec succès.");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer la réception.");
    }
  }

  async function handleReceiveAll(reception) {
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
    if (
      !receptionToReceiveAll ||
      Number(receptionToReceiveAll.remainingQuantity || 0) <= 0
    ) {
      handleCloseReceiveAllConfirm();
      return;
    }

    try {
      const items = (receptionToReceiveAll.receptionItems || []).map((item) => ({
        purchaseItemId: item.purchaseItemId,
        quantityReceived:
          Number(item.quantityReceived || 0) +
          Number(item.quantityRemaining || 0),
        notes: item.notes || null,
      }));

      await editReception(receptionToReceiveAll.id, {
        purchaseId: receptionToReceiveAll.purchaseId,
        receivedAt: receptionToReceiveAll.receivedAt,
        notes: receptionToReceiveAll.notes || null,
        items,
      });

      await loadReceptions();
      toast.success("Réception complète enregistrée.");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de tout réceptionner.");
    } finally {
      handleCloseReceiveAllConfirm();
    }
  }

  async function handleSaved() {
    try {
      await loadReceptions();
      toast.success("Réception enregistrée avec succès.");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de rafraîchir la liste.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Réceptions</h1>
            <p className="mt-1 text-sm text-slate-500">Suivi des réceptions liées aux achats.</p>
          </div>
        </div>

        <ReceptionStats receptions={receptions} />

        <ReceptionToolbar
          onCreate={handleCreate}
          onRefresh={loadReceptions}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filtersOpen={showFilters}
          onToggleFilters={() => setShowFilters((value) => !value)}
        />

        {showFilters && (
          <ReceptionFilters
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            purchaseFilter={purchaseFilter}
            onPurchaseChange={setPurchaseFilter}
            purchases={purchases}
            onReset={() => {
              setSearchTerm("");
              setStatusFilter("");
              setPurchaseFilter("");
              setDateFilter("");
            }}
          />
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">Chargement...</div>
        ) : error ? (
          <div className="rounded-xl bg-white p-10 text-center text-red-600 shadow">{error}</div>
        ) : (
          <ReceptionTable
            receptions={filteredReceptions}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReceiveAll={handleReceiveAll}
            formatStatusLabel={formatStatusLabel}
          />
        )}
      </main>

      <ReceptionDrawer
        open={drawerOpen}
        reception={selectedReception}
        purchases={purchases}
        onClose={handleCloseDrawer}
        onSaved={handleSaved}
        addReception={addReception}
        editReception={editReception}
      />

      <ReceptionDetails
        open={detailsOpen}
        reception={selectedReception}
        onClose={handleCloseDetails}
      />

      {receiveAllConfirmOpen && receptionToReceiveAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">
              Tout réceptionner
            </h2>

            <p className="mt-4 text-slate-600">
              Voulez-vous réceptionner toutes les quantités restantes de cette réception ?
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
                Tout réceptionner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionPage;
