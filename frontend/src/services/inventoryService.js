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

export async function getInventory(config = {}) {
  const { data } = await api.get(API_URL, config);
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

export async function deleteInventory(id, config = {}) {
  await api.delete(`${API_URL}/${id}`, config);
}

export async function deleteInventoryBatch(ids, { chunkSize = 20 } = {}) {
  let failed = 0;

  for (let index = 0; index < ids.length; index += chunkSize) {
    const chunk = ids.slice(index, index + chunkSize);
    const results = await Promise.allSettled(
      chunk.map((id) => deleteInventory(id))
    );

    failed += results.filter((result) => result.status === "rejected").length;
  }

  if (failed > 0) {
    throw new Error(`${failed} suppression(s) ont echoue.`);
  }
}

export async function previewInventoryCsv(file) {
  return postInventoryCsv(`${API_URL}/import/csv/preview`, file);
}

export async function importInventoryCsv(file) {
  return postInventoryCsv(`${API_URL}/import/csv`, file);
}