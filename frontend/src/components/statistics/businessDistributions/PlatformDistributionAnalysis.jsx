import BusinessDistributionTable from "./BusinessDistributionTable";

export default function PlatformDistributionAnalysis({ data = [] }) {
  return (
    <BusinessDistributionTable
      title="Distribution des ventes par plateforme"
      dimensionLabel="Plateforme"
      data={data}
    />
  );
}
