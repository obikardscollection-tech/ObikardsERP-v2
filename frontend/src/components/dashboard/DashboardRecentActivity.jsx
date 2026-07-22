import { CircleDollarSign, Receipt, ShoppingCart } from "lucide-react";
import { DashboardSection } from "./DashboardSection";

const TYPE_META = {
  SALE: {
    label: "Vente",
    icon: CircleDollarSign,
    iconClassName: "text-emerald-600",
    badgeClassName: "bg-emerald-100 text-emerald-700",
  },
  PURCHASE: {
    label: "Achat",
    icon: ShoppingCart,
    iconClassName: "text-blue-600",
    badgeClassName: "bg-blue-100 text-blue-700",
  },
  EXPENSE: {
    label: "Depense",
    icon: Receipt,
    iconClassName: "text-rose-600",
    badgeClassName: "bg-rose-100 text-rose-700",
  },
};

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

export function DashboardRecentActivity({ activities = [], loading = false }) {
  return (
    <DashboardSection
      title="Activite recente"
      subtitle="Flux unifie des ventes, achats et depenses"
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-14 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">Aucune activite disponible.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const meta = TYPE_META[activity.type] || TYPE_META.EXPENSE;
            const Icon = meta.icon;

            return (
              <article
                key={activity.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${meta.iconClassName}`} />
                  <div>
                    <p className="font-medium text-slate-900">{activity.reference}</p>
                    <p className="text-xs text-slate-500">{formatDate(activity.date)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${meta.badgeClassName}`}>
                    {meta.label}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatCurrency(activity.amount)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
