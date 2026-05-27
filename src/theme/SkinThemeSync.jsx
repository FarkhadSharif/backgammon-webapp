import { useEffect } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { useSound } from '../sound/useSound.js';
import { applyBoardSkinTheme, getAllowedBoardSkin } from './skinStorage.js';

export function SkinThemeSync() {
  const { profile } = useAuth();
  const { setSoundPackForSkin } = useSound();

  useEffect(() => {
    const skin = getAllowedBoardSkin(profile);
    applyBoardSkinTheme(skin);
    setSoundPackForSkin(skin);
  }, [profile, setSoundPackForSkin]);

  return null;
}
