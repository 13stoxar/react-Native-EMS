import axios from "axios";
import { getToken } from "../storage/secureStorage";

const api = axios.create({
  baseURL: "http://YOUR_FASTIFY_SERVER:3000",
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
