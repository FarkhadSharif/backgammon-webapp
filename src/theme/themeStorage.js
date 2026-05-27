export const themeStorageKey = 'backgammon-theme';

export function getPreferredTheme() {
  const storedTheme = safeGetStoredTheme();

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const isDark = theme === 'dark';

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.body?.classList.toggle('dark', isDark);
  safeSetStoredTheme(theme);
}

function safeGetStoredTheme() {
  try {
    return localStorage.getItem(themeStorageKey);
  } catch {
    return null;
  }
}

function safeSetStoredTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Theme still works for the current session when storage is unavailable.
  }
}
