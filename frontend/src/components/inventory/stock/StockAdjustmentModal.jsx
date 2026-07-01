import { useEffect, useState } from "react";

import StockHistory from "./StockHistory";

const movementTypes = [
  {
    value: "ADJUSTMENT",
    label: "Ajustement",
  },
  {
    value: "PURCHASE",
    label: "Achat",
  },
  {
    value: "SALE",
    label: "Vente",
  },
  {
    value: "RETURN",
    label: "Retour",
  },
  {
    value: "CORRECTION",
    label: "Correction",
  },
];

export default function StockAdjustmentModal({
  open,
  item,
  onClose,
  onSubmit,
  movements,
  historyLoading,
  loading,
}) {
  const [quantity, setQuantity] = useState(0);
  const [type, setType] = useState("ADJUSTMENT");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setQuantity(0);
      setType("ADJUSTMENT");
      setReason("");
    }
  }, [open]);

  if (!open || !item) {
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      inventoryId: item.id,
      quantity: Number(quantity),
      type,
      reason,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">
          Ajustement du stock
        </h2>

        <p className="text-gray-600 mb-6">
          {item.title}
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Quantité
            </label>

            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="w-full border rounded-lg p-2"
            >
              {movementTypes.map((movement) => (
                <option
                  key={movement.value}
                  value={movement.value}
                >
                  {movement.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Raison
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              rows={3}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Valider"}
            </button>
          </div>
        </form>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            Historique des mouvements
          </h3>

          <StockHistory
            movements={movements}
            loading={historyLoading}
          />
        </div>
      </div>
    </div>
  );
}