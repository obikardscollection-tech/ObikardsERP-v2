import {
  LayoutDashboard,
  Package,
  ChartNoAxesCombined,
  ShoppingCart,
  Truck,
  Users,
  Receipt,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    to: "/dashboard",
  },
  {
    icon: Package,
    label: "Inventaire",
    to: "/inventory",
  },
  {
    icon: ChartNoAxesCombined,
    label: "Statistiques",
    to: "/statistics",
  },
  {
    icon: Users,
    label: "Clients",
    to: "/customers",
  },
  {
    icon: Truck,
    label: "Fournisseurs",
    to: "/suppliers",
  },
  {
    icon: ShoppingCart,
    label: "Achats",
    to: "/purchases",
  },
  {
    icon: Receipt,
    label: "Réceptions",
    to: "/receptions",
  },
  {
    icon: ShoppingCart,
    label: "Ventes",
    to: "/sales",
  },
  {
    icon: Receipt,
    label: "Dépenses",
    to: "/expenses",
  },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold tracking-wide">
          OBIKARDS
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          ERP v2
        </p>
      </div>

      <nav className="flex-1 p-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-4 py-3 mb-2 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        © Obikards ERP
      </div>
    </aside>
  );
}

export default Sidebar;