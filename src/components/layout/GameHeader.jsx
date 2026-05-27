import { Link } from 'react-router-dom';
import { useState } from 'react';
import { LogoutButton } from '../auth/LogoutButton.jsx';
import { PricingModal } from '../monetization/PricingModal.jsx';
import { SoundSettingsButton } from '../sound/SoundSettingsButton.jsx';
import { ThemeToggle } from '../theme/ThemeToggle.jsx';
import { useAuth } from '../../auth/useAuth.js';

export function GameHeader() {
  const { profile, user } = useAuth();
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const playerName = profile?.display_name || user?.email;
  const hasPro = profile?.pro_status === true;

  return (
    <>
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-800 dark:text-red-300">
            Backgammon
          </p>
          <h1 className="text-2xl font-bold text-stone-950 dark:text-stone-50 sm:text-4xl">
            Match Board
          </h1>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-stone-700 sm:gap-3">
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
          <Link
            className="min-h-11 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
            to="/profile"
          >
            Profile
          </Link>
          <Link
            className="min-h-11 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
            to="/skins"
          >
            Skins
          </Link>
          {hasPro ? (
            <span className="min-h-11 rounded bg-emerald-700 px-4 py-2 text-sm font-black text-white">
              Pro Active
            </span>
          ) : (
            <button
              className="min-h-11 rounded bg-stone-950 px-4 py-2 text-sm font-black text-white transition hover:bg-stone-800 dark:bg-red-700 dark:hover:bg-red-800"
              type="button"
              onClick={() => setIsPricingOpen(true)}
            >
              Upgrade to Pro
            </button>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-stone-300 bg-white text-sm font-black text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
              {profile?.avatar_url ? (
                <img
                  className="h-full w-full object-cover"
                  src={profile.avatar_url}
                  alt={`${playerName} avatar`}
                />
              ) : (
                playerName?.[0]?.toUpperCase() || 'P'
              )}
            </div>
            <div className="min-w-0 text-left sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                Signed in
              </p>
              <p className="max-w-44 truncate font-bold text-stone-900 dark:text-stone-100 sm:max-w-60">
                {playerName}
              </p>
            </div>
          </div>
          <ThemeToggle />
          <SoundSettingsButton />
          <LogoutButton />
        </div>
      </header>
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </>
  );
}
