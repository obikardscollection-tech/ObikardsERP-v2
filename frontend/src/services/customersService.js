import axios from "axios";

const API_URL = "http://localhost:3000/customers";

export async function getCustomers() {
  const response = await axios.get(API_URL);

  return response.data;
}

export async function createCustomer(data) {
  const response = await axios.post(
    API_URL,
    data
  );

  return response.data;
}

export async function updateCustomer(
  id,
  data
) {
  const response = await axios.put(
    `${API_URL}/${id}`,
    data
  );

  return response.data;
}

export async function deleteCustomer(id) {
  await axios.delete(
    `${API_URL}/${id}`
  );
}