export default function StatisticsLoadingState({
  message = "Chargement des statistiques...",
  className = "",
}) {
  return (
    <section
      className={`flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </section>
  );
}