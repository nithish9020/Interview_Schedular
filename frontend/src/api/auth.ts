import type { UserRole } from "@/lib/types";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const signupUser = async (name: string, email: string, password: string, role: UserRole) => {
  const response = await axios.post(`${API_URL}/signup`, {
    name,
    email,
    password,
    role
  });
  console.log(response);
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

export const oauthCallback = async (code: string, provider: string, role: string) => {
  const response = await axios.post(`${API_URL}/oauth/callback`, {
    code,
    provider,
    role,
  });
  return response.data;
};
