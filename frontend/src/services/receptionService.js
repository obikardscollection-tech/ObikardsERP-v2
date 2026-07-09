import api from "./api";

const API_URL = "/receptions";

export async function getReceptions() {
  const { data } = await api.get(API_URL);
  return data;
}

export async function getReception(id) {
  const { data } = await api.get(`${API_URL}/${id}`);
  return data;
}

export async function getPurchaseReceptions(purchaseId) {
  const { data } = await api.get(`/purchases/${purchaseId}/receptions`);
  return data;
}

export async function createReception(reception) {
  const { data } = await api.post(API_URL, reception);
  return data;
}

export async function updateReception(id, reception) {
  const { data } = await api.put(`${API_URL}/${id}`, reception);
  return data;
}

export async function deleteReception(id) {
  await api.delete(`${API_URL}/${id}`);
}
