import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const getStoredAuthState = () => {
  try {
    const storedData = localStorage.getItem('auth-store');
    if (storedData) {
      const { state } = JSON.parse(storedData);
      return state;
    }
  } catch {
    return { user: null, token: null };
  }
  return { user: null, token: null };
};

const initialState = getStoredAuthState();

export const useAuth = create(
  persist(
    (set, get) => ({
      user: initialState.user,
      token: initialState.token,
      isAuthenticated: !!initialState.token,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      getToken: () => get().token,
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
