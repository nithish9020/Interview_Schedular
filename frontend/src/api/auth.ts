import type { UserRole } from "@/lib/types";
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const signupUser = async (name: string, email: string, password: string, role: UserRole) => {
  const response = await axios.post(`${API_URL}/signup`, {
    name,
    email,
    password,
    role
  });
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};
