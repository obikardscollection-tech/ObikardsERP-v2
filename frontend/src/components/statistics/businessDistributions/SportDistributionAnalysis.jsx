import BusinessDistributionTable from "./BusinessDistributionTable";

export default function SportDistributionAnalysis({ data = [] }) {
  return (
    <BusinessDistributionTable
      title="Distribution des ventes par sport"
      dimensionLabel="Sport"
      data={data}
    />
  );
}
