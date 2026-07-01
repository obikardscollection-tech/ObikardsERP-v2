import * as XLSX from "xlsx";

export default function exportExcel(items) {
  if (!items || items.length === 0) {
    alert("Aucun article à exporter.");
    return;
  }

  const data = items.map((item) => ({
    SKU: item.sku,
    Catégorie: item.category,
    Titre: item.title,
    "Prix Achat": item.purchasePrice ?? "",
    "Prix Vente": item.salePrice ?? "",
    Quantité: item.quantity,
    Statut: item.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Inventaire"
  );

  XLSX.writeFile(
    workbook,
    `inventaire_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`
  );
}