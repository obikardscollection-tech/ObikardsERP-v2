export default function SaleSection({ form, setForm }) {
  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const cost =
    Number(form.purchasePrice || 0) +
    Number(form.shippingCost || 0) +
    Number(form.customsCost || 0) +
    Number(form.taxes || 0);

  const sale = Number(form.askingPrice || 0);

  const profit = sale - cost;

  const roi =
    cost > 0
      ? ((profit / cost) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="bg-white rounded-xl border p-6 mt-6">

      <h2 className="text-xl font-semibold mb-6">
        💵 Vente
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className="block text-sm font-medium mb-2">
            Prix souhaité (€)
          </label>

          <input
            type="number"
            step="0.01"
            value={form.askingPrice}
            onChange={(e) =>
              update("askingPrice", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Prix minimum accepté (€)
          </label>

          <input
            type="number"
            step="0.01"
            value={form.minimumPrice}
            onChange={(e) =>
              update("minimumPrice", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Objectif
          </label>

          <select
            value={form.goal}
            onChange={(e) =>
              update("goal", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="">Choisir...</option>
            <option>Flip rapide</option>
            <option>Moyen terme</option>
            <option>Long terme</option>
            <option>Collection personnelle</option>
          </select>

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Niveau de confiance
          </label>

          <select
            value={form.confidence}
            onChange={(e) =>
              update("confidence", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="">Choisir...</option>
            <option>⭐</option>
            <option>⭐⭐</option>
            <option>⭐⭐⭐</option>
            <option>⭐⭐⭐⭐</option>
            <option>⭐⭐⭐⭐⭐</option>
          </select>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">

        <div className="bg-slate-100 rounded-xl p-4 border">

          <p className="text-sm text-gray-600">
            Bénéfice estimé
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {profit.toFixed(2)} €
          </p>

        </div>

        <div className="bg-slate-100 rounded-xl p-4 border">

          <p className="text-sm text-gray-600">
            ROI estimé
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {roi} %
          </p>

        </div>

      </div>

    </div>
  );
}