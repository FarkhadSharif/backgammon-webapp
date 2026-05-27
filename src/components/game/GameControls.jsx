import { GAME_STATUS, PLAYER_LABEL } from '../../game/constants.js';
import { getBoardSkinVars } from '../../theme/boardSkins.js';
import { useTheme } from '../../theme/useTheme.js';

export function GameControls({
  currentPlayer,
  dice,
  gameStatus,
  isInteractionDisabled = false,
  statusText,
  skin = 'classic',
  onRollDice,
  onEndTurn,
  onSurrender,
  onResetGame,
}) {
  const isFinished = gameStatus === GAME_STATUS.finished;
  const canRoll = !isFinished && !isInteractionDisabled && !dice.hasRolled;
  const { theme } = useTheme();
  const skinVars = getBoardSkinVars(skin, theme);

  return (
    <section
      className="board-skin grid gap-3 rounded-lg border border-stone-300 bg-white p-3 shadow-sm dark:border-stone-700 dark:bg-stone-900 sm:grid-cols-[1fr_auto] sm:items-center sm:p-4"
      style={skinVars}
    >
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Current player
          </p>
          <p className="text-lg font-bold text-stone-950 dark:text-stone-50">
            {PLAYER_LABEL[currentPlayer]}
          </p>
        </div>

        {isFinished ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Status
            </p>
            <p className="text-sm font-bold text-red-800">Finished</p>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Dice
          </span>
          <Dice values={dice.values} remaining={dice.remaining} />
        </div>

        {dice.hasRolled ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Remaining moves
            </p>
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
              {dice.remaining.length > 0 ? dice.remaining.join(', ') : 'None'}
            </p>
          </div>
        ) : null}

        {statusText ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Mode
            </p>
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{statusText}</p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        <button
          className="min-h-11 rounded bg-red-800 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-stone-300 sm:px-4"
          type="button"
          onClick={onRollDice}
          disabled={!canRoll}
        >
          Roll
        </button>
        <button
          className="min-h-11 rounded border border-stone-300 px-3 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-400 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800 dark:disabled:text-stone-600 sm:px-4"
          type="button"
          onClick={onEndTurn}
          disabled={isFinished || isInteractionDisabled || !dice.hasRolled}
        >
          End turn
        </button>
        {onSurrender ? (
          <button
            className="min-h-11 rounded border border-red-300 px-3 py-2 text-sm font-bold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-stone-400 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40 dark:disabled:text-stone-600 sm:px-4"
            type="button"
            onClick={onSurrender}
            disabled={isFinished}
          >
            Surrender
          </button>
        ) : null}
        <button
          className="min-h-11 rounded border border-stone-300 px-3 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800 sm:px-4"
          type="button"
          onClick={onResetGame}
        >
          Reset
        </button>
      </div>
    </section>
  );
}

function Dice({ values, remaining }) {
  if (values.length === 0) {
    return <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">Not rolled</span>;
  }

  return (
    <div className="flex gap-2">
      {values.map((value, index) => {
        const isUsed = countValue(remaining, value) <= indexValueUse(values, value, index);

        return (
          <span
            key={`${value}-${index}`}
            className={`grid h-10 w-10 place-items-center rounded border text-sm font-black sm:h-9 sm:w-9 ${
              isUsed
                ? 'border-[var(--dice-used-border)] bg-[var(--dice-used-bg)] text-[var(--dice-used-text)]'
                : 'border-[var(--dice-border)] bg-[var(--dice-bg)] text-[var(--dice-text)] shadow-sm'
            }`}
          >
            {value}
          </span>
        );
      })}
    </div>
  );
}

function countValue(values, value) {
  return values.filter((candidate) => candidate === value).length;
}

function indexValueUse(values, value, index) {
  return values.slice(0, index + 1).filter((candidate) => candidate === value).length - 1;
}
