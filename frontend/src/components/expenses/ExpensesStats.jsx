import { getExpenseCategoryLabel } from "../../constants/labels";

function ExpensesStats({ expenses = [] }) {
  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amountTTC || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.expenseDate);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  const monthAmount = monthExpenses.reduce((sum, expense) => sum + Number(expense.amountTTC || 0), 0);

  const categoryStats = {};
  expenses.forEach((expense) => {
    const category = expense.category || "Non catégorisé";
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, total: 0 };
    }
    categoryStats[category].count += 1;
    categoryStats[category].total += Number(expense.amountTTC || 0);
  });

  const topCategory = Object.entries(categoryStats).sort((a, b) => b[1].total - a[1].total)[0];
  const topCategoryName = topCategory ? getExpenseCategoryLabel(topCategory[0]) : "-";
  const topCategoryAmount = topCategory ? topCategory[1].total : 0;

  const cards = [
    { label: "Nombre de dépenses", value: expenses.length, tone: "bg-slate-900 text-white" },
    { label: "Montant total", value: `${Number(totalAmount || 0).toFixed(2)} EUR`, tone: "bg-red-100 text-red-700" },
    { label: "Dépenses du mois", value: `${Number(monthAmount || 0).toFixed(2)} EUR`, tone: "bg-amber-100 text-amber-700" },
    { label: "Catégorie principale", value: topCategoryName, tone: "bg-blue-100 text-blue-700" },
    { label: "Montant catégorie", value: `${Number(topCategoryAmount || 0).toFixed(2)} EUR`, tone: "bg-slate-100 text-slate-700" },
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl p-4 shadow ${card.tone}`}>
          <p className="text-sm opacity-80">{card.label}</p>
          <p className="mt-2 text-xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default ExpensesStats;
