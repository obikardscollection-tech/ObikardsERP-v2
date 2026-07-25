import api from "./api";

const API_URL = "/statistics/charts";

async function getChartByPath(path, filters = {}) {
  const { data } = await api.get(`${API_URL}/${path}`, {
    params: filters,
  });

  return data;
}

export async function getRevenueEvolution(filters = {}) {
  return getChartByPath("revenue-evolution", filters);
}

export async function getProfitEvolution(filters = {}) {
  return getChartByPath("profit-evolution", filters);
}

export async function getRoiEvolution(filters = {}) {
  return getChartByPath("roi-evolution", filters);
}

export async function getPurchasesEvolution(filters = {}) {
  return getChartByPath("purchases-evolution", filters);
}

export async function getSalesEvolution(filters = {}) {
  return getChartByPath("sales-evolution", filters);
}

export async function getStockEvolution(filters = {}) {
  return getChartByPath("stock-evolution", filters);
}

export async function getSalesDistribution(filters = {}) {
  return getChartByPath("sales-distribution", filters);
}

export async function getBenefitsDistribution(filters = {}) {
  return getChartByPath("benefits-distribution", filters);
}
