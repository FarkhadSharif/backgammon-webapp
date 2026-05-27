const proFeatures = [
  'Premium board skins',
  'Advanced AI Coach',
  'Unlimited match history',
  'Family tournament mode',
];

export function PricingModal({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-stone-950/60 px-4 backdrop-blur-sm dark:bg-black/70">
      <section
        className="w-full max-w-3xl rounded-lg border border-stone-200 bg-white p-4 shadow-2xl dark:border-stone-700 dark:bg-stone-900 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-red-800 dark:text-red-300">
              Upgrade
            </p>
            <h2 id="pricing-title" className="mt-1 text-2xl font-black text-stone-950 dark:text-stone-50">
              Choose your plan
            </h2>
            <p className="mt-2 text-sm font-semibold text-stone-600 dark:text-stone-300">
              Prototype billing is disabled. This modal shows the Pro packaging without taking
              payment.
            </p>
          </div>
          <button
            className="rounded border border-stone-300 px-3 py-2 text-sm font-black text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <PlanCard
            name="Free"
            price="$0"
            description="Learn the game with core play and beginner guidance."
            features={[
              'Local and online matches',
              'Beginner tips',
              'Basic AI Coach',
              'Classic board skin',
            ]}
          />
          <PlanCard
            name="Pro"
            price="$8"
            description="For players who want deeper feedback and more ways to play."
            features={proFeatures}
            highlighted
          />
        </div>

        <button
          className="mt-5 min-h-12 w-full rounded bg-red-800 px-5 py-3 text-sm font-black text-white transition hover:bg-red-900"
          type="button"
          onClick={() => window.alert('Stripe checkout coming soon')}
        >
          Stripe checkout coming soon
        </button>
        <p className="mt-3 text-center text-xs font-bold text-stone-500 dark:text-stone-400">
          No card will be charged in this prototype.
        </p>
      </section>
    </div>
  );
}

function PlanCard({ name, price, description, features, highlighted = false }) {
  return (
    <article
      className={`rounded-lg border p-4 ${
        highlighted
          ? 'border-red-800 bg-red-50 dark:border-red-400 dark:bg-red-950/30'
          : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-950'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xl font-black text-stone-950 dark:text-stone-50">{name}</h3>
        <p className="font-black text-stone-950 dark:text-stone-50">
          {price}
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400"> / mo</span>
        </p>
      </div>
      <p className="mt-2 text-sm font-semibold text-stone-600 dark:text-stone-300">{description}</p>
      <ul className="mt-4 grid gap-2">
        {features.map((feature) => (
          <li className="text-sm font-bold text-stone-800 dark:text-stone-100" key={feature}>
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}
