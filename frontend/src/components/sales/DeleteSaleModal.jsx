function DeleteSaleModal({
  open,
  sale,
  onClose,
  onConfirm,
}) {
  if (!open || !sale) {
    return null;
  }

  const reference =
    sale.orderNumber ||
    `SAL-${String(sale.id || "").slice(-8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">
          Supprimer la vente
        </h2>

        <p className="mt-4 text-slate-600">
          Êtes-vous sûr de vouloir supprimer cette vente ?
        </p>

        <p className="mt-2 font-semibold text-slate-900">
          Référence : {reference}
        </p>

        <p className="mt-4 text-sm text-red-600">
          Cette action est irréversible.
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2 transition hover:bg-slate-100"
          >
            Annuler
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteSaleModal;