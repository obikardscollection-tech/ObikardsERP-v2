import {
  ShoppingCart,
  Euro,
  Package,
  Calendar,
} from "lucide-react";

function PurchaseStats({
  purchases = [],
}) {
  const totalPurchases =
    purchases.length;

  const totalAmount =
    purchases.reduce(
      (total, purchase) =>
        total +
        Number(
          purchase.totalAmount ?? 0
        ),
      0
    );

  const totalItems =
    purchases.reduce(
      (total, purchase) =>
        total +
        Number(
          purchase.totalItems ?? 0
        ),
      0
    );

  const thisMonth =
    purchases.filter((purchase) => {
      if (!purchase.createdAt)
        return false;

      const date = new Date(
        purchase.createdAt
      );

      const now = new Date();

      return (
        date.getMonth() ===
          now.getMonth() &&
        date.getFullYear() ===
          now.getFullYear()
      );
    }).length;

  const stats = [
    {
      title: "Achats",
      value: totalPurchases,
      icon: ShoppingCart,
    },
    {
      title: "Montant total",
      value: `${totalAmount.toFixed(
        2
      )} €`,
      icon: Euro,
    },
    {
      title: "Articles achetés",
      value: totalItems,
      icon: Package,
    },
    {
      title: "Ce mois",
      value: thisMonth,
      icon: Calendar,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl bg-white p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3">
                <Icon
                  size={24}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PurchaseStats;