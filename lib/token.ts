const KEY = "access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY);
}

export function setToken(token: string): void {
  window.sessionStorage.setItem(KEY, token);
}

export function clearToken(): void {
  window.sessionStorage.removeItem(KEY);
}