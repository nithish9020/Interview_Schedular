import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const registerUser = async (username: string, email: string, password: string) => {
  const response = await axios.post(`${API_URL}/register`, {
    username,
    email,
    password,
  });
  return response.data;
};
