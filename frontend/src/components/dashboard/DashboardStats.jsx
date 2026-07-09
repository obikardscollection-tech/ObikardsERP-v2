import { Package, BarChart3, ShoppingCart, TrendingUp, AlertCircle, Users } from "lucide-react";

export function DashboardStats({ data, loading }) {
  const formatNumber = (num) => {
    if (num === 0) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toFixed(0);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const stats = [
    {
      label: "Valeur du stock",
      value: formatCurrency(data.stats.stockValue),
      icon: Package,
      color: "bg-blue-50",
      textColor: "text-blue-900",
      iconColor: "text-blue-600",
    },
    {
      label: "Articles en stock",
      value: formatNumber(data.stats.stockCount),
      icon: BarChart3,
      color: "bg-green-50",
      textColor: "text-green-900",
      iconColor: "text-green-600",
    },
    {
      label: "Ventes",
      value: formatNumber(data.stats.saleCount),
      icon: TrendingUp,
      color: "bg-purple-50",
      textColor: "text-purple-900",
      iconColor: "text-purple-600",
    },
    {
      label: "Achats",
      value: formatNumber(data.stats.purchaseCount),
      icon: ShoppingCart,
      color: "bg-orange-50",
      textColor: "text-orange-900",
      iconColor: "text-orange-600",
    },
    {
      label: "Dépenses",
      value: formatNumber(data.stats.expenseCount),
      icon: AlertCircle,
      color: "bg-red-50",
      textColor: "text-red-900",
      iconColor: "text-red-600",
    },
    {
      label: "Clients",
      value: formatNumber(data.stats.customerCount),
      icon: Users,
      color: "bg-indigo-50",
      textColor: "text-indigo-900",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className={`rounded-lg p-4 ${stat.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                <p className={`mt-2 text-2xl font-bold ${stat.textColor}`}>
                  {loading ? "..." : stat.value}
                </p>
              </div>
              <Icon className={`h-8 w-8 ${stat.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
