import BusinessDistributionTable from "./BusinessDistributionTable";

export default function SupplierDistributionAnalysis({ data = [] }) {
  return (
    <BusinessDistributionTable
      title="Distribution des ventes par fournisseur"
      dimensionLabel="Fournisseur"
      data={data}
    />
  );
}
