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
    </div>
  );
}

export default ReceptionPage;
