export function DashboardSection({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-6 ${className}`}>
      {(title || subtitle || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {action ? <div>{action}</div> : null}
        </header>
      )}

      {children}
    </section>
  );
}
