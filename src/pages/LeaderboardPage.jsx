import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { LogoutButton } from '../components/auth/LogoutButton.jsx';
import { ThemeToggle } from '../components/theme/ThemeToggle.jsx';
import { getLeaderboard } from '../services/leaderboardService.js';

export function LeaderboardPage() {
  const { profile } = useAuth();
  const [globalRows, setGlobalRows] = useState([]);
  const [cityRows, setCityRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const city = profile?.city?.trim();

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError('');

    getLeaderboard({ city })
      .then(({ global, local }) => {
        if (!isMounted) {
          return;
        }

        setGlobalRows(global);
        setCityRows(local);
      })
      .catch((leaderboardError) => {
        if (isMounted) {
          setError(leaderboardError.message);
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
  }, [city]);

  return (
    <main className="min-h-screen bg-stone-100 px-2 py-4 text-stone-950 dark:bg-stone-950 dark:text-stone-50 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-800 dark:text-red-300">
              Backgammon
            </p>
            <h1 className="text-2xl font-black sm:text-4xl">Leaderboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <NavLink to="/game">Game</NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
            {error}
          </p>
        ) : null}

        {!city ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
            Add your city on your profile to unlock your local leaderboard.
          </section>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-2">
          <LeaderboardTable
            title="Global top players"
            rows={globalRows}
            loading={loading}
            emptyText="No global leaderboard data yet."
          />
          <LeaderboardTable
            title={city ? `Top players from ${city}` : 'Top players from my city'}
            rows={cityRows}
            loading={loading}
            emptyText={city ? `No players from ${city} yet.` : 'Set your city to see local players.'}
          />
        </section>
      </div>
    </main>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      className="min-h-11 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
      to={to}
    >
      {children}
    </Link>
  );
}

function LeaderboardTable({ title, rows, loading, emptyText }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <div className="border-b border-stone-200 p-4 dark:border-stone-700 sm:p-5">
        <h2 className="text-xl font-black text-stone-950 dark:text-stone-50">{title}</h2>
      </div>

      {loading ? (
        <p className="p-5 text-sm font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Loading leaderboard
        </p>
      ) : rows.length === 0 ? (
        <div className="p-5">
          <p className="text-sm font-black text-stone-800 dark:text-stone-100">
            No rankings yet
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-600 dark:text-stone-300">
            {emptyText} Finish a match to populate this board.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 p-3 sm:hidden">
            {rows.map((row, index) => (
              <article
                className="rounded border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-950"
                key={`${row.user_id}-${row.city}-card`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-lg font-black text-stone-400">#{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate font-black text-stone-950 dark:text-stone-50">
                        {row.display_name || 'Player'}
                      </p>
                      <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
                        {row.city}
                      </p>
                    </div>
                  </div>
                  <p className="text-right text-sm font-black">
                    {Number(row.win_rate ?? 0).toFixed(2)}%
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-stone-600 dark:text-stone-300">
                  <span>Wins {row.wins}</span>
                  <span>Losses {row.losses}</span>
                  <span>Games {row.total_games}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs font-black uppercase tracking-wide text-stone-500 dark:bg-stone-950 dark:text-stone-400">
              <tr>
                <th className="w-14 px-4 py-3">#</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3 text-right">Wins</th>
                <th className="px-4 py-3 text-right">Losses</th>
                <th className="px-4 py-3 text-right">Win rate</th>
                <th className="px-4 py-3 text-right">Games played</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {rows.map((row, index) => (
                <tr
                  className="transition hover:bg-stone-50 dark:hover:bg-stone-800/70"
                  key={`${row.user_id}-${row.city}`}
                >
                  <td className="px-4 py-4 text-lg font-black text-stone-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-stone-300 bg-stone-100 text-sm font-black text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
                        {row.avatar_url ? (
                          <img
                            className="h-full w-full object-cover"
                            src={row.avatar_url}
                            alt={`${row.display_name || 'Player'} avatar`}
                          />
                        ) : (
                          getInitial(row.display_name)
                        )}
                      </div>
                      <span className="truncate font-black text-stone-950 dark:text-stone-50">
                        {row.display_name || 'Player'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-stone-600 dark:text-stone-300">
                    {row.city}
                  </td>
                  <StatCell value={row.wins} />
                  <StatCell value={row.losses} />
                  <StatCell value={`${Number(row.win_rate ?? 0).toFixed(2)}%`} />
                  <StatCell value={row.total_games} />
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function StatCell({ value }) {
  return <td className="px-4 py-4 text-right font-black">{value}</td>;
}

function getInitial(value) {
  return value?.trim()?.[0]?.toUpperCase() || 'P';
}
