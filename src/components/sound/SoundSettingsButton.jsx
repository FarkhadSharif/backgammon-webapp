import { useState } from 'react';
import { SOUND_CATEGORIES } from '../../sound/soundPacks.js';
import { useSound } from '../../sound/useSound.js';

const categoryLabels = {
  [SOUND_CATEGORIES.ui]: 'UI',
  [SOUND_CATEGORIES.dice]: 'Dice',
  [SOUND_CATEGORIES.checker]: 'Checkers',
  [SOUND_CATEGORIES.result]: 'Win/Lose',
  [SOUND_CATEGORIES.notification]: 'Notifications',
};

export function SoundSettingsButton() {
  const {
    settings,
    soundPack,
    setMuted,
    setVolume,
    toggleCategory,
    playSound,
  } = useSound();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="min-h-11 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        {settings.muted ? 'Muted' : 'Sound'}
      </button>

      {isOpen ? (
        <section className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1rem))] rounded-lg border border-stone-300 bg-white p-4 text-left shadow-xl dark:border-stone-700 dark:bg-stone-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Sound pack
              </p>
              <h3 className="text-lg font-black text-stone-950 dark:text-stone-50">
                {soundPack.name}
              </h3>
            </div>
            <button
              className="rounded bg-stone-950 px-3 py-2 text-xs font-black text-white dark:bg-stone-100 dark:text-stone-950"
              type="button"
              onClick={() => setMuted(!settings.muted)}
            >
              {settings.muted ? 'Unmute' : 'Mute'}
            </button>
          </div>

          <label className="mt-4 grid gap-2 text-sm font-bold text-stone-700 dark:text-stone-200">
            Volume
            <input
              className="h-2 accent-red-800"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.volume}
              onChange={(event) => setVolume(event.target.value)}
            />
          </label>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {Object.entries(categoryLabels).map(([category, label]) => (
              <label
                className="flex min-h-10 items-center gap-2 rounded border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700 dark:border-stone-700 dark:text-stone-200"
                key={category}
              >
                <input
                  type="checkbox"
                  checked={settings.categories[category]}
                  onChange={() => toggleCategory(category)}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="min-h-10 rounded border border-stone-300 px-3 py-2 text-xs font-black text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800"
              type="button"
              onClick={() => playSound('checkerMove')}
            >
              Preview move
            </button>
            <button
              className="min-h-10 rounded border border-stone-300 px-3 py-2 text-xs font-black text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800"
              type="button"
              onClick={() => playSound('win')}
            >
              Preview win
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
