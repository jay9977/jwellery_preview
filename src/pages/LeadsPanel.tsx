import React, { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon, Loader2Icon, LogOutIcon, UsersIcon } from 'lucide-react';
import { useContent } from '../hooks/useContent';
import { isConnected } from '../utils/backend';
import { fetchAccount, loginAccount } from '../utils/api';
import { LeadsTable } from '../components/leads/LeadsTable';

type Gate = 'checking' | 'in' | 'out';

/**
 * The leads desk at /leads-panel. Its own login, separate from the site editor:
 * a leads account can read and work leads but can never change the website.
 * An admin login opens it too, so one person can use either door.
 */
export function LeadsPanel() {
  const { backend, updateBackend } = useContent();
  const connected = isConnected(backend);

  const [gate, setGate] = useState<Gate>('checking');
  const [account, setAccount] = useState<{email: string;role: string;} | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!connected || !backend.apiKey.trim()) {
        if (!cancelled) setGate('out');
        return;
      }
      const who = await fetchAccount(backend);
      if (cancelled) return;
      setAccount(who);
      setGate(who ? 'in' : 'out');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, backend.baseUrl, backend.apiKey]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (!connected) {
      setError('This panel needs the server. Start it with "npm run dev" and reload.');
      return;
    }
    setBusy(true);
    try {
      const { token } = await loginAccount(backend.baseUrl, password, email.trim() || undefined);
      updateBackend({ apiKey: token });
      setPassword('');
      // The effect above re-checks the token and opens the panel.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    updateBackend({ apiKey: '' });
    setAccount(null);
    setGate('out');
  }

  if (gate === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <span className="text-sm text-slate-400">Checking your session…</span>
      </div>);

  }

  if (gate === 'out') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald text-white">
            <UsersIcon className="h-4 w-4" />
          </span>
          <h1 className="mt-5 text-xl font-medium text-slate-900">Leads sign in</h1>
          <p className="mt-1 text-sm text-slate-500">
            {connected ?
            'Enter the leads account email and password.' :
            'The server is not running, so there are no leads to show.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                placeholder="leads@example.com"
                className="mt-1.5 h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-emerald" />

            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-600">Password</span>
              <span className="relative mt-1.5 block">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-10 w-full rounded-md border border-slate-300 px-3 pr-10 text-sm text-slate-900 outline-none focus:border-emerald" />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">

                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {error &&
            <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            }

            <button
              type="submit"
              disabled={busy || !connected}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald text-sm font-medium text-white hover:bg-emerald-deep disabled:opacity-60">

              {busy && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-medium text-slate-900">Leads</h1>
            <p className="text-xs text-slate-500">
              Everyone who reached the website{account?.email ? ` · signed in as ${account.email}` : ''}
              {account?.role === 'admin' ? ' (admin)' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {account?.role === 'admin' &&
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">

                Site editor
              </a>
            }
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">

              Open site
            </a>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-red-400 hover:text-red-600">

              <LogOutIcon className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <LeadsTable />
      </main>
    </div>);

}
