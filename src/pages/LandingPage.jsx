import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { ThemeToggle } from '../components/theme/ThemeToggle.jsx';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <section className="relative isolate min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#fafaf9_0%,#e7e5e4_46%,#fef3c7_100%)] dark:bg-[linear-gradient(135deg,#0c0a09_0%,#1c1917_52%,#451a03_100%)]" />
        <header className="mx-auto flex max-w-7xl items-center gap-3">
          <p className="text-sm font-black uppercase tracking-wide text-red-800 dark:text-red-300">
            Backgammon Trainer
          </p>
          <div className="ml-auto flex items-center justify-end gap-2">
            <ThemeToggle />
            <Link
              className="min-h-11 rounded border border-stone-300 bg-white/80 px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-white dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100 dark:hover:bg-stone-900"
              to={user ? '/game' : '/login'}
            >
              {user ? 'Open App' : 'Login'}
            </Link>
          </div>
        </header>

        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1fr)]">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black leading-tight text-stone-950 dark:text-stone-50 sm:text-6xl lg:text-7xl">
              Learn backgammon by playing
            </h1>
            <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-stone-700 dark:text-stone-200">
              Play real matches with beginner guidance, quick strategy nudges, and post-game coaching
              that explains what to try next.
            </p>
            <div className="mt-6 grid max-w-xl gap-2 text-sm font-bold text-stone-700 dark:text-stone-200 sm:grid-cols-3">
              <span className="rounded border border-stone-300 bg-white/70 px-3 py-2 dark:border-stone-700 dark:bg-stone-900/70">
                Online invites
              </span>
              <span className="rounded border border-stone-300 bg-white/70 px-3 py-2 dark:border-stone-700 dark:bg-stone-900/70">
                City rankings
              </span>
              <span className="rounded border border-stone-300 bg-white/70 px-3 py-2 dark:border-stone-700 dark:bg-stone-900/70">
                Pro cosmetics
              </span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="min-h-12 rounded bg-red-800 px-5 py-3 text-sm font-black text-white transition hover:bg-red-900"
                to={user ? '/game' : '/register'}
              >
                Start Learning
              </Link>
              <Link
                className="min-h-12 rounded border border-stone-300 bg-white/80 px-5 py-3 text-sm font-black text-stone-900 transition hover:bg-white dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100 dark:hover:bg-stone-900"
                to="/leaderboard"
              >
                View Leaderboard
              </Link>
            </div>
          </div>

          <div className="mx-auto aspect-[1.45/1] w-full max-w-[42rem] rounded-lg border border-stone-300 bg-stone-900 p-2 shadow-2xl dark:border-stone-700 sm:aspect-[1.65/1] sm:p-3 lg:max-w-none">
            <div className="grid h-full grid-cols-[1fr_3.5rem_1fr] grid-rows-2 overflow-hidden rounded bg-emerald-900 ring-4 ring-amber-950">
              {[
                'col-start-1 row-start-1',
                'col-start-3 row-start-1',
                'col-start-1 row-start-2',
                'col-start-3 row-start-2',
              ].map((position, quadrant) => (
                <div className={`grid grid-cols-6 ${position}`} key={position}>
                  {Array.from({ length: 6 }, (_, point) => (
                    <div
                      className={`relative ${quadrant < 2 ? 'items-start' : 'items-end'} flex justify-center border-x border-amber-950/20`}
                      key={`${quadrant}-${point}`}
                    >
                      <div
                        className={
                          quadrant < 2
                            ? `border-x-[clamp(0.7rem,2.6vw,1.25rem)] border-t-[clamp(7rem,18vw,12rem)] border-x-transparent ${point % 2 ? 'border-t-amber-200' : 'border-t-red-900'}`
                            : `border-x-[clamp(0.7rem,2.6vw,1.25rem)] border-b-[clamp(7rem,18vw,12rem)] border-x-transparent ${point % 2 ? 'border-b-red-900' : 'border-b-amber-200'}`
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
              <div className="col-start-2 row-span-2 row-start-1 bg-amber-950" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
