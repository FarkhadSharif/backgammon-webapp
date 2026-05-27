import { PLAYER_LABEL } from '../../game/constants.js';
import { CoachTipsPanel } from './CoachTipsPanel.jsx';

const winnerTone = {
  white: 'from-stone-50 via-white to-amber-100 text-stone-950 dark:from-stone-100 dark:via-white dark:to-amber-200',
  black: 'from-stone-950 via-stone-900 to-red-950 text-white dark:from-black dark:via-stone-950 dark:to-red-950',
};

export function WinnerModal({ winner, onPlayAgain, coachReport, isCoachLoading, coachError }) {
  if (!winner) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/60 px-4 backdrop-blur-sm dark:bg-black/70">
      <section
        className={`victory-pop w-full max-w-2xl rounded-lg bg-gradient-to-br p-6 text-center shadow-2xl sm:p-8 ${winnerTone[winner]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="winner-title"
      >
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border-4 border-current/30 text-4xl font-black">
          {winner === 'white' ? 'W' : 'B'}
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-75">
          Game finished
        </p>
        <h2 id="winner-title" className="mt-2 text-4xl font-black">
          {PLAYER_LABEL[winner]} wins
        </h2>
        <CoachTipsPanel
          report={coachReport}
          isLoading={isCoachLoading}
          error={coachError}
        />
        <button
          className="mt-7 rounded bg-red-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-900"
          type="button"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
      </section>
    </div>
  );
}
