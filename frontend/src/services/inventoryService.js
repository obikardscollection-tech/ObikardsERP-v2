import axios from "axios";

const API_URL = "http://localhost:3000/inventory";

export async function getInventory() {
  const { data } = await axios.get(API_URL);
  return data;
}

export async function createInventory(item) {
  const { data } = await axios.post(API_URL, item);
  return data;
}

export async function updateInventory(id, item) {
  const { data } = await axios.put(
    `${API_URL}/${id}`,
    item
  );

  return data;
}

export async function deleteInventory(id) {
  await axios.delete(`${API_URL}/${id}`);
}