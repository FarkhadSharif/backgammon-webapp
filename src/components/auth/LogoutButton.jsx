import { useAuth } from '../../auth/useAuth.js';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      className="min-h-11 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
      type="button"
      onClick={logout}
    >
      Logout
    </button>
  );
}
