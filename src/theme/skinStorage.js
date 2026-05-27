import { isKnownSkin, isPremiumSkin } from './boardSkins.js';

const skinStorageKey = 'backgammon-board-skin';
export const defaultBoardSkin = 'classic';

export function readBoardSkin() {
  if (typeof window === 'undefined') {
    return defaultBoardSkin;
  }

  try {
    return localStorage.getItem(skinStorageKey) || defaultBoardSkin;
  } catch {
    return defaultBoardSkin;
  }
}

export function saveBoardSkin(skin) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(skinStorageKey, skin);
  } catch {
    // Skin selection is cosmetic; ignore storage failures.
  }
}

export function getAllowedBoardSkin(profile) {
  const storedSkin = profile?.selected_skin || readBoardSkin();

  if (!isKnownSkin(storedSkin)) {
    return defaultBoardSkin;
  }

  if (isPremiumSkin(storedSkin) && profile?.pro_status !== true) {
    return defaultBoardSkin;
  }

  return storedSkin;
}

export function applyBoardSkinTheme(skin) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.boardSkin = skin || defaultBoardSkin;
}
