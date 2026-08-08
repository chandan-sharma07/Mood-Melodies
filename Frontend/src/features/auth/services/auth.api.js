import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://mood-melodies-backend.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE}/api/auth`,
  withCredentials: true,
});

export const register = async (userData) => {
  const { data } = await api.post("/register", userData);
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post("/login", {
    email,
    password,
  });

  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/get-me");
  return data;
};

export const logout = async () => {
  const { data } = await api.post("/logout");
  return data;
};
