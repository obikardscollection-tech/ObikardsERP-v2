export default function StockSection({ form, setForm }) {
  const { getInventoryStatusLabel } = require("../../../constants/labels");
  
  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="bg-white rounded-xl border p-6 mt-6">

      <h2 className="text-xl font-semibold mb-6">
        📦 Stock
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className="block text-sm font-medium mb-2">
            Quantité
          </label>

          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) =>
              update("quantity", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Emplacement
          </label>

          <input
            value={form.location}
            onChange={(e) =>
              update("location", e.target.value)
            }
            placeholder="Classeur NBA 1"
            className="w-full border rounded-lg p-3"
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            État de possession
          </label>

          <select
            value={form.status}
            onChange={(e) =>
              update("status", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="IN_STOCK">{getInventoryStatusLabel("IN_STOCK")}</option>
            <option value="RESERVED">{getInventoryStatusLabel("RESERVED")}</option>
            <option value="CONSIGNMENT">{getInventoryStatusLabel("CONSIGNMENT")}</option>
            <option value="GRADING">{getInventoryStatusLabel("GRADING")}</option>
            <option value="TO_SHIP">{getInventoryStatusLabel("TO_SHIP")}</option>
            <option value="SHIPPED">{getInventoryStatusLabel("SHIPPED")}</option>
            <option value="SOLD">{getInventoryStatusLabel("SOLD")}</option>
          </select>

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Priorité
          </label>

          <select
            value={form.priority}
            onChange={(e) =>
              update("priority", e.target.value)
            }
            className="w-full border rounded-lg p-3"
          >
            <option value="">Choisir...</option>
            <option>À vendre rapidement</option>
            <option>À grader</option>
            <option>À envoyer en consignation</option>
            <option>À photographier</option>
            <option>À publier sur eBay</option>
            <option>À publier sur Whatnot</option>
            <option>À publier sur WooCommerce</option>
            <option>Collection personnelle</option>
          </select>

        </div>

      </div>

      <div className="mt-6">

        <label className="block text-sm font-medium mb-2">
          Notes
        </label>

        <textarea
          rows="5"
          value={form.notes}
          onChange={(e) =>
            update("notes", e.target.value)
          }
          placeholder="Notes internes..."
          className="w-full border rounded-lg p-3 resize-none"
        />

      </div>

    </div>
  );
}