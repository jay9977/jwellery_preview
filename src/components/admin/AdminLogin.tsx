import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircleIcon, ArrowRightIcon, EyeIcon, EyeOffIcon, Loader2Icon, ShieldCheckIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { isConnected } from '../../utils/backend';
import { loginAccount } from '../../utils/api';

/**
 * Offline demo password. Read from the build environment and left unset by default,
 * so no working password is ever baked into a shipped bundle. When it is unset the
 * offline editor cannot be opened at all — connect an API instead.
 */
const DEMO_PASSWORD = (import.meta.env.VITE_ADMIN_DEMO_PASSWORD ?? '').trim();

const display = "font-['Cormorant_Garamond',Georgia,serif]";
const EASE = [0.23, 1, 0.32, 1] as const;
// Photograph by rajat sarki on Unsplash (credited on the image).
const PHOTO = 'https://images.unsplash.com/photo-1625139108082-48bb424c2333?auto=format&fit=crop&q=80&w=1600';

const rise = (delay: number) => ({
  initial: { opacity: 0, transform: 'translateY(16px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  transition: { duration: 0.8, ease: EASE, delay }
});

/** A labelled field whose label floats up when the field is focused or filled. */
function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  autoFocus,
  invalid,
  children









}: {id: string;label: string;type: string;value: string;onChange: (v: string) => void;autoComplete: string;autoFocus?: boolean;invalid?: boolean;children?: React.ReactNode;}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={invalid}
        placeholder=" "
        onChange={(e) => onChange(e.target.value)}
        className={`peer h-14 w-full rounded-xl border bg-white/[0.04] px-4 pb-2 pt-6 text-[15px] text-white outline-none focus-visible:outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgb(224_168_145/0.14)] ${
        invalid ? 'border-red-400/70' : 'border-white/12 hover:border-white/25 focus:border-[#e0a891]'} ${
        children ? 'pr-12' : ''}`
        } />

      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/45 transition-all duration-200 [transition-timing-function:var(--ease-out)] peer-focus:top-4 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.16em] peer-focus:text-[#f0c2ae] peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.16em]">

        {label}
      </label>
      {children}
    </div>);

}

export function AdminLogin({ onSuccess }: {onSuccess: (mode: 'server' | 'demo', role?: string) => void;}) {
  const { backend, updateBackend, content, noSite } = useContent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(0);
  const connected = isConnected(backend);
  const demoAvailable = DEMO_PASSWORD.length > 0;
  // On a client's own domain the page names their store; on the platform's, the platform.
  const siteName = noSite ? 'Kothari IT' : content.brand.name;

  function fail(message: string) {
    setError(message);
    setShake((n) => n + 1);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError('');

    if (connected) {
      // Real login: the server verifies the bcrypt-hashed password and returns a JWT.
      setBusy(true);
      try {
        const { token, role } = await loginAccount(backend.baseUrl, password, email.trim() || undefined);
        updateBackend({ apiKey: token });
        onSuccess('server', role);
      } catch (err) {
        fail(err instanceof Error ? err.message : 'Login failed.');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (demoAvailable && password === DEMO_PASSWORD) {
      onSuccess('demo');
      return;
    }
    fail(demoAvailable ? 'Wrong password. Try again.' : 'Offline editing is disabled.');
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f1629] font-['Inter',system-ui,sans-serif] lg:flex-row">
      {/* ---------- the photograph ---------- */}
      <div className="relative h-[34vh] min-h-[220px] w-full overflow-hidden lg:h-auto lg:min-h-screen lg:w-[52%]">
        <motion.img
          src={PHOTO}
          alt=""
          initial={{ opacity: 0, transform: 'scale(1.12)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          transition={{ opacity: { duration: 1.2 }, transform: { duration: 14, ease: EASE } }}
          className="absolute inset-0 h-full w-full object-cover object-[50%_28%]" />

        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0f1629] via-[#0f1629]/35 to-[#0f1629]/10 lg:bg-gradient-to-r lg:from-transparent lg:via-[#0f1629]/10 lg:to-[#0f1629]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0f1629]/90 via-transparent to-transparent" />

        <motion.a {...rise(0.2)} href="/" className="absolute left-6 top-6 flex items-center gap-2.5 text-white lg:left-12 lg:top-10">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#f0c2ae] to-[#b07560] text-sm font-bold text-[#0f1629]">KIT</span>
          <span className={`${display} text-xl font-semibold drop-shadow`}>Kothari IT</span>
        </motion.a>

        <div className="absolute inset-x-6 bottom-6 hidden lg:inset-x-12 lg:bottom-12 lg:block">
          <motion.span {...rise(0.4)} className="block h-px w-14 bg-gradient-to-r from-[#f0c2ae] to-transparent" />
          <motion.p {...rise(0.5)} className={`${display} mt-6 max-w-md text-[2.6rem] font-medium leading-[1.1] text-white`}>
            Every piece deserves a beautiful home online.
          </motion.p>
          <motion.p {...rise(0.6)} className="mt-4 text-sm text-white/60">
            Manage your collections, offers and enquiries from one elegant studio.
          </motion.p>
        </div>
        <span className="absolute bottom-2 right-3 text-[10px] text-white/35">Photo · rajat sarki / Unsplash</span>
      </div>

      {/* ---------- the form ---------- */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pb-12 pt-4 lg:px-16 lg:py-16">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#e0a891]/10 blur-3xl" />
        <motion.div
          key={shake}
          initial={shake ? false : { opacity: 0, transform: 'translateY(24px)' }}
          animate={
          shake ?
          { transform: ['translateX(0px)', 'translateX(-10px)', 'translateX(8px)', 'translateX(-4px)', 'translateX(0px)'] } :
          { opacity: 1, transform: 'translateY(0px)' }
          }
          transition={{ duration: shake ? 0.45 : 0.9, ease: EASE, delay: shake ? 0 : 0.25 }}
          className="relative w-full max-w-[24rem]">

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0c2ae]">{siteName}</p>
          <h1 className={`${display} mt-4 text-[3.25rem] font-medium leading-none text-white`}>Sign in</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            {connected ?
            'Welcome back. Enter your details to manage your website.' :
            demoAvailable ?
            'Offline demo mode — changes are saved in this browser only.' :
            'No API is configured, so there is nothing to sign in to.'}
          </p>

          {!connected && !demoAvailable ?
          <p className="mt-8 rounded-xl border border-white/10 px-4 py-3 text-xs leading-relaxed text-white/60">
              Set <code className="font-semibold text-white/80">VITE_API_URL</code> in your <code className="font-semibold text-white/80">.env</code> and
              rebuild to connect the editor to your server. See <code className="font-semibold text-white/80">.env.example</code>.
            </p> :

          <form onSubmit={handleSubmit} className="mt-10 space-y-4" noValidate>
              {connected &&
            <Field
              id="admin-email"
              label="Email address"
              type="email"
              value={email}
              autoComplete="username"
              onChange={(v) => {
                setEmail(v);
                setError('');
              }} />

            }
              <Field
              id="admin-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              autoComplete="current-password"
              autoFocus
              invalid={Boolean(error)}
              onChange={(v) => {
                setPassword(v);
                setError('');
              }}>

                {/* Not inside the label: a button inside a label would also fire its focus behaviour. */}
                <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                // tabIndex -1 keeps Tab going straight from the field to Sign in.
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/40 transition-colors hover:text-white">

                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </Field>

              {error &&
            <motion.p
              role="alert"
              initial={{ opacity: 0, transform: 'translateY(-4px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              className="flex items-start gap-2.5 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">

                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                  {error}
                </motion.p>
            }

              <button
              type="submit"
              disabled={busy}
              className="group relative mt-2 inline-flex h-14 w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0c2ae] items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#f0c2ae] via-[#e0a891] to-[#c98b74] text-[15px] font-semibold text-[#0f1629] shadow-lg shadow-[#c98b74]/20 transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#c98b74]/30 hover:brightness-105 active:translate-y-0 active:scale-[0.99] disabled:opacity-70">

                {busy ?
              <Loader2Icon className="h-5 w-5 animate-spin" /> :

              <>
                    Sign in
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
              }
              </button>
            </form>
          }

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/45">
            <Link to="/" className="transition-colors hover:text-[#f0c2ae]">← Back to the website</Link>
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-[#e0a891]" />
              Encrypted sign-in
            </span>
          </div>
        </motion.div>
      </div>
    </div>);

}
