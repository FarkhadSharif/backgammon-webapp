export function StatusPanel({ tone = 'neutral', title, children, action }) {
  const toneClass = {
    neutral:
      'border-stone-300 bg-white text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100',
    info: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100',
    warning:
      'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100',
    error:
      'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100',
  }[tone];

  return (
    <section className={`rounded-lg border p-4 shadow-sm ${toneClass}`}>
      {title ? <p className="text-sm font-black">{title}</p> : null}
      <div className={title ? 'mt-1 text-sm font-semibold leading-6' : 'text-sm font-semibold leading-6'}>
        {children}
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
