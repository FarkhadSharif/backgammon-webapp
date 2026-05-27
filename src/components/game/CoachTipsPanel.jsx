export function CoachTipsPanel({ report, isLoading, error }) {
  const tips = report?.report_data?.tips ?? [];

  return (
    <section className="mt-6 max-h-[45vh] overflow-y-auto rounded border border-current/15 bg-white/80 p-4 text-left text-stone-900 shadow-inner dark:bg-stone-950/70 dark:text-stone-50">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-wide">AI Coach</h3>
        {isLoading ? (
          <span className="text-xs font-bold uppercase tracking-wide opacity-70">Analyzing</span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
      ) : null}

      {!error && !isLoading && tips.length === 0 ? (
        <div className="mt-3 rounded border border-stone-200 bg-white p-3 text-sm font-semibold text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
          No coaching notes were found yet. Finish a match with saved moves and the coach will
          highlight the clearest beginner improvements.
        </div>
      ) : null}

      {tips.length > 0 ? (
        <ol className="mt-4 space-y-3">
          {tips.map((tip) => (
            <li
              className="rounded border border-stone-200 bg-white p-3 text-sm shadow-sm dark:border-stone-700 dark:bg-stone-900"
              key={`${tip.type}-${tip.moveNumber}`}
            >
              <p className="text-xs font-black uppercase tracking-wide text-red-800 dark:text-red-300">
                Move {tip.moveNumber}
              </p>
              <p className="mt-2 font-bold">{tip.whatHappened}</p>
              <p className="mt-2 text-stone-700 dark:text-stone-300">{tip.whyRisky}</p>
              <p className="mt-2 font-semibold text-stone-950 dark:text-stone-50">
                Better idea: {tip.betterIdea}
              </p>
              <p className="mt-2 text-stone-600 dark:text-stone-400">
                {tip.beginnerFriendlyExplanation}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
