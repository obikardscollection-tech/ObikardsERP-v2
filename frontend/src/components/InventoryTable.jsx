export default function InventoryTable({ items = [] }) {
  return (
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
            <th className="text-left p-4">Statut</th>
            <th className="text-left p-4">Actions</th>
          </tr>

        </thead>

        <tbody>

          {items.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                className="text-center text-gray-500 p-8"
              >
                Aucun article dans l'inventaire.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {item.sku}
                </td>

                <td className="p-4">
                  {item.category}
                </td>

                <td className="p-4">
                  {item.title}
                </td>

                <td className="p-4">
                  {item.purchasePrice ?? "-"} €
                </td>

                <td className="p-4">
                  {item.salePrice ?? "-"} €
                </td>

                <td className="p-4">
                  {item.quantity}
                </td>

                <td className="p-4">

                  <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    {item.status}
                  </span>

                </td>

                <td className="p-4 space-x-3">

                  <button className="text-blue-600 hover:underline">
                    Modifier
                  </button>

                  <button className="text-red-600 hover:underline">
                    Supprimer
                  </button>

                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>
    </div>
  );
}