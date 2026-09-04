import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createInventory,
  uploadInventoryPhoto,
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
  subset: "",
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

  const moneyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function formatMoney(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? moneyFormatter.format(numeric) : "—";
  }

  function formatPercent(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${numeric.toFixed(1)}%` : "—";
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return dateFormatter.format(date);
  }

  function getMarketStatusMeta(status) {
    switch (status) {
      case "LINKED":
        return {
          label: "Market lié",
          className: "bg-emerald-100 text-emerald-700",
        };
      case "MULTIPLE_MATCHES":
        return {
          label: "À vérifier",
          className: "bg-amber-100 text-amber-700",
        };
      case "NOT_FOUND":
        return {
          label: "Aucun match",
          className: "bg-rose-100 text-rose-700",
        };
      default:
        return {
          label: "Non relié",
          className: "bg-slate-200 text-slate-700",
        };
    }
  }

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
  subset: item.subset ?? "",
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

  frontPhoto: item.frontPhoto ?? null,
  backPhoto: item.backPhoto ?? null,
  extraPhotos: Array.isArray(item.extraPhotos) ? item.extraPhotos : [],
});
    } else {
      setForm(initialForm);
    }
  }, [item, open]);

  if (!open) return null;

  async function handleSave() {
    let savedItem = null;

    try {
      setSaving(true);

      if (isEdit) {
        savedItem = await updateInventory(item.id, form);
      } else {
        savedItem = await createInventory(form);
      }

      if (form.frontPhoto instanceof File) {
        savedItem = await uploadInventoryPhoto(savedItem.id, "front", form.frontPhoto);
      }

      if (form.backPhoto instanceof File) {
        savedItem = await uploadInventoryPhoto(savedItem.id, "back", form.backPhoto);
      }

      for (const photo of form.extraPhotos.filter((entry) => entry instanceof File)) {
        savedItem = await uploadInventoryPhoto(savedItem.id, "extra", photo);
      }

      setForm(initialForm);

      if (onCreated) {
        await onCreated();
      }

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.error ?? error?.response?.data?.message ??
          "Erreur lors de l'enregistrement."
      );

      if (savedItem && onCreated) {
        await onCreated();
      }
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

          {(item && (
            item.marketValueEur != null ||
            item.marketLinkStatus ||
            item.marketSource ||
            item.marketLastRefreshAt ||
            item.profit != null ||
            item.margin != null ||
            item.roi != null
          )) ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-800">Informations Market</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getMarketStatusMeta(item.marketLinkStatus).className}`}
                >
                  {getMarketStatusMeta(item.marketLinkStatus).label}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Coût d'achat</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{formatMoney(item.purchasePrice)}</p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Valeur marché EUR</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{formatMoney(item.marketValueEur)}</p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Profit potentiel</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{formatMoney(item.profit)}</p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Marge</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{formatPercent(item.margin)}</p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">ROI</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{formatPercent(item.roi)}</p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Dernière mise à jour</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{formatDate(item.marketLastRefreshAt)}</p>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-700">Source :</span> {item.marketSource || "—"}
                </p>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Rafraîchissement Market individuel non exposé dans l'API Inventory actuelle.
              </p>
            </div>
          ) : null}

          <PhotosSection
            form={form}
            setForm={setForm}
            inventoryId={item?.id}
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