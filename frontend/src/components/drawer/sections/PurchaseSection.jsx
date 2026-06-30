export default function PurchaseSection({ form, setForm }) {
  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const purchase = Number(form.purchasePrice || 0);
  const shipping = Number(form.shippingCost || 0);
  const customs = Number(form.customsCost || 0);
  const taxes = Number(form.taxes || 0);

  const totalCost = purchase + shipping + customs + taxes;

  return (
    <div className="bg-white rounded-xl border p-6 mt-6">

      <h2 className="text-xl font-semibold mb-6">
        💰 Achat
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block text-sm font-medium mb-2">
            Prix d'achat (€)
          </label>

          <input
            type="number"
            step="0.01"
            value={form.purchasePrice}
            onChange={(e) =>
              update("purchasePrice", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Frais de port (€)
          </label>

          <input
            type="number"
            step="0.01"
            value={form.shippingCost}
            onChange={(e) =>
              update("shippingCost", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Douane (€)
          </label>

          <input
            type="number"
            step="0.01"
            value={form.customsCost}
            onChange={(e) =>
              update("customsCost", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Taxes (€)
          </label>

          <input
            type="number"
            step="0.01"
            value={form.taxes}
            onChange={(e) =>
              update("taxes", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Date d'achat
          </label>

          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) =>
              update("purchaseDate", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Fournisseur
          </label>

          <input
            value={form.supplier}
            onChange={(e) =>
              update("supplier", e.target.value)
            }
            placeholder="Nom du fournisseur"
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Source d'achat
          </label>

          <select
            value={form.purchaseSource}
            onChange={(e) =>
              update("purchaseSource", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="">Choisir...</option>
            <option>eBay</option>
            <option>Whatnot</option>
            <option>CardMarket</option>
            <option>LeBonCoin</option>
            <option>Facebook</option>
            <option>Salon</option>
            <option>Magasin</option>
            <option>Particulier</option>
            <option>Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Provenance
          </label>

          <select
            value={form.origin}
            onChange={(e) =>
              update("origin", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="">Choisir...</option>
            <option>Break</option>
            <option>Achat à l'unité</option>
            <option>Pull personnel</option>
            <option>Trade / Échange</option>
            <option>Consignation</option>
            <option>Collection personnelle</option>
            <option>Rachat de lot</option>
          </select>
        </div>

      </div>

      <div className="mt-8 p-4 rounded-xl bg-slate-100 border">

        <p className="text-sm text-gray-600">
          Coût de revient
        </p>

        <p className="text-3xl font-bold text-blue-600 mt-2">
          {totalCost.toFixed(2)} €
        </p>

      </div>

    </div>
  );
}