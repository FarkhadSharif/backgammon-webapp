const soundStorageKey = 'backgammon-sound-settings';

export const defaultSoundSettings = {
  muted: false,
  volume: 0.55,
  categories: {
    ui: true,
    dice: true,
    checker: true,
    result: true,
    notification: true,
  },
};

export function readSoundSettings() {
  if (typeof window === 'undefined') {
    return defaultSoundSettings;
  }

  try {
    const saved = JSON.parse(localStorage.getItem(soundStorageKey));
    return mergeSoundSettings(saved);
  } catch {
    return defaultSoundSettings;
  }
}

export function saveSoundSettings(settings) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(soundStorageKey, JSON.stringify(mergeSoundSettings(settings)));
  } catch {
    // Audio preferences are nice-to-have; ignore storage failures.
  }
}

function mergeSoundSettings(settings) {
  return {
    ...defaultSoundSettings,
    ...(settings ?? {}),
    categories: {
      ...defaultSoundSettings.categories,
      ...(settings?.categories ?? {}),
    },
  };
}
