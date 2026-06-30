export default function GradingSection({ form, setForm }) {
  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="bg-white rounded-xl border p-6 mt-6">

      <h2 className="text-xl font-semibold mb-6">
        🏆 Gradation
      </h2>

      <label className="flex items-center gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={form.graded}
          onChange={(e) => update("graded", e.target.checked)}
        />
        Carte gradée
      </label>

      {form.graded && (

        <div className="grid grid-cols-3 gap-4">

          <div>

            <label className="block text-sm font-medium mb-2">
              Société
            </label>

            <select
              value={form.gradeCompany}
              onChange={(e) =>
                update("gradeCompany", e.target.value)
              }
              className="w-full border rounded-lg p-3"
            >
              <option value="">Choisir...</option>
              <option>PSA</option>
              <option>BGS</option>
              <option>SGC</option>
              <option>CGC</option>
              <option>TAG</option>
              <option>Autre</option>
            </select>

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Note
            </label>

            <input
              value={form.grade}
              onChange={(e) =>
                update("grade", e.target.value)
              }
              placeholder="10"
              className="w-full border rounded-lg p-3"
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Certification
            </label>

            <input
              value={form.certification}
              onChange={(e) =>
                update("certification", e.target.value)
              }
              placeholder="12345678"
              className="w-full border rounded-lg p-3"
            />

          </div>

        </div>

      )}

    </div>
  );
}