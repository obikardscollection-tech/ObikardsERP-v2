import BusinessDistributionTable from "./BusinessDistributionTable";

export default function PlayerDistributionAnalysis({ data = [] }) {
  return (
    <BusinessDistributionTable
      title="Distribution des ventes par joueur"
      dimensionLabel="Joueur"
      data={data}
    />
  );
}
