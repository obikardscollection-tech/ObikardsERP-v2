import axios from "axios";

const API_URL = "http://localhost:3000/stock-movements";

export async function adjustStock(data) {
  const { data: response } = await axios.post(
    `${API_URL}/adjust`,
    data
  );

  return response;
}

export async function getStockHistory(inventoryId) {
  const { data } = await axios.get(
    `${API_URL}/${inventoryId}`
  );

  return data;
}