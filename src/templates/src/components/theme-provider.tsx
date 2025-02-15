import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    let resolvedTheme: Theme;

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      resolvedTheme = systemTheme;
    } else {
      root.classList.add(theme);
      resolvedTheme = theme;
    }

    // Dynamically switch the stylesheets
    const lightThemeLink = document.querySelector(
      "#rc-dock-light-theme"
    ) as HTMLLinkElement | null;
    const darkThemeLink = document.querySelector(
      "#rc-dock-dark-theme"
    ) as HTMLLinkElement | null;

    if (resolvedTheme === "light") {
      if (!lightThemeLink) {
        const link = document.createElement("link");
        link.id = "rc-dock-light-theme";
        link.rel = "stylesheet";
        link.href = "/styles/rc-dock.css"; // Local path
        document.head.appendChild(link);
      }
      if (darkThemeLink) darkThemeLink.disabled = true; // Disable dark theme
      if (lightThemeLink) lightThemeLink.disabled = false; // Enable light theme
    }

    if (resolvedTheme === "dark") {
      if (!darkThemeLink) {
        const link = document.createElement("link");
        link.id = "rc-dock-dark-theme";
        link.rel = "stylesheet";
        link.href = "/styles/rc-dock-dark.css"; // Local path
        document.head.appendChild(link);
      }
      if (lightThemeLink) lightThemeLink.disabled = true; // Disable light theme
      if (darkThemeLink) darkThemeLink.disabled = false; // Enable dark theme
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
