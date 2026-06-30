export default function FeaturesSection({ form, setForm }) {
  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="bg-white rounded-xl border p-6 mt-6">

      <h2 className="text-xl font-semibold mb-6">
        ⭐ Caractéristiques
      </h2>

      <div className="grid grid-cols-2 gap-6">

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.rookie}
            onChange={(e) => update("rookie", e.target.checked)}
          />
          Rookie Card
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.autograph}
            onChange={(e) => update("autograph", e.target.checked)}
          />
          Autographe
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.patch}
            onChange={(e) => update("patch", e.target.checked)}
          />
          Patch / Relic
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.memorabilia}
            onChange={(e) => update("memorabilia", e.target.checked)}
          />
          Memorabilia
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.numbered}
            onChange={(e) => update("numbered", e.target.checked)}
          />
          Numérotée
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.caseHit}
            onChange={(e) => update("caseHit", e.target.checked)}
          />
          Case Hit
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.sp}
            onChange={(e) => update("sp", e.target.checked)}
          />
          SP
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.ssp}
            onChange={(e) => update("ssp", e.target.checked)}
          />
          SSP
        </label>

      </div>

      {form.numbered && (

        <div className="grid grid-cols-2 gap-4 mt-6">

          <div>

            <label className="block text-sm font-medium mb-2">
              Numéro de série
            </label>

            <input
              value={form.serialNumber}
              onChange={(e) =>
                update("serialNumber", e.target.value)
              }
              placeholder="08/25"
              className="w-full border rounded-lg p-3"
            />

          </div>

        </div>

      )}

      <div className="grid grid-cols-2 gap-4 mt-6">

        <div>

          <label className="block text-sm font-medium mb-2">
            Variante
          </label>

          <input
            value={form.variant}
            onChange={(e) => update("variant", e.target.value)}
            placeholder="Gold"
            className="w-full border rounded-lg p-3"
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Couleur parallèle
          </label>

          <input
            value={form.parallel}
            onChange={(e) => update("parallel", e.target.value)}
            placeholder="Gold Wave"
            className="w-full border rounded-lg p-3"
          />

        </div>

      </div>

    </div>
  );
}