import { create } from "zustand";
import { clearToken, getToken, setToken } from "@/lib/token";

interface AuthState {
  token: string | null;
  ready: boolean;
  hydrate: () => void;
  signIn: (token: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  ready: false,
  hydrate: () => set({ token: getToken(), ready: true }),
  signIn: (token) => {
    setToken(token);
    set({ token });
  },
  signOut: () => {
    clearToken();
    set({ token: null });
  },
}));