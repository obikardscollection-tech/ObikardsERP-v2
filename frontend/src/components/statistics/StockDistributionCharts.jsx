import DistributionBars from "./DistributionBars";

export default function StockDistributionCharts({ distribution }) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <DistributionBars
        title="Distribution valeur par sport"
        data={distribution.bySport}
      />

      <DistributionBars
        title="Distribution valeur par marque"
        data={distribution.byBrand}
      />
    </section>
  );
}