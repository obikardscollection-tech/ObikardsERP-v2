import api from "./api";

const API_URL = "/statistics/tops";

async function getTopCategory(category, filters = {}) {
  const { data } = await api.get(`${API_URL}/${category}`, {
    params: filters,
  });

  return data;
}

export async function getTopPlayers(filters = {}) {
  return getTopCategory("players", filters);
}

export async function getTopBrands(filters = {}) {
  return getTopCategory("brands", filters);
}

export async function getTopSports(filters = {}) {
  return getTopCategory("sports", filters);
}

export async function getTopSuppliers(filters = {}) {
  return getTopCategory("suppliers", filters);
}

export async function getTopCards(filters = {}) {
  return getTopCategory("cards", filters);
}

export async function getTopRoi(filters = {}) {
  return getTopCategory("top-roi", filters);
}

export async function getTopProfit(filters = {}) {
  return getTopCategory("top-benefits", filters);
}
