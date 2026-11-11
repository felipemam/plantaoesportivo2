import React, { createContext, useContext, useEffect, useState } from 'react';

export type EffectiveTheme = 'light' | 'dark';
export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeContextType {
  theme: EffectiveTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function computeAutoTheme(): EffectiveTheme {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      const hour = new Date().getHours();
      // Even if OS reports light default, switch to dark automatically at night (18h - 06h)
      if (hour >= 18 || hour < 6) {
        return 'dark';
      }
      return 'light';
    }
  } catch {
    // fallback
  }
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('plantao_theme_mode');
      if (saved === 'auto' || saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'auto';
  });

  const [theme, setEffectiveTheme] = useState<EffectiveTheme>(() => {
    if (mode === 'light' || mode === 'dark') return mode;
    return computeAutoTheme();
  });

  useEffect(() => {
    const updateTheme = () => {
      const resolved: EffectiveTheme = mode === 'auto' ? computeAutoTheme() : mode;
      setEffectiveTheme(resolved);

      const root = document.documentElement;
      if (resolved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateTheme();

    try {
      localStorage.setItem('plantao_theme_mode', mode);
    } catch {
      // ignore
    }

    if (mode === 'auto' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateTheme();
      mediaQuery.addEventListener?.('change', handler);
      const timer = setInterval(updateTheme, 60000);
      return () => {
        mediaQuery.removeEventListener?.('change', handler);
        clearInterval(timer);
      };
    }
  }, [mode]);

  const toggleTheme = () => {
    setModeState((prev) => {
      if (prev === 'auto') return theme === 'light' ? 'dark' : 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  };

  const setTheme = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
