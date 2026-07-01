import StockMovementRow from "./StockMovementRow";

export default function StockHistory({
  movements,
  loading,
}) {
  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Chargement de l'historique...
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Aucun mouvement de stock.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-72 overflow-y-auto">
      {movements.map((movement) => (
        <StockMovementRow
          key={movement.id}
          movement={movement}
        />
      ))}
    </div>
  );
}