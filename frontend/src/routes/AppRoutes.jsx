import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import Customers from "../pages/Customers";
import Suppliers from "../pages/Suppliers";
import Purchases from "../pages/Purchases";
import Receptions from "../pages/Receptions";
import Sales from "../pages/Sales";
import Expenses from "../pages/Expenses";
import Statistics from "../pages/Statistics";
import SportsCardsProPage from "../pages/SportsCardsPro/SportsCardsProPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/purchases" element={<Purchases />} />
      <Route path="/receptions" element={<Receptions />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/sports-cards-pro" element={<SportsCardsProPage />} />
    </Routes>
  );
}

export default AppRoutes;