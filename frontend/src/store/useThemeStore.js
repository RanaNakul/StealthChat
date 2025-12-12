import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("StealthChat-theme") || "forest", // default theme
  setTheme: (newTheme) => {
    localStorage.setItem("StealthChat-theme", newTheme);
    set({ theme: newTheme })
  },
}));

