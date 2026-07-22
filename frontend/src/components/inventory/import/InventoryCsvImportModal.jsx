import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  importInventoryCsv,
  previewInventoryCsv,
} from "../../../services/inventoryService";

function getErrorMessage(error, fallback) {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      if (entry && typeof entry === "object") {
        const row = Number.isFinite(entry.row) ? `Ligne ${entry.row}: ` : "";
        const message = typeof entry.message === "string" ? entry.message : JSON.stringify(entry);

        return `${row}${message}`;
      }

      return String(entry);
    })
    .filter(Boolean);
}

function formatPercentage(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0%";
  }

  return `${(numberValue * 100).toFixed(0)}%`;
}

function formatDuration(durationMs) {
  const value = Number(durationMs);

  if (!Number.isFinite(value) || value <= 0) {
    return "-";
  }

  return `${value} ms`;
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MessageList({ title, messages, tone = "default" }) {
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

function PreviewRowsTable({ rows }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-slate-900">Apercu des lignes</h4>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Ligne</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Identifiant</th>
              <th className="px-3 py-2 text-left">Matching</th>
              <th className="px-3 py-2 text-left">Avertissements</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.row} className="border-b border-slate-100">
                <td className="px-3 py-2">{row.row}</td>
                <td className="px-3 py-2">{row.status || "-"}</td>
                <td className="px-3 py-2">{row.identifier || "-"}</td>
                <td className="px-3 py-2">{row?.matching?.status || "UNKNOWN"}</td>
                <td className="px-3 py-2">{Array.isArray(row.warnings) ? row.warnings.join(" | ") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ImportRowsTable({ rows }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-slate-900">Rapport detaille des lignes</h4>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Ligne</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Identifiant</th>
              <th className="px-3 py-2 text-left">Matching</th>
              <th className="px-3 py-2 text-left">Modifs</th>
              <th className="px-3 py-2 text-left">Warnings</th>
              <th className="px-3 py-2 text-left">Erreurs</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 50).map((row) => (
              <tr key={row.row} className="border-b border-slate-100">
                <td className="px-3 py-2">{row.row}</td>
                <td className="px-3 py-2">{row.status || "-"}</td>
                <td className="px-3 py-2">{row.identifier || "-"}</td>
                <td className="px-3 py-2">{row?.matching?.status || "UNKNOWN"}</td>
                <td className="px-3 py-2">{Array.isArray(row.changes) ? row.changes.join(", ") : "-"}</td>
                <td className="px-3 py-2">{Array.isArray(row.warnings) ? row.warnings.join(" | ") : "-"}</td>
                <td className="px-3 py-2">{Array.isArray(row.errors) ? row.errors.join(" | ") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 50 ? (
        <p className="mt-2 text-xs text-slate-500">Affichage limite aux 50 premieres lignes ({rows.length} au total).</p>
      ) : null}
    </section>
  );
}

export default function InventoryCsvImportModal({
  open,
  onClose,
  onImported,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);
  const [importReport, setImportReport] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setPreviewReport(null);
      setImportReport(null);
      setPreviewLoading(false);
      setImportLoading(false);
    }
  }, [open]);

  const previewWarnings = useMemo(
    () => normalizeMessages(previewReport?.warnings),
    [previewReport]
  );
  const previewInvalidLines = useMemo(
    () => normalizeMessages(previewReport?.errors),
    [previewReport]
  );
  const previewConflicts = useMemo(
    () => normalizeMessages(previewReport?.conflicts),
    [previewReport]
  );

  const importWarnings = useMemo(
    () => normalizeMessages(importReport?.warnings),
    [importReport]
  );
  const importErrors = useMemo(
    () => normalizeMessages(importReport?.errors),
    [importReport]
  );
  const importConflicts = useMemo(
    () => normalizeMessages(importReport?.conflicts),
    [importReport]
  );

  if (!open) {
    return null;
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setPreviewReport(null);
    setImportReport(null);
  }

  async function handlePreview() {
    if (!selectedFile) {
      toast.error("Selectionnez un fichier CSV avant de lancer l'aperçu.");
      return;
    }

    try {
      setPreviewLoading(true);

      const data = await previewInventoryCsv(selectedFile);

      setPreviewReport(data);
      setImportReport(null);
      toast.success("Apercu CSV genere.");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Impossible de generer l'aperçu CSV."));
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleImport() {
    if (!selectedFile) {
      toast.error("Selectionnez un fichier CSV avant d'importer.");
      return;
    }

    try {
      setImportLoading(true);

      const data = await importInventoryCsv(selectedFile);

      setImportReport(data);
      toast.success("Import CSV termine.");

      if (typeof onImported === "function") {
        await onImported(data);
      }
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Impossible d'importer le CSV."));
    } finally {
      setImportLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 md:p-8">
      <div className="mx-auto h-full w-full max-w-6xl overflow-y-auto rounded-2xl bg-slate-100 shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Import inventaire CSV</h2>
            <p className="mt-1 text-sm text-slate-500">Selection, apercu, controle des conflits puis import final.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={previewLoading || importLoading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Fermer
          </button>
        </div>

        <div className="space-y-4 p-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Fichier source</h3>

            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={handlePreview}
                disabled={!selectedFile || previewLoading || importLoading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {previewLoading ? "Analyse en cours..." : "Generer l'aperçu"}
              </button>

              <button
                type="button"
                onClick={handleImport}
                disabled={!selectedFile || importLoading || previewLoading}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importLoading ? "Import en cours..." : "Lancer l'import"}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {selectedFile ? `Fichier: ${selectedFile.name}` : "Aucun fichier selectionne."}
            </p>
          </section>

          {previewReport ? (
            <section className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-900">Resultats d'aperçu</h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <StatCard label="Provider" value={previewReport.provider || "-"} />
                <StatCard label="Version" value={previewReport.providerVersion || "-"} />
                <StatCard label="Confiance" value={formatPercentage(previewReport.confidence)} />
                <StatCard label="Score" value={`${previewReport.score || 0}/${previewReport.maxScore || 0}`} />
                <StatCard label="Lignes" value={previewReport.totalRows || 0} />
                <StatCard label="Duree" value={formatDuration(previewReport.durationMs)} />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Ready" value={previewReport?.statusCounters?.ready || 0} />
                <StatCard label="Skip" value={previewReport?.statusCounters?.skip || 0} />
                <StatCard label="Duplicates" value={previewReport?.statusCounters?.duplicate || 0} />
                <StatCard label="Invalides" value={previewReport?.statusCounters?.invalid || 0} />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Match single" value={previewReport?.matching?.single || 0} />
                <StatCard label="Match multiple" value={previewReport?.matching?.multiple || 0} />
                <StatCard label="Match none" value={previewReport?.matching?.none || 0} />
                <StatCard label="Match unknown" value={previewReport?.matching?.unknown || 0} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Colonnes reconnues:</span>{" "}
                  {Array.isArray(previewReport.recognizedColumns) && previewReport.recognizedColumns.length > 0
                    ? previewReport.recognizedColumns.join(", ")
                    : "-"}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Colonnes ignorees:</span>{" "}
                  {Array.isArray(previewReport.ignoredColumns) && previewReport.ignoredColumns.length > 0
                    ? previewReport.ignoredColumns.join(", ")
                    : "-"}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Colonnes critiques manquantes:</span>{" "}
                  {Array.isArray(previewReport.missingCriticalColumns) && previewReport.missingCriticalColumns.length > 0
                    ? previewReport.missingCriticalColumns.join(", ")
                    : "Aucune"}
                </p>
              </div>

              <MessageList title="Conflits" messages={previewConflicts} tone="danger" />
              <MessageList title="Warnings" messages={previewWarnings} tone="warning" />
              <MessageList title="Lignes invalides" messages={previewInvalidLines} tone="danger" />

              <PreviewRowsTable rows={previewReport.previewRows} />
            </section>
          ) : null}

          {importReport ? (
            <section className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">Rapport final d'import</h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-8">
                <StatCard label="Succes" value={importReport.success ? "Oui" : "Non"} />
                <StatCard label="Total" value={importReport.totalRows || 0} />
                <StatCard label="Crees" value={importReport.created || 0} />
                <StatCard label="Maj" value={importReport.updated || 0} />
                <StatCard label="Skips" value={importReport.skipped || 0} />
                <StatCard label="Duplicates" value={importReport.duplicates || 0} />
                <StatCard label="Failed" value={importReport.failed || 0} />
                <StatCard label="Invalides" value={importReport.invalidRows || 0} />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                <StatCard label="Match single" value={importReport?.matching?.single || 0} />
                <StatCard label="Match multiple" value={importReport?.matching?.multiple || 0} />
                <StatCard label="Match none" value={importReport?.matching?.none || 0} />
                <StatCard label="Match unknown" value={importReport?.matching?.unknown || 0} />
                <StatCard label="Duree" value={formatDuration(importReport.durationMs)} />
              </div>

              <MessageList title="Conflits" messages={importConflicts} tone="danger" />
              <MessageList title="Warnings" messages={importWarnings} tone="warning" />
              <MessageList title="Erreurs" messages={importErrors} tone="danger" />

              <ImportRowsTable rows={importReport.rows} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
