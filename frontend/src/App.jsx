import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    const res = await fetch("http://localhost:3000/inventory");
    const data = await res.json();
    setItems(data);
  }

  return (
    <div className="app">

      <aside className="sidebar">
        <h2>🏀 OBIKARDS ERP</h2>

        <button>📊 Dashboard</button>
        <button>📦 Inventaire</button>
        <button>💰 Ventes</button>
        <button>👥 Clients</button>
        <button>⚙ Paramètres</button>
      </aside>

      <main className="main">

        <div className="topbar">
          <h1>Inventaire</h1>

          <button className="addButton">
            ➕ Ajouter un article
          </button>
        </div>

        <table>

          <thead>

            <tr>
              <th>SKU</th>
              <th>Catégorie</th>
              <th>Titre</th>
              <th>Achat</th>
              <th>Vente</th>
              <th>Qté</th>
            </tr>

          </thead>

          <tbody>

            {items.map((item) => (

              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.category}</td>
                <td>{item.title}</td>
                <td>{item.purchasePrice} €</td>
                <td>{item.salePrice} €</td>
                <td>{item.quantity}</td>
              </tr>

            ))}

          </tbody>

        </table>

      </main>

    </div>
  );
}

export default App;