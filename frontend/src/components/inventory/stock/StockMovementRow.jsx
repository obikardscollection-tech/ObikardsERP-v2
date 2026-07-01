function getTypeLabel(type) {
  switch (type) {
    case "PURCHASE":
      return "Achat";

    case "SALE":
      return "Vente";

    case "RETURN":
      return "Retour";

    case "ADJUSTMENT":
      return "Ajustement";

    case "CORRECTION":
      return "Correction";

    default:
      return type;
  }
}

export default function StockMovementRow({
  movement,
}) {
  const positive = movement.quantity > 0;

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex justify-between items-center">
        <span className="font-medium">
          {getTypeLabel(movement.type)}
        </span>

        <span
          className={`font-bold ${
            positive
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {positive ? "+" : ""}
          {movement.quantity}
        </span>
      </div>

      <div className="text-sm text-gray-500 mt-1">
        {new Date(
          movement.createdAt
        ).toLocaleString("fr-FR")}
      </div>

      {movement.reason && (
        <div className="text-sm mt-2 text-gray-700">
          {movement.reason}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2">
        Stock :
        {" "}
        {movement.previousQuantity}
        {" → "}
        {movement.newQuantity}
      </div>
    </div>
  );
}