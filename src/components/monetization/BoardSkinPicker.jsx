import { boardSkins } from '../../theme/boardSkins.js';

export function BoardSkinPicker({ selectedSkin, hasPro = false, onSelectSkin, onLockedSkin }) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white p-3 shadow-sm dark:border-stone-700 dark:bg-stone-900 sm:p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Board skins
          </p>
          <h2 className="text-lg font-black text-stone-950 dark:text-stone-50">
            Customize your board
          </h2>
        </div>
        <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
          {hasPro ? 'Pro skins unlocked' : 'Pro skins are locked'}
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {boardSkins.map((skin) => {
          const isLocked = skin.tier === 'pro' && !hasPro;

          return (
            <button
              className={`min-h-16 rounded border p-3 text-left transition ${
                selectedSkin === skin.id
                  ? 'border-red-800 ring-2 ring-red-800/20 dark:border-red-300 dark:ring-red-300/20'
                  : 'border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800'
              } ${isLocked ? 'opacity-75' : ''}`}
              key={skin.id}
              type="button"
              onClick={() => (isLocked ? onLockedSkin(skin) : onSelectSkin(skin.id))}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-black text-stone-900 dark:text-stone-100">{skin.name}</span>
                {skin.tier === 'pro' ? (
                <span className="rounded bg-stone-900 px-2 py-1 text-[0.65rem] font-black uppercase tracking-wide text-white dark:bg-stone-100 dark:text-stone-950">
                  Pro
                </span>
                ) : null}
              </div>
              <div className="mt-3 flex gap-1">
                {skin.swatches.map((swatch) => (
                  <span className={`h-5 flex-1 rounded ${swatch}`} key={swatch} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
