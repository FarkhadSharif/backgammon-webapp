import { OPPONENT_LABEL, OPPONENT_TYPES } from '../../game/matchTypes.js';

const localOpponentTypes = [OPPONENT_TYPES.bot, OPPONENT_TYPES.localHuman];

export function MatchStartPanel({
  unfinishedMatch,
  opponentType,
  trainingMode,
  isLoadingSavedGame,
  isCreating,
  error,
  onOpponentTypeChange,
  onTrainingModeChange,
  onContinueMatch,
  onStartMatch,
  onCreateOnlineGame,
}) {
  const selectedOpponentType = localOpponentTypes.includes(opponentType)
    ? opponentType
    : OPPONENT_TYPES.localHuman;

  if (isLoadingSavedGame) {
    return (
      <section className="grid min-h-[28rem] place-items-center rounded-lg border border-stone-300 bg-white p-6 text-sm font-bold uppercase tracking-wide text-stone-500 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
        Checking saved games
      </section>
    );
  }

  return (
    <section className="grid min-h-[28rem] gap-5 rounded-lg border border-stone-300 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="w-full text-center lg:text-left">
        <p className="text-sm font-bold uppercase tracking-wide text-red-800 dark:text-red-300">
          New match
        </p>
        <h2 className="mt-1 text-2xl font-black text-stone-950 dark:text-stone-50 sm:text-3xl">
          Choose how to learn
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-stone-600 dark:text-stone-300 lg:mx-0">
          For a clean demo, start with Beginner mode against the bot, make a few moves, then finish
          to show AI Coach feedback.
        </p>

        {unfinishedMatch ? (
          <div className="mt-5 rounded border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-700 dark:bg-amber-950/50">
            <p className="text-sm font-black text-amber-950 dark:text-amber-100">
              You have an unfinished game.
            </p>
            <p className="mt-1 text-sm font-medium text-amber-900 dark:text-amber-200">
              Continue it to keep progress, or start a new game to abandon it.
            </p>
            <button
              className="mt-4 min-h-11 w-full rounded bg-amber-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
              type="button"
              onClick={onContinueMatch}
            >
              Continue Game
            </button>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {localOpponentTypes.map((type) => (
            <button
              key={type}
              className={`min-h-14 rounded border px-4 py-4 text-sm font-bold transition sm:py-5 ${
                selectedOpponentType === type
                  ? 'border-red-800 bg-red-50 text-red-900 ring-2 ring-red-800/20 dark:border-red-400 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-400/20'
                  : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-800'
              }`}
              type="button"
              onClick={() => onOpponentTypeChange(type)}
            >
              {OPPONENT_LABEL[type]}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-2 text-left">
          <p className="text-xs font-black uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Training mode
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ['standard', 'Standard'],
              ['beginner', 'Beginner'],
              ['quick', '5-minute quick match'],
            ].map(([mode, label]) => (
              <button
                key={mode}
                className={`min-h-11 rounded border px-3 py-2 text-sm font-bold transition ${
                  trainingMode === mode
                    ? 'border-sky-700 bg-sky-50 text-sky-950 ring-2 ring-sky-700/20 dark:border-sky-300 dark:bg-sky-950/50 dark:text-sky-100'
                    : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-800'
                }`}
                type="button"
                onClick={() => onTrainingModeChange(mode)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-wrap">
          <button
            className="min-h-11 rounded bg-red-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-stone-300"
            type="button"
            onClick={() => onStartMatch(selectedOpponentType)}
            disabled={isCreating}
          >
            {isCreating ? 'Starting...' : 'Start New Game'}
          </button>

          <button
            className="min-h-11 rounded border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-800"
            type="button"
            onClick={onCreateOnlineGame}
            disabled={isCreating}
          >
            Create Online Game
          </button>
        </div>
      </div>

      <aside className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-left dark:border-stone-700 dark:bg-stone-950">
        <p className="text-xs font-black uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Demo flow
        </p>
        <ol className="mt-3 grid gap-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
          <li>1. Start Beginner mode vs bot</li>
          <li>2. Show legal moves and strategy tips</li>
          <li>3. Open Skins and Pro modal</li>
          <li>4. Create an online invite link</li>
          <li>5. Finish a match to show AI Coach</li>
        </ol>
      </aside>
    </section>
  );
}
