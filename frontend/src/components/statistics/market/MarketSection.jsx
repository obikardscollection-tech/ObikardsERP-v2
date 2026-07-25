import StatisticsLoadingState from "../StatisticsLoadingState";
import FallingCardsTable from "./FallingCardsTable";
import InvestmentPotentialTable from "./InvestmentPotentialTable";
import MarketRoiTable from "./MarketRoiTable";
import MarketValueChart from "./MarketValueChart";
import ResalePotentialTable from "./ResalePotentialTable";
import RisingCardsTable from "./RisingCardsTable";

export default function MarketSection({ market, loading = false, error = "" }) {
  if (loading) {
    return <StatisticsLoadingState message="Chargement des statistiques market..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Market</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tendances de valeur et opportunites basees sur les snapshots market.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <MarketValueChart data={market.evolutionValeurMarche.data} />
        <MarketRoiTable data={market.variationRoi.data} />
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <RisingCardsTable data={market.cartesEnHausse} />
        <FallingCardsTable data={market.cartesEnBaisse} />
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <ResalePotentialTable data={market.potentielRevente} />
        <InvestmentPotentialTable data={market.potentielInvestissement} />
      </div>
    </section>
  );
}
