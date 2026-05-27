import { Checker } from './Checker.jsx';

const pointColor = {
  dark: 'border-t-[var(--point-dark)] border-b-[var(--point-dark)]',
  light: 'border-t-[var(--point-light)] border-b-[var(--point-light)]',
};

export function Point({
  number,
  orientation,
  variant,
  point,
  isSelected,
  isSelectable,
  isHighlighted,
  isDisabled,
  onSelect,
  onMove,
}) {
  const isDown = orientation === 'down';
  const triangleClass = isDown
    ? `border-x-[clamp(0.55rem,2.8vw,1.45rem)] border-t-[clamp(9rem,39vw,14rem)] border-x-transparent ${pointColor[variant].split(' ')[0]}`
    : `border-x-[clamp(0.55rem,2.8vw,1.45rem)] border-b-[clamp(9rem,39vw,14rem)] border-x-transparent ${pointColor[variant].split(' ')[1]}`;
  const checkers = point ? Array.from({ length: point.count }) : [];
  const tooltip = getPointTooltip(number, point, isHighlighted);

  function handleClick() {
    if (isDisabled) {
      return;
    }

    if (isHighlighted) {
      onMove();
      return;
    }

    onSelect();
  }

  return (
    <button
      className={`relative flex min-w-0 justify-center overflow-hidden ${
        isDown ? 'items-start' : 'items-end'
      } border-x border-board-frame/15 transition ${
        isSelectable ? 'cursor-pointer bg-emerald-100/20 dark:bg-emerald-400/10' : 'cursor-default'
      } ${isSelected ? 'bg-emerald-200/40 dark:bg-emerald-400/20' : ''} ${
        isHighlighted ? 'cursor-pointer bg-sky-200/45 ring-2 ring-inset ring-sky-500 dark:bg-sky-400/20 dark:ring-sky-300' : ''
      }`}
      aria-label={`Point ${number}`}
      title={tooltip}
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
    >
      <div className={triangleClass} />
      <div className="absolute inset-0 z-10 w-full">
        {checkers.map((_, index) => (
          <div
            key={index}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ [isDown ? 'top' : 'bottom']: `${0.35 + index * 0.72}rem` }}
          >
            <Checker
              owner={point.owner}
              isSelectable={isSelectable && index === 0}
            />
          </div>
        ))}
      </div>
      <span
        className={`absolute text-[0.65rem] font-bold text-stone-800/70 dark:text-stone-100/80 sm:text-xs ${
          isDown ? 'bottom-2' : 'top-2'
        }`}
      >
        {number}
      </span>
    </button>
  );
}

function getPointTooltip(number, point, isHighlighted) {
  if (isHighlighted && point?.count === 1) {
    return `Point ${number}. Hitting: land here to send this blot to the bar.`;
  }

  if (point?.count === 1) {
    return `Point ${number}. Blot: a single checker that can be hit.`;
  }

  if (point?.count > 1) {
    return `Point ${number}. Point: two or more checkers together block your opponent.`;
  }

  return `Point ${number}. A point is safer when you hold it with two or more checkers.`;
}
