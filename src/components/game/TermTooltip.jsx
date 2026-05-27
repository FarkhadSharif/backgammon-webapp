const termCopy = {
  blot: 'A single checker sitting alone. Blots can be hit by your opponent.',
  point: 'Two or more checkers on the same triangle. Your opponent cannot land there.',
  'bearing off': 'Removing checkers once all of your checkers are in your home board.',
  bar: 'The middle rail where hit checkers wait before they re-enter the board.',
  hitting: 'Landing on an opponent blot and sending that checker to the bar.',
};

export function TermTooltip({ term, children }) {
  const copy = termCopy[term];

  return (
    <span className="group relative inline-flex">
      <button
        className="rounded-sm border-b border-dotted border-current font-black text-red-800 outline-none transition hover:text-red-900 focus-visible:ring-2 focus-visible:ring-red-800/30 dark:text-red-300 dark:hover:text-red-200"
        type="button"
        aria-label={`${children}: ${copy}`}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded border border-stone-200 bg-white px-3 py-2 text-left text-xs font-semibold leading-relaxed text-stone-700 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
        {copy}
      </span>
    </span>
  );
}
