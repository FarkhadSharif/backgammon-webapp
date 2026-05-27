import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SoundContext } from './SoundContext.jsx';
import { getSoundPackForSkin, soundPacks } from './soundPacks.js';
import { defaultSoundSettings, readSoundSettings, saveSoundSettings } from './soundStorage.js';
import { createSynthEngine } from './synthEngine.js';

export function SoundProvider({ children }) {
  const [settings, setSettings] = useState(readSoundSettings);
  const [soundPack, setSoundPack] = useState(soundPacks.default);
  const engineRef = useRef(null);
  const lastPlayedRef = useRef({});

  useEffect(() => {
    saveSoundSettings(settings);
    engineRef.current?.setVolume(settings.muted ? 0 : settings.volume);
  }, [settings]);

  const playSound = useCallback(
    (eventName) => {
      const event = soundPack.events[eventName];
      if (!event || settings.muted || settings.categories[event.category] === false) {
        return;
      }

      const now = performance.now();
      const lastPlayed = lastPlayedRef.current[eventName] ?? 0;
      if (now - lastPlayed < event.cooldown) {
        return;
      }

      lastPlayedRef.current[eventName] = now;

      if (!engineRef.current) {
        engineRef.current = createSynthEngine();
      }

      engineRef.current.play(event.synth, settings.volume);
    },
    [settings, soundPack],
  );

  useEffect(() => {
    function handleClick(event) {
      if (event.target.closest('button,a,input,label')) {
        playSound('uiClick');
      }
    }

    function handlePointerOver(event) {
      if (event.target.closest('button,a,label')) {
        playSound('uiHover');
      }
    }

    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('pointerover', handlePointerOver);
    };
  }, [playSound]);

  const value = useMemo(
    () => ({
      settings,
      soundPack,
      setSoundPackForSkin: (skin) => setSoundPack(getSoundPackForSkin(skin)),
      setMuted: (muted) =>
        setSettings((current) => ({
          ...current,
          muted,
        })),
      setVolume: (volume) =>
        setSettings((current) => ({
          ...current,
          volume: Math.min(1, Math.max(0, Number(volume))),
        })),
      toggleCategory: (category) =>
        setSettings((current) => ({
          ...current,
          categories: {
            ...current.categories,
            [category]: !current.categories[category],
          },
        })),
      resetSoundSettings: () => setSettings(defaultSoundSettings),
      playSound,
    }),
    [playSound, settings, soundPack],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
