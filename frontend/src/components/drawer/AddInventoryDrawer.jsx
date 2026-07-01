import { useState } from "react";
import axios from "axios";

import GeneralSection from "./sections/GeneralSection";
import FeaturesSection from "./sections/FeaturesSection";
import GradingSection from "./sections/GradingSection";
import PurchaseSection from "./sections/PurchaseSection";
import SaleSection from "./sections/SaleSection";
import StockSection from "./sections/StockSection";
import PhotosSection from "./sections/PhotosSection";

const initialForm = {
  // Général
  sport: "",
  year: "",
  brand: "",
  series: "",
  product: "",
  player: "",
  team: "",
  cardNumber: "",

  // Caractéristiques
  rookie: false,
  autograph: false,
  patch: false,
  memorabilia: false,
  numbered: false,
  serialNumber: "",
  caseHit: false,
  sp: false,
  ssp: false,
  variant: "",
  parallel: "",

  // Gradation
  graded: false,
  gradeCompany: "",
  grade: "",
  certification: "",

  // Achat
  purchasePrice: "",
  shippingCost: "",
  customsCost: "",
  taxes: "",
  purchaseDate: "",
  supplier: "",
  purchaseSource: "",
  origin: "",

  // Vente
  askingPrice: "",
  minimumPrice: "",
  goal: "",
  confidence: "",

  // Stock
  quantity: 1,
  status: "IN_STOCK",
  location: "",
  priority: "",
  notes: "",

  // Photos
  frontPhoto: null,
  backPhoto: null,
  extraPhotos: [],
};

export default function AddInventoryDrawer({
  open,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSave() {
    try {
      setSaving(true);

      await axios.post(
  "http://localhost:3000/inventory",
  form
);

      setForm(initialForm);

      if (onCreated) {
        onCreated();
      }

      onClose();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.error ??
          "Erreur lors de l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;

    setForm(initialForm);
    onClose();
  }
   return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      <div className="absolute right-0 top-0 h-full w-[700px] bg-gray-100 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center z-10">
          <div>
            <h1 className="text-2xl font-bold">
              Ajouter une carte
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              SKU généré automatiquement
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={saving}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 pb-32">
          <GeneralSection
            form={form}
            setForm={setForm}
          />

          <FeaturesSection
            form={form}
            setForm={setForm}
          />

          <GradingSection
            form={form}
            setForm={setForm}
          />

          <PurchaseSection
            form={form}
            setForm={setForm}
          />

          <SaleSection
            form={form}
            setForm={setForm}
          />

          <StockSection
            form={form}
            setForm={setForm}
          />

          <PhotosSection
            form={form}
            setForm={setForm}
          />
        </div>

        <div className="fixed bottom-0 right-0 w-[700px] bg-white border-t px-8 py-4 flex justify-end gap-4">
          <button
            onClick={handleClose}
            disabled={saving}
            className="border px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}