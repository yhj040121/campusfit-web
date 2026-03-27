import axios from "axios";
import { clearSession, getToken } from "../utils/session";

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  return "/api";
}

const http = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 12000,
  headers: {
    "Content-Type": "application/json"
  }
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && payload.code === 0) {
      return payload.data;
    }
    return Promise.reject(new Error(payload?.message || "接口返回了异常结果"));
  },
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      window.dispatchEvent(new CustomEvent("campusfit-auth-expired"));
      return Promise.reject(new Error("登录状态已过期，请重新登录"));
    }

    if (error?.response?.status === 403) {
      return Promise.reject(new Error("请求被拒绝，请检查 /api 代理配置或后端访问权限"));
    }

    const message = typeof error?.response?.data === "string"
      ? error.response.data
      : error?.response?.data?.message;

    return Promise.reject(new Error(message || error?.message || "网络请求失败"));
  }
);

export default http;