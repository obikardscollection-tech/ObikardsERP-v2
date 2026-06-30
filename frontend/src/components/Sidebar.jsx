import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Settings,
} from "lucide-react";

const menu = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Package, label: "Inventaire", active: true },
  { icon: ShoppingCart, label: "Ventes" },
  { icon: Truck, label: "Achats" },
  { icon: Users, label: "Clients" },
  { icon: BarChart3, label: "Statistiques" },
  { icon: Settings, label: "Paramètres" },
];

export default function Sidebar() {
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
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 mb-2 transition

              ${
                item.active
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}

      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        © Obikards ERP
      </div>

    </aside>
  );
}