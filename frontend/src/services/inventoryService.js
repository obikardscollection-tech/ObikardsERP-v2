import api from "./api";

const API_URL = "/inventory";
const CSV_CONTENT_TYPE_HEADERS = {
  "Content-Type": "multipart/form-data",
};

function createCsvImportFormData(file) {
  const formData = new FormData();

  formData.append("file", file);

  return formData;
}

async function postInventoryCsv(endpoint, file) {
  const formData = createCsvImportFormData(file);
  const { data } = await api.post(endpoint, formData, {
    headers: CSV_CONTENT_TYPE_HEADERS,
  });

  return data;
}

export async function getInventory() {
  const { data } = await api.get(API_URL);
  return data;
}

export async function createInventory(item) {
  const { data } = await api.post(API_URL, item);
  return data;
}

export async function updateInventory(id, item) {
  const { data } = await api.put(`${API_URL}/${id}`, item);
  return data;
}

export async function deleteInventory(id) {
  await api.delete(`${API_URL}/${id}`);
}

export async function deleteInventoryBatch(ids) {
  await Promise.all(ids.map((id) => deleteInventory(id)));
}

export async function previewInventoryCsv(file) {
  return postInventoryCsv(`${API_URL}/import/csv/preview`, file);
}

export async function importInventoryCsv(file) {
  return postInventoryCsv(`${API_URL}/import/csv`, file);
}