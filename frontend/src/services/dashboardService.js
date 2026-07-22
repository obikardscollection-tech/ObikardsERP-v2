import api from "./api";

const API_URL = "/dashboard";

/**
 * Get dashboard data from backend aggregation endpoint
 */
export async function getDashboardData() {
  const { data } = await api.get(API_URL);
  return data;
}

/**
 * Refresh dashboard data
 */
export async function refreshDashboard() {
  return getDashboardData();
}
