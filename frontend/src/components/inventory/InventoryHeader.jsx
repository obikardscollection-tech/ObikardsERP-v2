export default function InventoryHeader({
  totalItems,
  onCreate,
}) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">
          Inventaire
        </h1>

        <p className="text-gray-500 mt-1">
          {totalItems} article(s)
        </p>
      </div>

      <button
        onClick={onCreate}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow"
      >
        + Ajouter un article
      </button>
    </div>
  );
}