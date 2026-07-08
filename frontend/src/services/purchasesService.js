import api from "./api";

const API_URL = "/purchases";

export async function getPurchases() {
  const { data } = await api.get(API_URL);
  return data;
}

export async function getPurchase(id) {
  const { data } = await api.get(`${API_URL}/${id}`);
  return data;
}

export async function createPurchase(purchase) {
  const { data } = await api.post(API_URL, purchase);
  return data;
}

export async function updatePurchase(id, purchase) {
  const { data } = await api.put(
    `${API_URL}/${id}`,
    purchase
  );

  return data;
}

export async function deletePurchase(id) {
  await api.delete(`${API_URL}/${id}`);
}