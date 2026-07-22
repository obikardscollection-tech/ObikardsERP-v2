import api from "./api";

const API_URL = "/receptions";

export async function getReceptions(config = {}) {
  const { data } = await api.get(API_URL, config);
  return data;
}

export async function getReception(id, config = {}) {
  const { data } = await api.get(`${API_URL}/${id}`, config);
  return data;
}

export async function getPurchaseReceptions(purchaseId, config = {}) {
  const { data } = await api.get(`/purchases/${purchaseId}/receptions`, config);
  return data;
}

export async function createReception(payload, config = {}) {
  const { data } = await api.post(API_URL, payload, config);
  return data;
}

export async function updateReception(id, payload, config = {}) {
  const { data } = await api.put(`${API_URL}/${id}`, payload, config);
  return data;
}

export async function patchReception(id, payload, config = {}) {
  const { data } = await api.patch(`${API_URL}/${id}`, payload, config);
  return data;
}

export async function deleteReception(id, config = {}) {
  await api.delete(`${API_URL}/${id}`, config);
}
