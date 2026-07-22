import api from "./api";

const API_URL = "/stock-movements";

export async function adjustStock(data) {
  const { data: response } = await api.post(`${API_URL}/adjust`, data);

  return response;
}

export async function getStockHistory(inventoryId) {
  const { data } = await api.get(`${API_URL}/${inventoryId}`);

  return data;
}