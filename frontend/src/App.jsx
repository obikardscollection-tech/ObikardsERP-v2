import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "./components/Sidebar";
import InventoryTable from "./components/InventoryTable";
import AddInventoryModal from "./components/AddInventoryModal";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadInventory() {
    try {
      setLoading(true);

      const { data } = await axios.get(
        "http://localhost:3000/inventory"
      );

      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Impossible de charger l'inventaire.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <main className="flex-1 p-8">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-3xl font-bold">
              Inventaire
            </h1>

            <p className="text-gray-500 mt-1">
              {items.length} article(s)
            </p>

          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow"
          >
            + Ajouter un article
          </button>

        </div>

        {loading ? (

          <div className="bg-white rounded-xl shadow p-8 text-center">
            Chargement...
          </div>

        ) : (

          <InventoryTable
            items={items}
          />

        )}

      </main>

      <AddInventoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadInventory}
      />

    </div>
  );
}

export default App;