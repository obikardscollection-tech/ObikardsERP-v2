import api from "./api";

const API_URL = "/suppliers";

export async function getSuppliers() {
  const { data } = await api.get(API_URL);
  return data;
}

export async function getSupplier(id) {
  const { data } = await api.get(`${API_URL}/${id}`);
  return data;
}

export async function createSupplier(supplier) {
  const { data } = await api.post(API_URL, supplier);
  return data;
}

export async function updateSupplier(id, supplier) {
  const { data } = await api.put(`${API_URL}/${id}`, supplier);
  return data;
}

export async function deleteSupplier(id) {
  await api.delete(`${API_URL}/${id}`);
}