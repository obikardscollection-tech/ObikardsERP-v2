function ReceptionItems({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">Aucune ligne reçue.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">{item.purchaseItem?.name || "Article"}</p>
              <p className="text-sm text-slate-500">Commandé : {item.purchaseItem?.quantity ?? 0}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-600">Reçu : {item.quantityReceived ?? 0}</p>
              <p className="text-sm text-slate-600">Restant : {item.quantityRemaining ?? 0}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReceptionItems;
