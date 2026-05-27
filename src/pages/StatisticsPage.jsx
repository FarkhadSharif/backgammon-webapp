import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { LogoutButton } from '../components/auth/LogoutButton.jsx';
import { ThemeToggle } from '../components/theme/ThemeToggle.jsx';
import { getPlayerStats } from '../services/statsService.js';

const statCards = [
  { key: 'total_games', label: 'Total games' },
  { key: 'wins', label: 'Wins' },
  { key: 'losses', label: 'Losses' },
  { key: 'games_vs_bot', label: 'Vs bot' },
  { key: 'games_vs_human', label: 'Vs human' },
  { key: 'win_rate', label: 'Win rate', suffix: '%' },
];

export function StatisticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getPlayerStats(user.id)
      .then((data) => {
        if (isMounted) {
          setStats(data);
        }
      })
      .catch((statsError) => {
        if (isMounted) {
          setError(statsError.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  return (
    <main className="min-h-screen bg-stone-100 px-2 py-4 text-stone-950 dark:bg-stone-950 dark:text-stone-50 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-800 dark:text-red-300">
              Backgammon
            </p>
            <h1 className="text-2xl font-black sm:text-4xl">Statistics</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="min-h-11 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
              to="/game"
            >
              Game
            </Link>
            <Link
              className="min-h-11 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
              to="/history"
            >
              History
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {loading ? (
          <section className="rounded-lg border border-stone-300 bg-white p-6 text-sm font-bold uppercase tracking-wide text-stone-500 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
            Loading statistics
          </section>
        ) : error ? (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
            {error}
          </p>
        ) : (
          <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {statCards.map((card) => (
              <article
                key={card.key}
                className="rounded-lg border border-stone-300 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900 sm:p-5"
              >
                <p className="text-sm font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-black text-stone-950 dark:text-stone-50 sm:text-4xl">
                  {formatValue(stats[card.key], card.suffix)}
                </p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function formatValue(value, suffix = '') {
  const numericValue = Number(value ?? 0);
  const displayValue = suffix ? numericValue.toFixed(2) : numericValue;
  return `${displayValue}${suffix}`;
}
