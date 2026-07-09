import { getStockMovementTypeLabel } from "../../../constants/labels";

function getTypeConfig(type) {
  switch (type) {
    case "PURCHASE":
      return {
        label: getStockMovementTypeLabel("PURCHASE"),
        badge: "bg-blue-100 text-blue-700",
      };

    case "SALE":
      return {
        label: getStockMovementTypeLabel("SALE"),
        badge: "bg-red-100 text-red-700",
      };

    case "RETURN":
      return {
        label: getStockMovementTypeLabel("RETURN"),
        badge: "bg-green-100 text-green-700",
      };

    case "ADJUSTMENT":
      return {
        label: getStockMovementTypeLabel("ADJUSTMENT"),
        badge: "bg-orange-100 text-orange-700",
      };

    case "CORRECTION":
      return {
        label: getStockMovementTypeLabel("CORRECTION"),
        badge: "bg-purple-100 text-purple-700",
      };

    default:
      return {
        label: getStockMovementTypeLabel(type),
        badge: "bg-gray-100 text-gray-700",
      };
  }
}

export default function StockMovementRow({
  movement,
}) {
  const positive = movement.quantity > 0;

  const type = getTypeConfig(movement.type);

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${type.badge}`}
          >
            {type.label}
          </span>

          <div className="text-sm text-gray-500 mt-2">
            {new Date(
              movement.createdAt
            ).toLocaleString("fr-FR")}
          </div>
        </div>

        <div
          className={`text-xl font-bold ${
            positive
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {positive ? "+" : ""}
          {movement.quantity}
        </div>
      </div>

      <div className="mt-4 text-sm">
        <span className="font-medium">
          Stock :
        </span>

        <span className="ml-2">
          {movement.previousQuantity}
          {" → "}
          {movement.newQuantity}
        </span>
      </div>

      {movement.reason && (
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-700">
            Raison
          </div>

          <div className="text-sm text-gray-600 mt-1">
            {movement.reason}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <span
          className={`font-semibold ${
            positive
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {positive ? "+" : ""}
          {movement.quantity}
          {" "}
          {Math.abs(movement.quantity) > 1
            ? "cartes"
            : "carte"}
        </span>
      </div>
    </div>
  );
}