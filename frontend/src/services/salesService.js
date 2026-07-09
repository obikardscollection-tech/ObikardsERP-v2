import api from "./api";

const API_URL = "/sales";

export async function getSales() {
  const { data } = await api.get(API_URL);
  return data;
}

export async function getSale(id) {
  const { data } = await api.get(`${API_URL}/${id}`);
  return data;
}

export async function createSale(sale) {
  const { data } = await api.post(API_URL, sale);
  return data;
}

export async function updateSale(id, sale) {
  const { data } = await api.put(`${API_URL}/${id}`, sale);
  return data;
}

export async function deleteSale(id) {
  await api.delete(`${API_URL}/${id}`);
}
