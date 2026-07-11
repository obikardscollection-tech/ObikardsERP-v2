import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Sidebar from "../components/layout/Sidebar";
import DeleteSaleModal from "../components/sales/DeleteSaleModal";
import SaleDetails from "../components/sales/SaleDetails";
import SaleDrawer from "../components/sales/SaleDrawer";
import SaleFilters from "../components/sales/SaleFilters";
import SalesStats from "../components/sales/SalesStats";
import SalesTable from "../components/sales/SalesTable";
import SalesToolbar from "../components/sales/SalesToolbar";
import useSales from "../hooks/useSales";
import { getCustomers } from "../services/customersService";
import { getInventory } from "../services/inventoryService";

function SalesPage() {
  const {
    sales,
    filteredSales,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    platformFilter,
    setPlatformFilter,
    customerFilter,
    setCustomerFilter,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    platforms,
    customers,
    statuses,
    resetFilters,
    loadSales,
    addSale,
    editSale,
    removeSale,
  } = useSales();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);

  useEffect(() => {
    async function loadRelatedData() {
      try {
        const [inventoryData, customersData] = await Promise.all([getInventory(), getCustomers()]);
        setInventoryItems(inventoryData);
        setCustomerList(customersData);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les données liées aux ventes.");
      }
    }

    loadRelatedData();
  }, []);

  function handleCreate() {
    setSelectedSale(null);
    setDrawerOpen(true);
  }

  function handleEdit(sale) {
    setSelectedSale(sale);
    setDrawerOpen(true);
  }

  function handleView(sale) {
    setSelectedSale(sale);
    setDetailsOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setSelectedSale(null);
  }

  function handleCloseDetails() {
    setDetailsOpen(false);
    setSelectedSale(null);
  }

  async function handleDelete(sale) {
    setSaleToDelete(sale);
    setDeleteModalOpen(true);
  }

  function handleCloseDeleteModal() {
    setDeleteModalOpen(false);
    setSaleToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!saleToDelete) {
      return;
    }

    try {
      await removeSale(saleToDelete.id);
      toast.success("Vente supprimée avec succès.");
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer la vente.");
    }
  }

  async function handleSaved() {
    try {
      await loadSales();
      toast.success("Vente enregistrée avec succès.");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de rafraîchir la liste.");
    }
  }

  const totalRevenue = useMemo(() => filteredSales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0), [filteredSales]);
  const totalProfit = useMemo(() => filteredSales.reduce((sum, sale) => sum + Number(sale.profit || 0), 0), [filteredSales]);
  const totalItems = useMemo(() => filteredSales.reduce((sum, sale) => sum + Number(sale.totalItems || 0), 0), [filteredSales]);
  const averageBasket = filteredSales.length ? totalRevenue / filteredSales.length : 0;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ventes</h1>
            <p className="mt-1 text-sm text-slate-500">Suivi des ventes et des articles associés.</p>
          </div>
        </div>

        <SalesStats sales={filteredSales} revenue={totalRevenue} profit={totalProfit} items={totalItems} averageBasket={averageBasket} />

        <SalesToolbar onCreate={handleCreate} onRefresh={loadSales} searchTerm={searchTerm} onSearchChange={setSearchTerm} filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen((value) => !value)} />

        {filtersOpen && (
          <SaleFilters
            platformFilter={platformFilter}
            onPlatformChange={setPlatformFilter}
            customerFilter={customerFilter}
            onCustomerChange={setCustomerFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            platforms={platforms}
            customers={customerList}
            statuses={statuses}
            onReset={resetFilters}
          />
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">Chargement...</div>
        ) : error ? (
          <div className="rounded-xl bg-white p-10 text-center text-red-600 shadow">{error}</div>
        ) : (
          <SalesTable sales={filteredSales} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </main>

      <SaleDrawer open={drawerOpen} sale={selectedSale} inventoryItems={inventoryItems} customers={customerList} onClose={handleCloseDrawer} onSaved={handleSaved} addSale={addSale} editSale={editSale} />

      <SaleDetails open={detailsOpen} sale={selectedSale} onClose={handleCloseDetails} />

      <DeleteSaleModal
        open={deleteModalOpen}
        sale={saleToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default SalesPage;
