import { useState } from "react";
import axios from "axios";

const initialForm = {
  category: "NBA",
  title: "",
  purchasePrice: "",
  salePrice: "",
  quantity: 1,
  location: "",
  notes: "",
};

export default function AddInventoryModal({
  open,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "purchasePrice" ||
        name === "salePrice" ||
        name === "quantity"
          ? value
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Le titre est obligatoire.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:3000/inventory", {
        category: form.category,
        title: form.title,
        purchasePrice:
          form.purchasePrice === ""
            ? null
            : Number(form.purchasePrice),
        salePrice:
          form.salePrice === ""
            ? null
            : Number(form.salePrice),
        quantity: Number(form.quantity),
        location: form.location,
        notes: form.notes,
      });

      setForm(initialForm);

      onCreated();

      onClose();

    } catch (err) {
      console.error(err);
      alert("Impossible de créer l'article.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">

        <div className="border-b px-6 py-4 flex justify-between items-center">

          <h2 className="text-xl font-bold">
            Ajouter un article
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
        >

          <div>

            <label className="block mb-2 font-medium">
              Catégorie
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >
              <option>NBA</option>
              <option>NFL</option>
              <option>MLB</option>
              <option>Soccer</option>
              <option>Pokémon</option>
              <option>Fournitures</option>
              <option>Luxe</option>
              <option>Antiquités</option>
            </select>

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Titre
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              placeholder="Titre..."
            />

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block mb-2 font-medium">
                Prix achat
              </label>

              <input
                type="number"
                step="0.01"
                name="purchasePrice"
                value={form.purchasePrice}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Prix vente
              </label>

              <input
                type="number"
                step="0.01"
                name="salePrice"
                value={form.salePrice}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block mb-2 font-medium">
                Quantité
              </label>

              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Emplacement
              </label>

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />

            </div>

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Notes
            </label>

            <textarea
              rows="3"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />

          </div>

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-lg border"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}