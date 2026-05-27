import { Link } from 'react-router-dom';
import { ThemeToggle } from '../theme/ThemeToggle.jsx';

export function AuthForm({
  mode,
  error,
  notice,
  isSubmitting,
  onSubmit,
}) {
  const isRegister = mode === 'register';

  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 px-4 py-10 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <section className="w-full max-w-md rounded-lg border border-stone-300 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900 sm:p-6">
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-wide text-red-800 dark:text-red-300">
              Backgammon
            </p>
            <ThemeToggle />
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h1>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          {isRegister ? (
            <>
              <label className="grid gap-1 text-sm font-bold text-stone-700 dark:text-stone-200">
                Display name
                <input
                  className="min-h-11 rounded border border-stone-300 bg-white px-3 py-2 font-medium text-stone-950 outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  placeholder="Player name"
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-stone-700 dark:text-stone-200">
                City
                <input
                  className="min-h-11 rounded border border-stone-300 bg-white px-3 py-2 font-medium text-stone-950 outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Almaty"
                  required
                />
              </label>
            </>
          ) : null}

          <label className="grid gap-1 text-sm font-bold text-stone-700 dark:text-stone-200">
            Email
            <input
              className="min-h-11 rounded border border-stone-300 bg-white px-3 py-2 font-medium text-stone-950 outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-stone-700 dark:text-stone-200">
            Password
            <input
              className="min-h-11 rounded border border-stone-300 bg-white px-3 py-2 font-medium text-stone-950 outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </label>

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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Working...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm font-medium text-stone-600 dark:text-stone-300">
          {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
          <Link
            className="font-bold text-red-800 hover:text-red-900 dark:text-red-300 dark:hover:text-red-200"
            to={isRegister ? '/login' : '/register'}
          >
            {isRegister ? 'Login' : 'Register'}
          </Link>
        </p>
      </section>
    </main>
  );
}
