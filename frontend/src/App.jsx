import { Package, LayoutDashboard, ShoppingCart, Users, Settings } from "lucide-react";
import "./index.css";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">

        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold">🏀 OBIKARDS</h1>
          <p className="text-slate-400 text-sm">ERP v2</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">

          <button className="flex items-center gap-3 w-full rounded-lg px-4 py-3 hover:bg-slate-800 transition">
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button className="flex items-center gap-3 w-full rounded-lg px-4 py-3 bg-blue-600">
            <Package size={20} />
            Inventaire
          </button>

          <button className="flex items-center gap-3 w-full rounded-lg px-4 py-3 hover:bg-slate-800 transition">
            <ShoppingCart size={20} />
            Ventes
          </button>

          <button className="flex items-center gap-3 w-full rounded-lg px-4 py-3 hover:bg-slate-800 transition">
            <Users size={20} />
            Clients
          </button>

          <button className="flex items-center gap-3 w-full rounded-lg px-4 py-3 hover:bg-slate-800 transition">
            <Settings size={20} />
            Paramètres
          </button>

        </nav>

      </aside>

      {/* Contenu */}
      <main className="flex-1 p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-3xl font-bold">
            Inventaire
          </h2>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium shadow">
            + Ajouter un article
          </button>

        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-900 text-white">

              <tr>

                <th className="text-left p-4">SKU</th>
                <th className="text-left p-4">Catégorie</th>
                <th className="text-left p-4">Titre</th>
                <th className="text-left p-4">Achat</th>
                <th className="text-left p-4">Vente</th>
                <th className="text-left p-4">Qté</th>
                <th className="text-left p-4">Actions</th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b hover:bg-gray-50">

                <td className="p-4">NBA-0001</td>
                <td className="p-4">NBA</td>
                <td className="p-4">Victor Wembanyama RC</td>
                <td className="p-4">20 €</td>
                <td className="p-4">35 €</td>
                <td className="p-4">1</td>

                <td className="p-4 space-x-2">

                  <button className="text-blue-600">Modifier</button>

                  <button className="text-red-600">Supprimer</button>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}

export default App;