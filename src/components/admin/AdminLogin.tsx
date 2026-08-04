import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { isConnected } from '../../utils/backend';
import { loginAdmin } from '../../utils/api';

/**
 * Offline demo password. Read from the build environment and left unset by default,
 * so no working password is ever baked into a shipped bundle. When it is unset the
 * offline editor cannot be opened at all — connect an API instead.
 */
const DEMO_PASSWORD = (import.meta.env.VITE_ADMIN_DEMO_PASSWORD ?? '').trim();

export function AdminLogin({ onSuccess }: {onSuccess: (mode: 'server' | 'demo') => void;}) {
  const { backend, updateBackend } = useContent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const connected = isConnected(backend);
  const demoAvailable = DEMO_PASSWORD.length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError('');

    if (connected) {
      // Real login: the server verifies the bcrypt-hashed password and returns a JWT.
      setBusy(true);
      try {
        const token = await loginAdmin(backend.baseUrl, password, email.trim() || undefined);
        updateBackend({ apiKey: token });
        onSuccess('server');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed.');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (demoAvailable && password === DEMO_PASSWORD) {
      onSuccess('demo');
      return;
    }
    setError(demoAvailable ? 'Wrong password. Try again.' : 'Offline editing is disabled.');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald text-white">
          <LockIcon className="h-4 w-4" />
        </span>
        <h1 className="mt-5 text-xl font-medium text-slate-900">Admin sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          {connected ?
          'Enter your admin credentials to edit the landing page.' :
          demoAvailable ?
          'Offline demo mode — changes are saved in this browser only.' :
          'No API is configured, so there is nothing to sign in to.'}
        </p>

        {!connected && !demoAvailable ?
        <p className="mt-6 rounded-md bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-600">
            Set <code className="font-semibold">VITE_API_URL</code> in your <code className="font-semibold">.env</code> and
            rebuild to connect the editor to your server. See <code className="font-semibold">.env.example</code>.
          </p> :

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            {connected &&
          <label className="block">
                <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                  Email <span className="normal-case tracking-normal text-slate-400">(optional)</span>
                </span>
                <input
              type="email"
              value={email}
              autoComplete="username"
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="admin@example.com"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15" />

              </label>
          }
            {/* Not a wrapping <label>: the toggle sits inside the field, and a button
                inside a label would also fire the label's focus behaviour. */}
            <div>
              <label
              htmlFor="admin-password"
              className="block text-[11px] font-medium uppercase tracking-widest text-slate-500">

                Password
              </label>
              <div className="relative mt-2">
                <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoFocus
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                aria-invalid={Boolean(error)}
                className={`w-full rounded-md border py-2.5 pl-3 pr-11 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald/15 ${
                error ? 'border-red-400' : 'border-slate-300 focus:border-emerald'}`
                } />

                <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                title={showPassword ? 'Hide password' : 'Show password'}
                // tabIndex -1 keeps Tab going straight from the field to Sign in.
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-700">

                  {showPassword ?
                <EyeOffIcon className="h-4 w-4" /> :

                <EyeIcon className="h-4 w-4" />
                }
                </button>
              </div>
            </div>
            {error &&
          <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
          }
            <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald py-2.5 text-sm font-medium text-white hover:bg-emerald-deep disabled:opacity-60">

              {busy && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
              Sign in
            </button>
          </form>
        }

        <Link to="/" className="mt-5 block text-xs text-slate-500 underline underline-offset-4">
          Back to the landing page
        </Link>
      </div>
    </div>);

}
