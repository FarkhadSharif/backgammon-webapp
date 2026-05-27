import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { LogoutButton } from '../components/auth/LogoutButton.jsx';
import { ThemeToggle } from '../components/theme/ThemeToggle.jsx';
import { MATCH_STATUS, OPPONENT_LABEL } from '../game/matchTypes.js';
import { getMatchHistory } from '../services/matchService.js';

export function MatchHistoryPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getMatchHistory()
      .then((data) => {
        if (isMounted) {
          setMatches(data);
        }
      })
      .catch((historyError) => {
        if (isMounted) {
          setError(historyError.message);
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
  }, []);

  return (
    <main className="min-h-screen bg-stone-100 px-2 py-4 text-stone-950 dark:bg-stone-950 dark:text-stone-50 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-800 dark:text-red-300">
              Backgammon
            </p>
            <h1 className="text-2xl font-black sm:text-4xl">Match History</h1>
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
              to="/profile"
            >
              Profile
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
          {loading ? (
            <p className="p-6 text-sm font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Loading history
            </p>
          ) : error ? (
            <p className="m-6 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
              {error}
            </p>
          ) : matches.length === 0 ? (
            <p className="p-6 text-sm font-semibold text-stone-600 dark:text-stone-300">
              No matches saved yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm sm:min-w-[42rem]">
                <thead className="bg-stone-900 text-white dark:bg-black">
                  <tr>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Opponent</th>
                    <th className="px-4 py-3 font-bold">Result</th>
                    <th className="px-4 py-3 font-bold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-t border-stone-200 dark:border-stone-800">
                      <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-100">
                        {formatDate(match.started_at)}
                      </td>
                      <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
                        {OPPONENT_LABEL[match.opponent_type] ?? match.opponent_type}
                      </td>
                      <td className="px-4 py-3">
                        <Result match={match} userId={user.id} />
                      </td>
                      <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
                        {formatDuration(match.started_at, match.finished_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Result({ match, userId }) {
  if (match.status !== MATCH_STATUS.finished) {
    return (
      <span className="rounded bg-amber-100 px-2 py-1 text-xs font-black uppercase tracking-wide text-amber-900">
        In progress
      </span>
    );
  }

  const userWon = match.winner_id
    ? match.winner_id === userId
    : match.winner_color === 'white';

  return (
    <span
      className={`rounded px-2 py-1 text-xs font-black uppercase tracking-wide ${
        userWon ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {userWon ? 'Win' : 'Loss'}
    </span>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDuration(startedAt, finishedAt) {
  if (!startedAt || !finishedAt) {
    return '-';
  }

  const totalSeconds = Math.max(
    0,
    Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000),
  );
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
