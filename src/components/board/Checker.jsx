const checkerClass = {
  white:
    'border-[var(--checker-white-border)] bg-[var(--checker-white-bg)] text-[var(--checker-white-text)] shadow-stone-900/20',
  black:
    'border-[var(--checker-black-border)] bg-[var(--checker-black-bg)] text-[var(--checker-black-text)] shadow-stone-950/25',
};

export function Checker({ owner, label, isSelectable = false }) {
  return (
    <div
      className={`grid h-6 w-6 place-items-center rounded-full border-2 text-[0.6rem] font-black shadow-md transition-all duration-500 sm:h-9 sm:w-9 sm:text-[0.65rem] ${
        checkerClass[owner]
      } ${isSelectable ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}
    >
      {label}
    </div>
  );
}
