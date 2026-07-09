import { Plus, Box, TrendingUp, AlertCircle, Inbox, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Nouvel achat",
      icon: Plus,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
      action: () => navigate("/purchases"),
      description: "Créer un achat",
    },
    {
      label: "Nouvelle vente",
      icon: TrendingUp,
      color: "bg-green-50",
      iconColor: "text-green-600",
      action: () => navigate("/sales"),
      description: "Créer une vente",
    },
    {
      label: "Nouvelle dépense",
      icon: AlertCircle,
      color: "bg-red-50",
      iconColor: "text-red-600",
      action: () => navigate("/expenses"),
      description: "Créer une dépense",
    },
    {
      label: "Inventaire",
      icon: Box,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      action: () => navigate("/inventory"),
      description: "Gérer l'inventaire",
    },
    {
      label: "Réceptions",
      icon: Inbox,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      action: () => navigate("/receptions"),
      description: "Gérer les réceptions",
    },
  ];

  const comingSoon = [
    {
      label: "Achat rapide",
      icon: Zap,
      color: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "À venir",
    },
    {
      label: "Vente rapide",
      icon: Zap,
      color: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "À venir",
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <h3 className="mb-6 text-lg font-semibold text-slate-900">Raccourcis rapides</h3>

      <div className="mb-8">
        <p className="mb-4 text-xs font-medium text-slate-600 uppercase">Actions</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className={`rounded-lg p-4 transition-all hover:shadow-md ${action.color}`}
              >
                <Icon className={`mx-auto h-6 w-6 ${action.iconColor}`} />
                <p className="mt-2 text-xs font-medium text-slate-900">{action.label}</p>
                <p className="mt-1 text-xs text-slate-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-4 text-xs font-medium text-slate-600 uppercase">À venir</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {comingSoon.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.label}
                className={`cursor-not-allowed rounded-lg p-4 opacity-50 ${action.color}`}
              >
                <Icon className={`mx-auto h-6 w-6 ${action.iconColor}`} />
                <p className="mt-2 text-xs font-medium text-slate-900">{action.label}</p>
                <p className="mt-1 text-xs text-slate-600">{action.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
