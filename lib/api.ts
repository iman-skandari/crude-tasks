import axios, { AxiosError } from "axios";
import { clearToken, getToken } from "@/lib/token";

export const api = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginRequest = error.config?.url?.includes("/api/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      clearToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.";
    }

    const { status, data } = error.response;

    if (status === 401) return "احراز هویت ناموفق بود. دوباره وارد شوید.";
    if (status === 404) return "مورد درخواستی پیدا نشد یا منقضی شده است.";
    if (status === 503) return "سرویس موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.";

    if (status === 422 && data?.detail) {
      if (typeof data.detail === "string") return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((item: { msg?: string }) => item.msg)
          .filter(Boolean)
          .join("، ");
      }
    }

    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.error === "string") return data.error;
  }

  return "خطای ناشناخته‌ای رخ داد.";
}