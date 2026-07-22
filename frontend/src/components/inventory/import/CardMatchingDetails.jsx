import DataList from "./DataList";
import {
  formatPercentage,
  resolveMatchingPresentation,
  stringifyValue,
  toJsonBlock,
} from "../../../utils/inventoryCsvImportUtils";

export default function CardMatchingDetails({ row, fallbackMissingCriticalColumns = [] }) {
  const presentation = resolveMatchingPresentation(row, fallbackMissingCriticalColumns);

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <p className="text-xs text-slate-700">
          <span className="font-semibold">Statut:</span> {stringifyValue(presentation.status)}
        </p>
        <p className="text-xs text-slate-700">
          <span className="font-semibold">Score:</span> {stringifyValue(presentation.score)}
        </p>
        <p className="text-xs text-slate-700">
          <span className="font-semibold">Confiance:</span> {formatPercentage(presentation.confidence)}
        </p>
        <p className="text-xs text-slate-700">
          <span className="font-semibold">Provider:</span> {stringifyValue(presentation.provider)}
        </p>
        <p className="text-xs text-slate-700">
          <span className="font-semibold">Nb candidats:</span> {stringifyValue(presentation.candidateCount)}
        </p>
        <p className="text-xs text-slate-700">
          <span className="font-semibold">Fingerprint:</span> {stringifyValue(presentation.fingerprint)}
        </p>
        <p className="text-xs text-slate-700 md:col-span-2">
          <span className="font-semibold">Reference trouvee:</span> {stringifyValue(presentation.foundReference)}
        </p>
        <p className="text-xs text-slate-700 md:col-span-2">
          <span className="font-semibold">Reference manquante:</span> {stringifyValue(presentation.missingReference)}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meilleur candidat</p>
        <pre className="mt-1 overflow-x-auto rounded-md bg-slate-900 p-2 text-[11px] text-slate-100">
          {toJsonBlock(presentation.bestCandidate)}
        </pre>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details de scoring</p>
        <pre className="mt-1 overflow-x-auto rounded-md bg-slate-900 p-2 text-[11px] text-slate-100">
          {toJsonBlock(presentation.scoringDetails)}
        </pre>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DataList title="Conflits" items={presentation.conflicts} />
        <DataList title="Warnings" items={presentation.warnings} />
        <DataList title="Erreurs" items={presentation.errors} />
        <DataList title="Raisons de refus" items={presentation.refusalReasons} />
      </div>

      <DataList
        title="Colonnes critiques manquantes"
        items={presentation.missingCriticalColumns}
        emptyLabel="Aucune"
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payload matching brut</p>
        <pre className="mt-1 max-h-56 overflow-auto rounded-md bg-slate-900 p-2 text-[11px] text-slate-100">
          {toJsonBlock(presentation.rawMatching)}
        </pre>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payload ligne brut</p>
        <pre className="mt-1 max-h-56 overflow-auto rounded-md bg-slate-900 p-2 text-[11px] text-slate-100">
          {toJsonBlock(presentation.rawRow)}
        </pre>
      </div>
    </div>
  );
}
