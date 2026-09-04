import { useEffect, useState } from "react";
import {
  createBackup,
  deleteBackup,
  downloadBackup,
  listBackups,
  preflightBackup,
  restoreBackup,
} from "../services/backupService";

function errorMessage(error) {
  return error?.response?.data?.message || error?.message || "Operation impossible.";
}

export default function useBackups() {
  const [backups, setBackups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preflight, setPreflight] = useState(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const rows = await listBackups();
      setBackups(rows);
      setSelected((current) => rows.find((row) => row.filename === current?.filename) || null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function run(operation, worker, message) {
    setBusy(operation);
    setError("");
    setSuccess("");
    try {
      const result = await worker();
      setSuccess(message);
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function handleCreate() {
    const result = await run("create", createBackup, "Sauvegarde creee et verifiee.");
    if (result) await refresh();
  }

  async function handlePreflight() {
    if (!selected) return;
    const result = await run("preflight", () => preflightBackup(selected.filename), "Preflight valide.");
    setPreflight(result);
  }

  async function handleRestore(confirmation) {
    if (!selected) return null;
    return run("restore", () => restoreBackup(selected.filename, confirmation), "Restauration terminee.");
  }

  async function handleDelete() {
    if (!selected) return;
    const result = await run("delete", async () => {
      await deleteBackup(selected.filename);
      return true;
    }, "Sauvegarde supprimee.");
    if (result) {
      setSelected(null);
      setPreflight(null);
      await refresh();
    }
  }

  return {
    backups, busy, error, handleCreate, handleDelete, handlePreflight, handleRestore,
    loading, preflight, refresh, selected, setSelected, success,
    download: () => selected && run("download", () => downloadBackup(selected.filename), "Telechargement demarre."),
  };
}