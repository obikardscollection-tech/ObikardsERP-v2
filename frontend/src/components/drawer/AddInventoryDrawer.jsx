import GeneralSection from "./sections/GeneralSection";
import FeaturesSection from "./sections/FeaturesSection";
import GradingSection from "./sections/GradingSection";
import PurchaseSection from "./sections/PurchaseSection";
import SaleSection from "./sections/SaleSection";
import StockSection from "./sections/StockSection";
import PhotosSection from "./sections/PhotosSection";

export default function AddInventoryDrawer({
  open,
  onClose,
  form,
  setForm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">

      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
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
            onClick={onClose}
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
            onClick={onClose}
            className="border px-6 py-3 rounded-lg"
          >
            Annuler
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Enregistrer
          </button>

        </div>

      </div>

    </div>
  );
}