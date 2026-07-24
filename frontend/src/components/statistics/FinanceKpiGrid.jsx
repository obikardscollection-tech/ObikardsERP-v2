import { KPI_DEFINITIONS } from "../../constants/financeKpis";
import FinanceKpiCard from "./FinanceKpiCard";

export default function FinanceKpiGrid({ data, loading, error }) {
  const current = data?.current || {};
  const previous = data?.previous || {};
  const comparaison = data?.comparaison || {};

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {KPI_DEFINITIONS.map((kpi) => (
        <FinanceKpiCard
          key={kpi.key}
          label={kpi.label}
          value={current[kpi.key]}
          previousValue={previous[kpi.key]}
          variation={comparaison[kpi.key]}
          format={kpi.format}
          loading={loading}
          error={error}
        />
      ))}
    </div>
  );
}