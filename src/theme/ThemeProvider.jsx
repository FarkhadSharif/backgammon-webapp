import { useLayoutEffect, useMemo, useState } from 'react';
import { ThemeContext } from './themeContextValue.js';
import { applyTheme, getPreferredTheme } from './themeStorage.js';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
      },
      toggleTheme: () => {
        setTheme((currentTheme) => {
          const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
          applyTheme(nextTheme);
          return nextTheme;
        });
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
