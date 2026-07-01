export default function exportCsv(items) {
  if (!items || items.length === 0) {
    alert("Aucun article à exporter.");
    return;
  }

  const headers = [
    "SKU",
    "Catégorie",
    "Titre",
    "Prix Achat",
    "Prix Vente",
    "Quantité",
    "Statut",
  ];

  const rows = items.map((item) => [
    item.sku,
    item.category,
    item.title,
    item.purchasePrice ?? "",
    item.salePrice ?? "",
    item.quantity,
    item.status,
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `inventaire_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}