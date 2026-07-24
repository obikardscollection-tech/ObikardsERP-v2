import StatisticsLoadingState from "./StatisticsLoadingState";

export default function StatisticsSection({
  title,
  subtitle,
  loading = false,
  error = "",
  loadingContent,
  errorContent,
  children,
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>

      {loading ? (
        loadingContent || <StatisticsLoadingState />
      ) : error ? (
        errorContent || (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        )
      ) : (
        children
      )}
    </section>
  );
}