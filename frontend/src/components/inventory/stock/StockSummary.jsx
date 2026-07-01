export default function StockSummary({
  item,
  movements,
}) {
  const currentStock = item?.quantity ?? 0;

  const totalIn = movements
    .filter((movement) => movement.quantity > 0)
    .reduce(
      (total, movement) =>
        total + movement.quantity,
      0
    );

  const totalOut = Math.abs(
    movements
      .filter((movement) => movement.quantity < 0)
      .reduce(
        (total, movement) =>
          total + movement.quantity,
        0
      )
  );

  const lastMovement =
    movements.length > 0
      ? movements[0]
      : null;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="text-xs uppercase text-gray-500">
          Stock actuel
        </div>

        <div className="text-2xl font-bold mt-2">
          {currentStock}
        </div>
      </div>

      <div className="bg-green-50 rounded-xl border border-green-200 p-4">
        <div className="text-xs uppercase text-green-700">
          Entrées
        </div>

        <div className="text-2xl font-bold text-green-700 mt-2">
          +{totalIn}
        </div>
      </div>

      <div className="bg-red-50 rounded-xl border border-red-200 p-4">
        <div className="text-xs uppercase text-red-700">
          Sorties
        </div>

        <div className="text-2xl font-bold text-red-700 mt-2">
          -{totalOut}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <div className="text-xs uppercase text-blue-700">
          Dernier mouvement
        </div>

        <div className="text-sm mt-2 font-medium">
          {lastMovement
            ? new Date(
                lastMovement.createdAt
              ).toLocaleDateString("fr-FR")
            : "-"}
        </div>
      </div>
    </div>
  );
}