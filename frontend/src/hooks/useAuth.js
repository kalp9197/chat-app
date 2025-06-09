import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { updateUserStatus } from "../services/userService";
import axios from "../lib/axios";

const getStoredAuthState = () => {
  try {
    const storedData = localStorage.getItem("auth-store");
    if (storedData) {
      const { state } = JSON.parse(storedData);
      return state;
    }
  } catch {
    // Silent error handling
  }
  return { user: null, token: null };
};

const initialState = getStoredAuthState();

// Update online status when window/tab closes or user navigates away
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (initialState.user) {
      // Use sendBeacon for reliable delivery during page unload
      const data = JSON.stringify({ isOnline: false });
      navigator.sendBeacon("/api/users/status", data);
    }
  });
}

export const useAuth = create(
  persist(
    (set, get) => ({
      user: initialState.user,
      token: initialState.token,
      isAuthenticated: !!initialState.token,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        // Set user as online
        updateUserStatus(true);
      },
      logout: async () => {
        try {
          // Call backend logout endpoint
          await axios.post("/auth/logout");
        } catch (error) {
          console.error("Error during logout:", error);
          // Still update local status even if API call fails
          updateUserStatus(false);
        }

        set({ user: null, token: null, isAuthenticated: false });
      },
      // Helper method to get current token
      getToken: () => get().token,
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
