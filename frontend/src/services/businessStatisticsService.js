import api from "./api";

const API_URL = "/statistics/charts";

async function getSalesByPath(path, filters = {}) {
  const { data } = await api.get(`${API_URL}/${path}`, {
    params: filters,
  });

  return data;
}

export async function getSalesBySport(filters = {}) {
  return getSalesByPath("sales-by-sport", filters);
}

export async function getSalesByPlayer(filters = {}) {
  return getSalesByPath("sales-by-player", filters);
}

export async function getSalesByBrand(filters = {}) {
  return getSalesByPath("sales-by-brand", filters);
}

export async function getSalesBySupplier(filters = {}) {
  return getSalesByPath("sales-by-supplier", filters);
}

export async function getSalesByPlatform(filters = {}) {
  return getSalesByPath("sales-by-platform", filters);
}

export async function getSalesByYear(filters = {}) {
  return getSalesByPath("sales-by-year", filters);
}
