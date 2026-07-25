import api from "./api";

const API_URL = "/statistics/market";

export async function getMarketStatistics(filters = {}) {
  const { data } = await api.get(API_URL, {
    params: filters,
  });

  return data;
}
