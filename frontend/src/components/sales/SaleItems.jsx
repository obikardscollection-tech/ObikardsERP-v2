function SaleItems({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">Aucun article vendu.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">{item.title || item.sku || "Article"}</p>
              <p className="text-sm text-slate-500">Quantité : {item.quantity ?? 0}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Prix unitaire : {Number(item.unitPrice ?? 0).toFixed(2)} EUR</p>
              <p className="text-sm text-slate-600">Total : {Number(item.totalPrice ?? 0).toFixed(2)} EUR</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SaleItems;
