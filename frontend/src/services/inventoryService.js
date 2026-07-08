import api from "./api";

const API_URL = "/inventory";

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