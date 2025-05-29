import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Helper to get initial state from localStorage
const getStoredAuthState = () => {
  try {
    const storedData = localStorage.getItem('auth-store');
    if (storedData) {
      const { state } = JSON.parse(storedData);
      return state;
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return { user: null, token: null };
};

// Get initial state
const initialState = getStoredAuthState();

export const useAuth = create(
  persist(
    (set) => ({
      user: initialState.user,
      token: initialState.token,
      isAuthenticated: !!initialState.token,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { 
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
