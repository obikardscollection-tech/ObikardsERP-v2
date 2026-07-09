import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getInventoryCategoryLabel, getInventoryStatusLabel } from "../constants/labels";

export default function exportPdf(items) {
  if (!items || items.length === 0) {
    alert("Aucun article à exporter.");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Inventaire Obikards ERP", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [[
      "SKU",
      "Catégorie",
      "Titre",
      "Prix Achat",
      "Prix Vente",
      "Qté",
      "Statut",
    ]],
    body: items.map((item) => [
      item.sku,
      getInventoryCategoryLabel(item.category),
      item.title,
      item.purchasePrice ?? "",
      item.salePrice ?? "",
      item.quantity,
      getInventoryStatusLabel(item.status),
    ]),
    styles: {
      fontSize: 9,
    },
    headStyles: {
      fillColor: [30, 41, 59],
    },
  });

  doc.save(
    `inventaire_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`
  );
}