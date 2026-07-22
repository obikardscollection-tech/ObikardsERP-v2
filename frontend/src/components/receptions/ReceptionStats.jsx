import { getReceptionStatus } from "../../utils/receptionUtils";

function ReceptionStats({ receptions = [] }) {
  const total = receptions.length;
  const pending = receptions.filter((reception) => getReceptionStatus(reception) === "PENDING").length;
  const partial = receptions.filter((reception) => getReceptionStatus(reception) === "PARTIALLY_RECEIVED").length;
  const completed = receptions.filter((reception) => getReceptionStatus(reception) === "COMPLETED").length;
  const totalReceivedQuantity = receptions.reduce((sum, reception) => sum + Number(reception.totalQuantity || 0), 0);

  const cards = [
    { label: "Réceptions", value: total, tone: "bg-slate-900 text-white" },
    { label: "En attente", value: pending, tone: "bg-slate-100 text-slate-700" },
    { label: "Partielles", value: partial, tone: "bg-amber-100 text-amber-700" },
    { label: "Terminées", value: completed, tone: "bg-emerald-100 text-emerald-700" },
    { label: "Quantité réceptionnée", value: totalReceivedQuantity, tone: "bg-blue-100 text-blue-700" },
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl p-4 shadow ${card.tone}`}>
          <p className="text-sm opacity-80">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default ReceptionStats;
