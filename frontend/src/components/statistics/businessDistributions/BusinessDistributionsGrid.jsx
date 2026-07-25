import BrandDistributionAnalysis from "./BrandDistributionAnalysis";
import PlatformDistributionAnalysis from "./PlatformDistributionAnalysis";
import PlayerDistributionAnalysis from "./PlayerDistributionAnalysis";
import SportDistributionAnalysis from "./SportDistributionAnalysis";
import SupplierDistributionAnalysis from "./SupplierDistributionAnalysis";
import YearDistributionAnalysis from "./YearDistributionAnalysis";

export default function BusinessDistributionsGrid({ distributions }) {
  return (
    <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
      <SportDistributionAnalysis data={distributions.bySport} />
      <PlayerDistributionAnalysis data={distributions.byPlayer} />
      <BrandDistributionAnalysis data={distributions.byBrand} />
      <SupplierDistributionAnalysis data={distributions.bySupplier} />
      <PlatformDistributionAnalysis data={distributions.byPlatform} />
      <YearDistributionAnalysis data={distributions.byYear} />
    </section>
  );
}
