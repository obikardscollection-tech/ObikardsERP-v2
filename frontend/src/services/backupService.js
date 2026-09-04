import api from "./api";

export async function listBackups() {
  const response = await api.get("/backups");
  return response.data.backups;
}

export async function createBackup() {
  const response = await api.post("/backups", null, { timeout: 15 * 60 * 1000 });
  return response.data;
}

export async function preflightBackup(filename) {
  const response = await api.post(`/backups/${encodeURIComponent(filename)}/preflight`, null, { timeout: 15 * 60 * 1000 });
  return response.data;
}

export async function restoreBackup(filename, confirmation) {
  const response = await api.post(`/backups/${encodeURIComponent(filename)}/restore`, { confirmation }, { timeout: 30 * 60 * 1000 });
  return response.data;
}

export async function deleteBackup(filename) {
  await api.delete(`/backups/${encodeURIComponent(filename)}`);
}

export async function downloadBackup(filename) {
  const response = await api.get(`/backups/${encodeURIComponent(filename)}/download`, {
    responseType: "blob",
    timeout: 60000,
  });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}