function ReceptionItems({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">Aucune ligne reçue.</p>;
  }

  return (
    <div className="space-y-3" role="list" aria-label="Lignes de réception">
      {items.map((item) => (
        <article key={item.id} className="rounded-lg border border-slate-200 p-3" role="listitem">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">{item.purchaseItem?.name || "Article"}</p>
              <p className="text-sm text-slate-500">Commandé : {item.purchaseItem?.quantity ?? 0}</p>
            </div>

            <div className="text-right text-sm">
              <p className="font-medium text-emerald-700">Reçu : {item.quantityReceived ?? 0}</p>
              <p className="text-amber-700">Restant : {item.quantityRemaining ?? 0}</p>
            </div>
          </div>

          {item.notes ? (
            <p className="mt-2 text-sm text-slate-500">Note : {item.notes}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default ReceptionItems;
