import { formatReceptionDateTime } from "../../utils/receptionUtils";

function TimelineRow({ title, value }) {
  return (
    <div className="relative pl-7">
      <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
  );
}

export default function ReceptionTimeline({ reception }) {
  if (!reception) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4" aria-label="Historique de la réception">
      <h3 className="mb-4 text-base font-semibold text-slate-800">Historique</h3>

      <div className="space-y-4 border-l border-slate-200 pl-4">
        <TimelineRow title="Date de réception" value={formatReceptionDateTime(reception.receivedAt)} />
        <TimelineRow title="Créée le" value={formatReceptionDateTime(reception.createdAt)} />
        <TimelineRow title="Dernière mise à jour" value={formatReceptionDateTime(reception.updatedAt)} />
      </div>
    </section>
  );
}