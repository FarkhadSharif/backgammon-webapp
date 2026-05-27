import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { LogoutButton } from '../components/auth/LogoutButton.jsx';
import { PricingModal } from '../components/monetization/PricingModal.jsx';
import { ThemeToggle } from '../components/theme/ThemeToggle.jsx';
import { boardSkins, isPremiumSkin } from '../theme/boardSkins.js';
import {
  applyBoardSkinTheme,
  defaultBoardSkin,
  readBoardSkin,
  saveBoardSkin,
} from '../theme/skinStorage.js';

export function SkinSelectionPage() {
  const { profile, refreshProfile, saveProfile } = useAuth();
  const hasPro = profile?.pro_status === true;
  const initialSkin = profile?.selected_skin || readBoardSkin();
  const [selectedSkin, setSelectedSkin] = useState(initialSkin);
  const [isSaving, setIsSaving] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const nextSkin = profile?.selected_skin || readBoardSkin();
    setSelectedSkin(hasPro || !isPremiumSkin(nextSkin) ? nextSkin : defaultBoardSkin);
  }, [hasPro, profile?.selected_skin]);

  const selectedSkinDetails = useMemo(
    () => boardSkins.find((skin) => skin.id === selectedSkin) ?? boardSkins[0],
    [selectedSkin],
  );

  async function handleSelectSkin(skin) {
    setError('');
    setNotice('');

    if (skin.tier === 'pro' && !hasPro) {
      setIsPricingOpen(true);
      return;
    }

    setSelectedSkin(skin.id);
    saveBoardSkin(skin.id);
    applyBoardSkinTheme(skin.id);
    setIsSaving(true);

    try {
      await saveProfile({ selected_skin: skin.id });
      setNotice(`${skin.name} skin selected.`);
    } catch (skinError) {
      setError(skinError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRefreshProStatus() {
    setError('');
    setNotice('');
    setIsSaving(true);

    try {
      const nextProfile = await refreshProfile();
      setNotice(nextProfile?.pro_status ? 'Pro status refreshed.' : 'No Pro status found yet.');
    } catch (refreshError) {
      setError(refreshError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 px-2 py-4 text-stone-950 dark:bg-stone-950 dark:text-stone-50 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-800 dark:text-red-300">
              Cosmetics
            </p>
            <h1 className="text-2xl font-black sm:text-4xl">Board skins</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-600 dark:text-stone-300">
              A simple cosmetics loop for the demo: one default skin, premium Pro skins, and saved
              account selection.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NavLink to="/game">Game</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid gap-3 sm:grid-cols-2">
            {boardSkins.map((skin) => {
              const locked = skin.tier === 'pro' && !hasPro;
              const selected = selectedSkin === skin.id;

              return (
                <button
                  className={`rounded-lg border bg-white p-4 text-left shadow-sm transition dark:bg-stone-900 ${
                    selected
                      ? 'border-red-800 ring-2 ring-red-800/20 dark:border-red-300 dark:ring-red-300/20'
                      : 'border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800'
                  } ${locked ? 'opacity-80' : ''}`}
                  key={skin.id}
                  type="button"
                  onClick={() => handleSelectSkin(skin)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-stone-950 dark:text-stone-50">
                        {skin.name}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-stone-500 dark:text-stone-400">
                        {skin.tier === 'pro' ? 'Premium cosmetic skin' : 'Default skin'}
                      </p>
                    </div>
                    {skin.tier === 'pro' ? <ProBadge /> : null}
                  </div>
                  <div className="mt-5 flex h-20 overflow-hidden rounded border border-stone-200 dark:border-stone-700">
                    {skin.id === 'kazakh-heritage' ? (
                      <KazakhSkinPreview />
                    ) : (
                      skin.swatches.map((swatch) => (
                        <span className={`flex-1 ${swatch}`} key={swatch} />
                      ))
                    )}
                  </div>
                  <p className="mt-3 text-sm font-bold text-stone-700 dark:text-stone-200">
                    {locked ? 'Locked until Pro' : selected ? 'Selected' : 'Select skin'}
                  </p>
                </button>
              );
            })}
          </div>

          <aside className="rounded-lg border border-stone-300 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <p className="text-xs font-black uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Current skin
            </p>
            <h2 className="mt-1 text-2xl font-black">{selectedSkinDetails.name}</h2>
            <div className="mt-4 flex h-28 overflow-hidden rounded border border-stone-200 dark:border-stone-700">
              {selectedSkinDetails.id === 'kazakh-heritage' ? (
                <KazakhSkinPreview />
              ) : (
                selectedSkinDetails.swatches.map((swatch) => (
                  <span className={`flex-1 ${swatch}`} key={swatch} />
                ))
              )}
            </div>
            <p className="mt-4 text-sm font-semibold text-stone-600 dark:text-stone-300">
              {hasPro
                ? 'Your account has Pro access, so every cosmetic skin is available.'
                : 'Upgrade to Pro to unlock premium board skins.'}
            </p>
            <button
              className="mt-4 min-h-11 w-full rounded border border-stone-300 px-4 py-2 text-sm font-black text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800"
              type="button"
              onClick={handleRefreshProStatus}
              disabled={isSaving}
            >
              Refresh Pro Status
            </button>
            {error ? (
              <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="mt-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                {notice}
              </p>
            ) : null}
            {isSaving ? (
              <p className="mt-4 text-sm font-black uppercase tracking-wide text-stone-500">
                Saving skin
              </p>
            ) : null}
          </aside>
        </section>
      </div>
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
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

function ProBadge() {
  return (
    <span className="rounded bg-stone-950 px-2 py-1 text-[0.65rem] font-black uppercase tracking-wide text-white dark:bg-stone-100 dark:text-stone-950">
      Pro
    </span>
  );
}

function KazakhSkinPreview() {
  return (
    <div className="relative flex flex-1 overflow-hidden bg-[#00afca]">
      <div className="absolute inset-x-0 top-2 h-2 bg-[repeating-linear-gradient(135deg,#f7c948_0_6px,transparent_6px_14px,#fff_14px_17px,transparent_17px_24px)] opacity-80" />
      <div className="absolute inset-x-0 bottom-2 h-2 bg-[repeating-linear-gradient(135deg,#f7c948_0_6px,transparent_6px_14px,#fff_14px_17px,transparent_17px_24px)] opacity-80" />
      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f7c948]/60 bg-[repeating-conic-gradient(#f7c948_0deg_8deg,transparent_8deg_15deg)] opacity-70" />
      <span className="flex-1 bg-[#2f1d13]" />
      <span className="flex-[2] bg-[#00afca]" />
      <span className="flex-1 bg-[#f7c948]" />
    </div>
  );
}
