import React, { createContext, useContext, useState, useMemo } from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
  isDark: boolean;
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);
  const toggle = () => setIsDark((v) => !v);
  const setTheme = (t: Theme) => setIsDark(t === "dark");
  const value = useMemo(() => ({ isDark, theme: isDark ? "dark" : "light", toggle, setTheme }), [isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
