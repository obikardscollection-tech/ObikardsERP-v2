const TONE_CLASSES = {
  blue: {
    container: "bg-blue-50",
    label: "text-blue-800",
    value: "text-blue-900",
    icon: "text-blue-600",
  },
  emerald: {
    container: "bg-emerald-50",
    label: "text-emerald-800",
    value: "text-emerald-900",
    icon: "text-emerald-600",
  },
  amber: {
    container: "bg-amber-50",
    label: "text-amber-800",
    value: "text-amber-900",
    icon: "text-amber-600",
  },
  slate: {
    container: "bg-slate-100",
    label: "text-slate-700",
    value: "text-slate-900",
    icon: "text-slate-600",
  },
  rose: {
    container: "bg-rose-50",
    label: "text-rose-800",
    value: "text-rose-900",
    icon: "text-rose-600",
  },
};

export function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "slate",
  loading = false,
}) {
  const colors = TONE_CLASSES[tone] || TONE_CLASSES.slate;

  return (
    <article className={`rounded-lg p-4 ${colors.container}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${colors.label}`}>{label}</p>
          <p className={`mt-2 text-2xl font-bold ${colors.value}`}>
            {loading ? "..." : value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>

        {Icon ? <Icon className={`h-7 w-7 ${colors.icon}`} /> : null}
      </div>
    </article>
  );
}
