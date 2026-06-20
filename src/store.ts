import { create } from 'zustand';
import { User } from './types';

type AuthState = {
  user: User | null;
  loginParams: { open: boolean, type: "login" | "signup" | "forgot" };
  setUser: (user: User | null) => void;
  openAuthModal: (type: "login" | "signup" | "forgot") => void;
  closeAuthModal: () => void;
  updateCredits: (credits: number) => void;
  updatePlan: (plan: "Free" | "Pro" | "Business") => void;
  logout: () => void;
};

export const useStore = create<AuthState>((set) => ({
  user: null,
  loginParams: { open: false, type: "login" },
  setUser: (user) => set({ user }),
  openAuthModal: (type) => set({ loginParams: { open: true, type } }),
  closeAuthModal: () => set({ loginParams: { open: false, type: "login" } }),
  updateCredits: (credits) => set((state) => ({ user: state.user ? { ...state.user, credits } : null })),
  updatePlan: (plan) => set((state) => ({ user: state.user ? { ...state.user, plan } : null })),
  logout: () => set({ user: null }),
}));
