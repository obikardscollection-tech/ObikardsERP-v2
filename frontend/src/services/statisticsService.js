import api from "./api";

const API_URL = "/statistics";

export async function getStockStatistics(filters = {}) {
  const { data } = await api.get(`${API_URL}/stock`, {
    params: filters,
  });

  return data;
}

export async function getStockDistribution(filters = {}) {
  const { data } = await api.get(`${API_URL}/charts/stock-distribution`, {
    params: filters,
  });

  return data;
}
