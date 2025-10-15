import axios, { AxiosInstance } from "axios";
const SERVER_IP = "http://192.168.254.243:3000";

export const api: AxiosInstance = axios.create({
  baseURL: SERVER_IP,
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
