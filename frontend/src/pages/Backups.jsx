import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArchiveRestore, DatabaseBackup, Download, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import useBackups from "../hooks/useBackups";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 ** 2).toFixed(1)} Mo`;
}

export default function Backups() {
  const backupState = useBackups();
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const expectedConfirmation = backupState.selected ? `RESTAURER ${backupState.selected.filename}` : "";

  async function confirmRestore() {
    const result = await backupState.handleRestore(confirmation);
    if (result) {
      setRestoreOpen(false);
      setConfirmation("");
      window.setTimeout(() => window.location.assign("/login"), 1200);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden bg-slate-100 p-4 sm:p-6 xl:p-8">
        <Stack spacing={3} sx={{ maxWidth: 1200, mx: "auto" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
            <div>
              <Typography variant="h4" fontWeight={700}>Backup / Restore</Typography>
              <Typography color="text.secondary">Archives completes PostgreSQL et photos Inventory</Typography>
            </div>
            <Button variant="contained" startIcon={<DatabaseBackup size={18} />} onClick={backupState.handleCreate} disabled={Boolean(backupState.busy)}>
              Creer une sauvegarde
            </Button>
          </Stack>

          {backupState.error ? <Alert severity="error">{backupState.error}</Alert> : null}
          {backupState.success ? <Alert severity="success">{backupState.success}</Alert> : null}

          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <div className="border-b border-slate-200 px-5 py-4">
              <Typography variant="h6">Sauvegardes disponibles</Typography>
            </div>
            {backupState.loading ? (
              <div className="grid min-h-40 place-items-center"><CircularProgress size={28} /></div>
            ) : backupState.backups.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 5, textAlign: "center" }}>Aucune sauvegarde disponible.</Typography>
            ) : (
              <div className="divide-y divide-slate-200">
                {backupState.backups.map((backup) => (
                  <button
                    type="button"
                    key={backup.filename}
                    onClick={() => backupState.setSelected(backup)}
                    className={`grid w-full gap-2 px-5 py-4 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center ${backupState.selected?.filename === backup.filename ? "bg-blue-50" : "bg-white hover:bg-slate-50"}`}
                  >
                    <span className="min-w-0">
                      <span className="block break-all font-medium text-slate-900">{backup.filename}</span>
                      <span className="text-sm text-slate-500">{backup.createdAt ? new Date(backup.createdAt).toLocaleString("fr-FR") : "Archive invalide"}</span>
                    </span>
                    <span className="text-sm text-slate-600">{formatBytes(backup.archiveBytes)}</span>
                    <Chip size="small" color={backup.valid === false ? "error" : "success"} label={backup.valid === false ? "Invalide" : `${backup.photoCount} photos`} />
                  </button>
                ))}
              </div>
            )}
          </Paper>

          {backupState.selected ? (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">Actions</Typography>
                <Typography className="break-all" color="text.secondary">{backupState.selected.filename}</Typography>
                {backupState.preflight ? <Alert icon={<ShieldCheck size={20} />} severity="success">Archive exploitable, checksums et compatibilite PostgreSQL valides.</Alert> : null}
                <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                  <Button startIcon={<ShieldCheck size={18} />} variant="outlined" onClick={backupState.handlePreflight} disabled={Boolean(backupState.busy) || backupState.selected.valid === false}>Preflight</Button>
                  <Button startIcon={<Download size={18} />} variant="outlined" onClick={backupState.download} disabled={Boolean(backupState.busy) || backupState.selected.valid === false}>Telecharger</Button>
                  <Button startIcon={<ArchiveRestore size={18} />} color="warning" variant="contained" onClick={() => setRestoreOpen(true)} disabled={Boolean(backupState.busy) || !backupState.preflight}>Restaurer</Button>
                  <Button startIcon={<Trash2 size={18} />} color="error" variant="outlined" onClick={backupState.handleDelete} disabled={Boolean(backupState.busy)}>Supprimer</Button>
                </Stack>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </main>

      <Dialog open={restoreOpen} onClose={() => !backupState.busy && setRestoreOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmer la restauration</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning">Cette operation va remplacer les donnees actuelles.</Alert>
            <Typography variant="body2">Saisissez exactement <strong className="break-all">{expectedConfirmation}</strong></Typography>
            <TextField value={confirmation} onChange={(event) => setConfirmation(event.target.value)} fullWidth autoComplete="off" label="Confirmation" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreOpen(false)} disabled={backupState.busy === "restore"}>Annuler</Button>
          <Button color="error" variant="contained" onClick={confirmRestore} disabled={confirmation !== expectedConfirmation || backupState.busy === "restore"}>
            {backupState.busy === "restore" ? "Restauration..." : "Remplacer les donnees"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}