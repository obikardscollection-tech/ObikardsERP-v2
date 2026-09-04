import SalesPlatformTable from "./SalesPlatformTable";
import SalesStatusTable from "./SalesStatusTable";
import BenefitsTable from "./BenefitsTable";
import ExpenseCategoriesTable from "./ExpenseCategoriesTable";

export default function DistributionCharts({ distributions }) {
  return (
    <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
      <SalesPlatformTable data={distributions.salesByPlatform} />
      <SalesStatusTable data={distributions.salesByStatus} />
      <BenefitsTable title="Benefices par sport" data={distributions.benefitsBySport} />
      <BenefitsTable title="Benefices par marque" data={distributions.benefitsByBrand} />
      <BenefitsTable title="Benefices par fournisseur" data={distributions.benefitsBySupplier} />
      <ExpenseCategoriesTable data={distributions.expensesByCategory} />
    </section>
  );
}
