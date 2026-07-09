import api from "./api";

const API_URL = "/expenses";

export async function getExpenses() {
  const { data } = await api.get(API_URL);
  return data;
}

export async function getExpense(id) {
  const { data } = await api.get(`${API_URL}/${id}`);
  return data;
}

export async function createExpense(expense) {
  const { data } = await api.post(API_URL, expense);
  return data;
}

export async function updateExpense(id, expense) {
  const { data } = await api.put(`${API_URL}/${id}`, expense);
  return data;
}

export async function deleteExpense(id) {
  await api.delete(`${API_URL}/${id}`);
}
