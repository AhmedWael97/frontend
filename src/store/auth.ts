import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  token: string | null;
  user: User | null;
  twoFactorChallenge: string | null;
  selectedDomainId: number | null;
  impersonating: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setTwoFactorChallenge: (challenge: string | null) => void;
  setSelectedDomainId: (id: number | null) => void;
  setImpersonating: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      twoFactorChallenge: null,
      selectedDomainId: null,
      impersonating: false,
      setToken: (token) => {
        set({ token });
        if (token) localStorage.setItem("eye_token", token);
        else localStorage.removeItem("eye_token");
      },
      setUser: (user) => set({ user }),
      setTwoFactorChallenge: (challenge) => set({ twoFactorChallenge: challenge }),
      setSelectedDomainId: (id) => set({ selectedDomainId: id }),
      setImpersonating: (v) => set({ impersonating: v }),
      logout: () => {
        localStorage.removeItem("eye_token");
        set({ token: null, user: null, twoFactorChallenge: null, selectedDomainId: null, impersonating: false });
      },
    }),
    { name: "eye-auth", partialize: (s) => ({ token: s.token, user: s.user, selectedDomainId: s.selectedDomainId, twoFactorChallenge: s.twoFactorChallenge }), skipHydration: true }
  )
);
