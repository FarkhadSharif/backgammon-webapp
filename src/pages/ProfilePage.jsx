import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { LogoutButton } from '../components/auth/LogoutButton.jsx';
import { ThemeToggle } from '../components/theme/ThemeToggle.jsx';
import { getPlayerStats } from '../services/statsService.js';
import { uploadProfileAvatar } from '../services/profileService.js';

const statCards = [
  { key: 'total_games', label: 'Total games' },
  { key: 'wins', label: 'Wins' },
  { key: 'losses', label: 'Losses' },
  { key: 'games_vs_bot', label: 'Vs bot' },
  { key: 'games_vs_human', label: 'Vs human' },
  { key: 'win_rate', label: 'Win rate', suffix: '%' },
];

export function ProfilePage() {
  const { user, profile, saveProfile, refreshProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [loadingStats, setLoadingStats] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setDisplayName(profile?.display_name ?? '');
    setCity(profile?.city ?? '');
  }, [profile?.city, profile?.display_name]);

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
          setLoadingStats(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSavingProfile(true);

    try {
      await saveProfile({
        display_name: displayName.trim() || null,
        city: city.trim() || null,
      });
      setNotice('Profile saved.');
    } catch (profileError) {
      setError(profileError.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');
    setNotice('');
    setUploadingAvatar(true);

    try {
      await uploadProfileAvatar(user.id, file);
      await refreshProfile();
      setNotice('Profile picture updated.');
    } catch (avatarError) {
      setError(avatarError.message);
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 px-2 py-4 text-stone-950 dark:bg-stone-950 dark:text-stone-50 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-800 dark:text-red-300">
              Backgammon
            </p>
            <h1 className="text-2xl font-black sm:text-4xl">Profile</h1>
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
            <Link
              className="min-h-11 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
              to="/leaderboard"
            >
              Leaderboard
            </Link>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <article className="rounded-lg border border-stone-300 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900 sm:p-5">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full border-4 border-stone-200 bg-stone-100 text-4xl font-black text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400">
                {profile?.avatar_url ? (
                  <img
                    className="h-full w-full object-cover"
                    src={profile.avatar_url}
                    alt={`${profile.display_name || user.email} avatar`}
                  />
                ) : (
                  getInitial(profile?.display_name || user.email)
                )}
              </div>

              <label className="min-h-11 cursor-pointer rounded bg-red-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-900">
                {uploadingAvatar ? 'Uploading...' : 'Upload Picture'}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleProfileSubmit}>
              <label className="grid gap-1 text-sm font-bold text-stone-700 dark:text-stone-200">
                Display name
                <input
                  className="min-h-11 rounded border border-stone-300 bg-white px-3 py-2 font-medium text-stone-950 outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Player name"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-stone-700 dark:text-stone-200">
                City
                <input
                  className="min-h-11 rounded border border-stone-300 bg-white px-3 py-2 font-medium text-stone-950 outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Almaty"
                  autoComplete="address-level2"
                />
              </label>

              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                {user.email}
              </p>

              {error ? (
                <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
                  {error}
                </p>
              ) : null}

              {notice ? (
                <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                  {notice}
                </p>
              ) : null}

              <button
                className="min-h-11 rounded bg-red-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-stone-300"
                type="submit"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </article>

          {loadingStats ? (
            <section className="rounded-lg border border-stone-300 bg-white p-6 text-sm font-bold uppercase tracking-wide text-stone-500 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
              Loading statistics
            </section>
          ) : (
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {statCards.map((card) => (
                <article
                  key={card.key}
                  className="rounded-lg border border-stone-300 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900 sm:p-5"
                >
                  <p className="text-sm font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-black text-stone-950 dark:text-stone-50 sm:text-4xl">
                    {formatValue(stats?.[card.key], card.suffix)}
                  </p>
                </article>
              ))}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

function getInitial(value) {
  return value?.trim()?.[0]?.toUpperCase() || 'P';
}

function formatValue(value, suffix = '') {
  const numericValue = Number(value ?? 0);
  const displayValue = suffix ? numericValue.toFixed(2) : numericValue;
  return `${displayValue}${suffix}`;
}
