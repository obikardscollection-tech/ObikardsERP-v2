import BusinessDistributionTable from "./BusinessDistributionTable";

export default function BrandDistributionAnalysis({ data = [] }) {
  return (
    <BusinessDistributionTable
      title="Distribution des ventes par marque"
      dimensionLabel="Marque"
      data={data}
    />
  );
}
