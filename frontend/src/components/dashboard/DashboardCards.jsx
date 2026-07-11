import {
  TrendingUp,
  TrendingDown,
  BadgeEuro,
  Package,
  ShoppingCart,
} from "lucide-react";

export function DashboardCards({ data, loading }) {
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const cards = [
    {
      title: "Chiffre d'affaires",
      value: formatCurrency(data.cards.revenue),
      change: "Toutes les ventes",
      icon: TrendingUp,
      color: "bg-green-50",
      textColor: "text-green-900",
      iconColor: "text-green-600",
    },
    {
      title: "Dépenses",
      value: formatCurrency(data.cards.expenses),
      change: "Tous les modules",
      icon: TrendingDown,
      color: "bg-red-50",
      textColor: "text-red-900",
      iconColor: "text-red-600",
    },
    {
      title: "Marge brute",
      value: formatCurrency(data.cards.margin),
      change: `${data.cards.marginPercent.toFixed(1)}% du CA`,
      icon: BadgeEuro,
      color: "bg-blue-50",
      textColor: "text-blue-900",
      iconColor: "text-blue-600",
    },
    {
      title: "Articles vendus",
      value: data.cards.itemsSold,
      change: "Nombre d'articles",
      icon: Package,
      color: "bg-purple-50",
      textColor: "text-purple-900",
      iconColor: "text-purple-600",
    },
    {
      title: "Achats du mois",
      value: formatCurrency(data.cards.purchasesThisMonth),
      change: "Mois actuel",
      icon: ShoppingCart,
      color: "bg-orange-50",
      textColor: "text-orange-900",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.title} className={`rounded-lg p-6 ${card.color}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>

                <p className={`mt-2 text-3xl font-bold ${card.textColor}`}>
                  {loading ? "..." : card.value}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {card.change}
                </p>
              </div>

              <Icon className={`h-8 w-8 flex-shrink-0 ${card.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}