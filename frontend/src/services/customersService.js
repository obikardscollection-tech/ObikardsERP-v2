import api from "./api";

const API_URL = "/customers";

export async function getCustomers() {
  const { data } = await api.get(API_URL);
  return data;
}

export async function createCustomer(customer) {
  const { data } = await api.post(API_URL, customer);
  return data;
}

export async function updateCustomer(id, customer) {
  const { data } = await api.put(`${API_URL}/${id}`, customer);
  return data;
}

export async function deleteCustomer(id) {
  await api.delete(`${API_URL}/${id}`);
}