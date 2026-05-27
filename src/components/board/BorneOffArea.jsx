import { PLAYER_LABEL } from '../../game/constants.js';
import { Checker } from './Checker.jsx';

export function BorneOffArea({ player, count, isHighlighted, onMove }) {
  return (
    <button
      className={`rounded-lg border border-stone-300 bg-white p-3 text-left shadow-sm transition dark:border-stone-700 dark:bg-stone-900 sm:p-4 ${
        isHighlighted ? 'cursor-pointer border-sky-500 ring-2 ring-sky-500 dark:border-sky-300 dark:ring-sky-300' : 'cursor-default'
      }`}
      type="button"
      onClick={isHighlighted ? onMove : undefined}
      disabled={!isHighlighted}
      title="Bearing off: remove checkers here after all of your checkers reach your home board."
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-800 dark:text-stone-100">
          {PLAYER_LABEL[player]}
        </h2>
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
          Borne off: {count}
        </span>
      </div>
      <div className="grid h-32 grid-cols-5 place-items-center gap-1 sm:h-44 sm:grid-cols-3 sm:gap-2">
        {Array.from({ length: 15 }, (_, index) => (
          <div key={index} className="grid h-7 w-7 place-items-center sm:h-9 sm:w-9">
            {index < count ? (
              <Checker owner={player} />
            ) : (
              <div className="h-6 w-6 rounded-full border border-dashed border-stone-300 bg-stone-50 dark:border-stone-700 dark:bg-stone-800 sm:h-8 sm:w-8" />
            )}
          </div>
        ))}
      </div>
    </button>
  );
}
