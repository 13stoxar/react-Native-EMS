import axios from "axios";
import { getToken } from "../storage/secureStorage";
import { ENV } from "../config/env";

const api = axios.create({
  baseURL: ENV.API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
