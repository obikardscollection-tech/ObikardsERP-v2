export default function MessageList({ title, messages, tone = "default" }) {
  if (!messages.length) {
    return null;
  }

  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-800"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <section className={`rounded-xl border p-4 ${toneClass}`}>
      <h4 className="text-sm font-semibold">{title}</h4>

      <ul className="mt-2 space-y-1 text-sm">
        {messages.slice(0, 25).map((message) => (
          <li key={message}>- {message}</li>
        ))}
      </ul>

      {messages.length > 25 ? (
        <p className="mt-2 text-xs">+ {messages.length - 25} element(s) supplementaire(s)</p>
      ) : null}
    </section>
  );
}
