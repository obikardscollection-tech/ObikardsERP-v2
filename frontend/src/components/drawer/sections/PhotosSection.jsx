export default function PhotosSection({ setForm }) {
  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="bg-white rounded-xl border p-6 mt-6">

      <h2 className="text-xl font-semibold mb-6">
        📷 Photos
      </h2>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <label className="block text-sm font-medium mb-2">
            Photo recto
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              update("frontPhoto", e.target.files[0] || null)
            }
            className="w-full border rounded-lg p-3"
          />

        </div>

        <div>

          <label className="block text-sm font-medium mb-2">
            Photo verso
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              update("backPhoto", e.target.files[0] || null)
            }
            className="w-full border rounded-lg p-3"
          />

        </div>

      </div>

      <div className="mt-6">

        <label className="block text-sm font-medium mb-2">
          Photos supplémentaires
        </label>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) =>
            update(
              "extraPhotos",
              Array.from(e.target.files || [])
            )
          }
          className="w-full border rounded-lg p-3"
        />

      </div>

      <div className="mt-8 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center">

        <div className="text-5xl mb-3">
          📸
        </div>

        <p className="font-medium">
          Prévisualisation des photos
        </p>

        <p className="text-sm text-gray-500 mt-2">
          Les aperçus et le glisser-déposer seront ajoutés dans un prochain sprint.
        </p>

      </div>

    </div>
  );
}