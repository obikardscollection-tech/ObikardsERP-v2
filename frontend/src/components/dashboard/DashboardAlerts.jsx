import { AlertTriangle, CheckCircle2, OctagonAlert } from "lucide-react";
import { DashboardSection } from "./DashboardSection";

const ALERT_STYLE = {
  warning: {
    icon: AlertTriangle,
    iconClassName: "text-amber-600",
    containerClassName: "border-amber-200 bg-amber-50",
    titleClassName: "text-amber-900",
    messageClassName: "text-amber-800",
  },
  danger: {
    icon: OctagonAlert,
    iconClassName: "text-rose-600",
    containerClassName: "border-rose-200 bg-rose-50",
    titleClassName: "text-rose-900",
    messageClassName: "text-rose-800",
  },
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    containerClassName: "border-emerald-200 bg-emerald-50",
    titleClassName: "text-emerald-900",
    messageClassName: "text-emerald-800",
  },
};

export function DashboardAlerts({ alerts = [], loading = false }) {
  return (
    <DashboardSection
      title="Alertes"
      subtitle="Points de vigilance detectes a partir des donnees backend"
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const style = ALERT_STYLE[alert.level] || ALERT_STYLE.warning;
            const Icon = style.icon;

            return (
              <article
                key={alert.id}
                className={`rounded-lg border p-3 ${style.containerClassName}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-4 w-4 ${style.iconClassName}`} />
                  <div>
                    <h3 className={`text-sm font-semibold ${style.titleClassName}`}>
                      {alert.title}
                    </h3>
                    <p className={`mt-1 text-xs ${style.messageClassName}`}>{alert.message}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
