export default function GeneralSection({ form, setForm }) {
  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="bg-white rounded-xl border p-6">

      <h2 className="text-xl font-semibold mb-6">
        📋 Informations
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block text-sm font-medium mb-2">
            Sport
          </label>

          <select
            value={form.sport}
            onChange={(e) => update("sport", e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Choisir...</option>
            <option>NBA</option>
            <option>NFL</option>
            <option>MLB</option>
            <option>Soccer</option>
            <option>NHL</option>
            <option>F1</option>
            <option>UFC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Année
          </label>

          <input
            type="number"
            value={form.year}
            onChange={(e) => update("year", e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Marque
          </label>

          <input
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Topps"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Série
          </label>

          <input
            value={form.series}
            onChange={(e) => update("series", e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Chrome"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Produit
          </label>

          <input
            value={form.product}
            onChange={(e) => update("product", e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Hobby"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Joueur
          </label>

          <input
            value={form.player}
            onChange={(e) => update("player", e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Équipe
          </label>

          <input
            value={form.team}
            onChange={(e) => update("team", e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            N° de carte
          </label>

          <input
            value={form.cardNumber}
            onChange={(e) => update("cardNumber", e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

      </div>

    </div>
  );
}