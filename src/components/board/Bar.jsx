import { BAR, GAME_STATUS, PLAYER_LABEL } from '../../game/constants.js';
import { Checker } from './Checker.jsx';

export function Bar({ owner, count, game, interactionDisabled = false }) {
  const isDisabled =
    interactionDisabled || game.gameStatus === GAME_STATUS.finished;
  const isSelectable = game.selectableSources.includes(BAR) && game.currentPlayer === owner;
  const isSelected = game.selectedSource === BAR && game.currentPlayer === owner;
  const checkers = Array.from({ length: count });

  function handleClick() {
    if (!isDisabled && isSelectable) {
      game.selectSource(BAR);
    }
  }

  return (
    <aside className="flex items-center justify-center bg-[var(--board-rail)] px-1 transition-colors duration-500 sm:px-2">
      <button
        className={`relative flex h-full w-full flex-col items-center justify-center gap-1 border-x border-amber-100/30 transition ${
          isSelectable ? 'cursor-pointer bg-emerald-200/20 dark:bg-emerald-400/10' : 'cursor-default'
        } ${isSelected ? 'ring-2 ring-inset ring-emerald-300' : ''}`}
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={`${PLAYER_LABEL[owner]} bar`}
        title="Bar: hit checkers wait here and must re-enter before other checkers can move."
      >
        {checkers.length === 0 ? (
          <span className="rotate-90 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-amber-50/80 sm:text-xs sm:tracking-[0.28em]">
            Bar
          </span>
        ) : (
          checkers.map((_, index) => (
            <div key={index} className="-my-1">
              <Checker
                owner={owner}
                isSelectable={isSelectable && index === 0}
              />
            </div>
          ))
        )}
      </button>
    </aside>
  );
}
