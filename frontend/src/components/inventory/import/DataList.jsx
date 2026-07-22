import { stringifyValue } from "../../../utils/inventoryCsvImportUtils";

export default function DataList({ title, items, emptyLabel = "-" }) {
  const safeItems = Array.isArray(items)
    ? items.map((item) => stringifyValue(item)).filter((item) => item !== "-")
    : [];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {safeItems.length > 0 ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
          {safeItems.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-slate-500">{emptyLabel}</p>
      )}
    </div>
  );
}
