import BusinessDistributionTable from "./BusinessDistributionTable";

export default function YearDistributionAnalysis({ data = [] }) {
  return (
    <BusinessDistributionTable
      title="Distribution des ventes par annee"
      dimensionLabel="Annee"
      data={data}
    />
  );
}
