function DeletePurchaseModal({
  open,
  purchase,
  onClose,
  onConfirm,
}) {
  if (!open || !purchase) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">
          Supprimer l'achat
        </h2>

        <p className="mt-4 text-slate-600">
          Êtes-vous sûr de vouloir supprimer cet achat ?
        </p>

        <p className="mt-2 font-semibold text-slate-900">
          {purchase.purchaseNumber}
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

export default DeletePurchaseModal;