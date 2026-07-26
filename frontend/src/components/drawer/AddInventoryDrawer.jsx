import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createInventory,
  updateInventory,
} from "../../services/inventoryService";

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
  item,
}) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const isEdit = !!item;

  useEffect(() => {
    if (!open) return;

    if (item) {
      setForm({
  ...initialForm,

  ...item,

  sport: item.sport ?? "",
  year: item.year ?? "",
  brand: item.brand ?? "",
  series: item.series ?? "",
  product: item.product ?? "",
  player: item.player ?? "",
  team: item.team ?? "",
  cardNumber: item.cardNumber ?? "",

  rookie: !!item.rookie,
  autograph: !!item.autograph,
  patch: !!item.patch,
  memorabilia: !!item.memorabilia,
  numbered: !!item.numbered,
  serialNumber: item.serialNumber ?? "",
  caseHit: !!item.caseHit,
  sp: !!item.sp,
  ssp: !!item.ssp,
  variant: item.variant ?? "",
  parallel: item.parallel ?? "",

  graded: !!item.graded,
  gradeCompany: item.gradeCompany ?? "",
  grade: item.grade ?? "",
  certification: item.certification ?? "",

  purchasePrice: item.purchasePrice ?? "",
  shippingCost: item.shippingCost ?? "",
  customsCost: item.customsCost ?? "",
  taxes: item.taxes ?? "",
  purchaseDate: item.purchaseDate
    ? item.purchaseDate.substring(0, 10)
    : "",
  supplier: item.supplier ?? "",
  purchaseSource: item.purchaseSource ?? "",
  origin: item.origin ?? "",

  askingPrice: item.salePrice ?? "",
  minimumPrice: item.minimumPrice ?? "",
  goal: item.goal ?? "",
  confidence: item.confidence ?? "",

  quantity: item.quantity ?? 1,
  status: item.status ?? "IN_STOCK",
  location: item.location ?? "",
  priority: item.priority ?? "",
  notes: item.notes ?? "",
});
    } else {
      setForm(initialForm);
    }
  }, [item, open]);

  if (!open) return null;

  async function handleSave() {
    try {
      setSaving(true);

      if (isEdit) {
        await updateInventory(item.id, form);
      } else {
        await createInventory(form);
      }

      setForm(initialForm);

      if (onCreated) {
        await onCreated();
      }

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
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

  function handleOverlayClick() {
    if (saving) return;

    setForm(initialForm);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      <div
        className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-gray-100 shadow-2xl sm:w-[700px]"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Modifier un article" : "Ajouter un article"}
      >
        <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center z-10">
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Modifier un article" : "Ajouter un article"}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {isEdit
                ? item?.sku
                : "SKU généré automatiquement"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="text-2xl"
            aria-label="Fermer"
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

        <div className="sticky bottom-0 border-t bg-white px-8 py-4 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="border px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium"
          >
            {saving
              ? "Enregistrement..."
              : isEdit
                ? "Modifier"
                : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}