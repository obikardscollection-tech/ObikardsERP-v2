import api from "./api";

const API_URL = "/dashboard";

/**
 * Get dashboard data from backend aggregation endpoint
 */
export async function getDashboardData(filters = {}) {
  const { data } = await api.get(API_URL, {
    params: filters,
  });
  return data;
}

/**
 * Refresh dashboard data
 */
export async function refreshDashboard(filters = {}) {
  return getDashboardData(filters);
}
