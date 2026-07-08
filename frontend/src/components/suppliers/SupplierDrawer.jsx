import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createSupplier,
  updateSupplier,
} from "../../services/suppliersService";

function SupplierDrawer({
  open,
  supplier,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name ?? "",
        company: supplier.company ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        website: supplier.website ?? "",
        address: supplier.address ?? "",
        city: supplier.city ?? "",
        postalCode:
          supplier.postalCode ?? "",
        country: supplier.country ?? "",
        notes: supplier.notes ?? "",
      });
    } else {
      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        website: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        notes: "",
      });
    }

    setErrors({});
  }, [supplier, open]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function validate() {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name =
        "Le nom est obligatoire.";
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      newErrors.email =
        "Adresse email invalide.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      if (supplier) {
        await updateSupplier(
          supplier.id,
          form
        );

        toast.success(
          "Fournisseur modifié avec succès."
        );
      } else {
        await createSupplier(form);

        toast.success(
          "Fournisseur créé avec succès."
        );
      }

      await onSaved();

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        "Impossible d'enregistrer le fournisseur."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-8 shadow-2xl">

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {supplier
              ? "Modifier un fournisseur"
              : "Ajouter un fournisseur"}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <input
              className="w-full rounded-lg border p-3"
              name="name"
              placeholder="Nom"
              value={form.name}
              onChange={handleChange}
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <input
            className="w-full rounded-lg border p-3"
            name="company"
            placeholder="Société"
            value={form.company}
            onChange={handleChange}
          />

          <div>
            <input
              className="w-full rounded-lg border p-3"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <input
            className="w-full rounded-lg border p-3"
            name="phone"
            placeholder="Téléphone"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            className="w-full rounded-lg border p-3"
            name="website"
            placeholder="Site internet"
            value={form.website}
            onChange={handleChange}
          />

          <input
            className="w-full rounded-lg border p-3"
            name="address"
            placeholder="Adresse"
            value={form.address}
            onChange={handleChange}
          />

          <input
            className="w-full rounded-lg border p-3"
            name="city"
            placeholder="Ville"
            value={form.city}
            onChange={handleChange}
          />

          <input
            className="w-full rounded-lg border p-3"
            name="postalCode"
            placeholder="Code postal"
            value={form.postalCode}
            onChange={handleChange}
          />

          <input
            className="w-full rounded-lg border p-3"
            name="country"
            placeholder="Pays"
            value={form.country}
            onChange={handleChange}
          />

          <textarea
            className="w-full rounded-lg border p-3"
            rows={5}
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-3"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default SupplierDrawer;