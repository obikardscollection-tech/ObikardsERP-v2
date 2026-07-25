import StatisticsLoadingState from "../StatisticsLoadingState";
import TopBrandsTable from "./TopBrandsTable";
import TopCardsTable from "./TopCardsTable";
import TopPlayersTable from "./TopPlayersTable";
import TopProfitTable from "./TopProfitTable";
import TopRoiTable from "./TopRoiTable";
import TopSportsTable from "./TopSportsTable";
import TopSuppliersTable from "./TopSuppliersTable";

export default function TopsSection({ tops, loading = false, error = "" }) {
  if (loading) {
    return <StatisticsLoadingState message="Chargement des tops statistiques..." />;
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
        <h2 className="text-xl font-semibold text-slate-900">Tops</h2>
        <p className="mt-1 text-sm text-slate-500">
          Classements backend des meilleures performances commerciales.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <TopPlayersTable data={tops.players} />
        <TopBrandsTable data={tops.brands} />
        <TopSportsTable data={tops.sports} />
        <TopSuppliersTable data={tops.suppliers} />
        <TopCardsTable data={tops.cards} />
        <TopRoiTable data={tops.topRoi} />
      </div>

      <TopProfitTable data={tops.topProfit} />
    </section>
  );
}
