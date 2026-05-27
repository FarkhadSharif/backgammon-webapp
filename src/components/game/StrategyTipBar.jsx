import { BAR, OFF } from '../../game/constants.js';
import { TermTooltip } from './TermTooltip.jsx';

export function StrategyTipBar({ game, isBeginnerMode, quickMatchTimeLeft }) {
  if (!isBeginnerMode && quickMatchTimeLeft === null) {
    return null;
  }

  const tip = getTip(game);

  return (
    <section className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-950 shadow-sm dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {isBeginnerMode ? tip : 'Quick match is active. Play fast, but keep checkers connected.'}
        </p>
        {quickMatchTimeLeft !== null ? (
          <span className="shrink-0 rounded border border-sky-300 bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100">
            {formatTime(quickMatchTimeLeft)}
          </span>
        ) : null}
      </div>
    </section>
  );
}

function getTip(game) {
  if (!game.dice.hasRolled) {
    return (
      <>
        Roll, then look for a chance at <TermTooltip term="hitting">hitting</TermTooltip> or making a{' '}
        <TermTooltip term="point">point</TermTooltip>.
      </>
    );
  }

  if (game.captured[game.currentPlayer] > 0) {
    return (
      <>
        You have a checker on the <TermTooltip term="bar">bar</TermTooltip>. Re-enter it before
        moving anything else.
      </>
    );
  }

  if (game.availableMoves.some((move) => move.destination === OFF)) {
    return (
      <>
        You can start <TermTooltip term="bearing off">bearing off</TermTooltip>. Removing a checker
        is usually better than moving it around.
      </>
    );
  }

  if (game.availableMoves.some((move) => move.hit)) {
    return (
      <>
        There is a <TermTooltip term="hitting">hit</TermTooltip> available. Sending an opponent
        checker to the bar can win tempo.
      </>
    );
  }

  if (game.selectedSource !== null) {
    return (
      <>
        Before landing, check whether the destination leaves a <TermTooltip term="blot">blot</TermTooltip>{' '}
        or makes a safer point.
      </>
    );
  }

  if (game.availableMoves.length === 0) {
    return 'No legal moves are available with this roll, so ending the turn is fine.';
  }

  return (
    <>
      Try to move checkers in pairs. A made <TermTooltip term="point">point</TermTooltip> is much
      safer than a loose blot.
    </>
  );
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
