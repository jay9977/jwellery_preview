import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRightIcon, EyeIcon, EyeOffIcon, Loader2Icon, LockIcon, MailIcon, ShieldCheckIcon, SparklesIcon } from 'lucide-react';
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

const rise = (delay: number) => ({
  initial: { opacity: 0, transform: 'translateY(18px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  transition: { duration: 0.8, ease: EASE, delay }
});

function useLayer(mx: MotionValue<number>, my: MotionValue<number>, depth: number) {
  return { x: useTransform(mx, (v) => v * -depth), y: useTransform(my, (v) => v * -depth) };
}

/** The left half: the platform's own work, floating in layers that follow the pointer. */
function Showcase() {
  const reduce = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const back = useLayer(mx, my, 10);
  const mid = useLayer(mx, my, 22);
  const front = useLayer(mx, my, 36);

  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const move = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [mx, my, reduce]);

  const card = (src: string, delay: number, cls: string) =>
  <motion.div
    initial={{ opacity: 0, transform: 'translateY(40px) scale(0.94)' }}
    animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
    transition={{ duration: 1.2, ease: EASE, delay }}
    className={cls}>

      <div className="kit-float overflow-hidden rounded-xl bg-[#1a2340] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/10">
        <div className="flex gap-1 px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        </div>
        <img src={src} alt="" className="aspect-[16/10] w-full object-cover object-top" />
      </div>
    </motion.div>;


  return (
    <div className="relative hidden flex-1 flex-col justify-between p-12 lg:flex xl:p-16">
      <motion.a {...rise(0)} href="/" className="relative z-10 flex items-center gap-2.5 text-[#f6ece8]">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#f0c2ae] to-[#b07560] text-sm font-bold text-[#0f1629]">KIT</span>
        <span className="leading-none">
          <span className={`${display} block text-xl font-semibold`}>Kothari IT</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#f6ece8]/50">Jewellery websites</span>
        </span>
      </motion.a>

      <div className="relative z-10 max-w-[26rem]">
        <motion.p {...rise(0.1)} className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f0c2ae]">Your studio</motion.p>
        <motion.h2 {...rise(0.2)} className={`${display} mt-4 text-5xl font-medium leading-[1.05] text-[#f6ece8] xl:text-6xl`}>
          Your showroom,{' '}
          <span className="kit-shine bg-gradient-to-r from-[#f7d3c4] via-[#fff1ea] to-[#b5705a] bg-clip-text italic text-transparent">
            in your hands
          </span>
        </motion.h2>
        <motion.p {...rise(0.3)} className="mt-5 text-[#f6ece8]/60">
          Update collections, photos and offers, answer enquiries and watch who is visiting — all from one place.
        </motion.p>
      </div>

      <motion.div {...rise(0.4)} className="relative z-10 flex gap-6 text-xs text-[#f6ece8]/55">
        <span className="flex items-center gap-2"><ShieldCheckIcon className="h-4 w-4 text-[#e0a891]" /> Encrypted sign-in</span>
        <span className="flex items-center gap-2"><SparklesIcon className="h-4 w-4 text-[#e0a891]" /> Changes go live instantly</span>
      </motion.div>

      {/* floating work, on the right of the panel */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[-34%] w-[58%]">
        <motion.div style={back} className="absolute right-[4%] top-[8%] w-[80%] opacity-50">
          {card('/kit/templates/midnight.jpg', 0.2, '')}
        </motion.div>
        <motion.div style={mid} className="absolute right-[22%] top-[36%] w-[80%]">
          {card('/kit/templates/rani.jpg', 0.35, '[&_.kit-float]:[animation-delay:-2s]')}
        </motion.div>
        <motion.div style={front} className="absolute right-[6%] top-[66%] w-[72%]">
          {card('/kit/templates/celeste.jpg', 0.5, '[&_.kit-float]:[animation-delay:-4s]')}
        </motion.div>
      </div>
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
  // On a client's own domain the card names their store; on the platform's, the platform.
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

  const field =
  'peer w-full rounded-xl border border-white/12 bg-white/[0.06] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-white/30 focus:border-[#e0a891] focus:bg-white/[0.09] focus:shadow-[0_0_0_4px_rgb(224_168_145/0.15)]';

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#0f1629] font-['Inter',system-ui,sans-serif]">
      <div aria-hidden className="kit-aurora pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#f0c2ae_1px,transparent_1px)] [background-size:28px_28px]" />


      <Showcase />

      <div className="relative z-10 flex w-full items-center justify-center px-5 py-12 lg:w-[520px] lg:shrink-0 lg:px-12">
        <motion.div
          key={shake}
          initial={shake ? { transform: 'translateX(0px)' } : { opacity: 0, transform: 'translateY(30px) scale(0.98)' }}
          animate={
          shake ?
          { transform: ['translateX(0px)', 'translateX(-10px)', 'translateX(8px)', 'translateX(-5px)', 'translateX(0px)'] } :
          { opacity: 1, transform: 'translateY(0px) scale(1)' }
          }
          transition={{ duration: shake ? 0.45 : 0.9, ease: EASE, delay: shake ? 0 : 0.15 }}
          className="kit-glass w-full max-w-sm rounded-3xl !bg-[#0f1629]/70 p-8 sm:p-10">

          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f0c2ae] to-[#b07560] text-[#0f1629] shadow-lg shadow-[#b07560]/30">
              <LockIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0c2ae]/80">{siteName}</span>
          </div>

          <h1 className={`${display} mt-7 text-4xl font-medium text-white`}>Welcome back</h1>
          <p className="mt-2 text-sm text-white/55">
            {connected ?
            'Sign in to manage your website.' :
            demoAvailable ?
            'Offline demo mode — changes are saved in this browser only.' :
            'No API is configured, so there is nothing to sign in to.'}
          </p>

          {!connected && !demoAvailable ?
          <p className="mt-6 rounded-xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/60">
              Set <code className="font-semibold text-white/80">VITE_API_URL</code> in your <code className="font-semibold text-white/80">.env</code> and
              rebuild to connect the editor to your server. See <code className="font-semibold text-white/80">.env.example</code>.
            </p> :

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {connected &&
            <div>
                  <label htmlFor="admin-email" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    Email
                  </label>
                  <div className="relative mt-2">
                    <input
                  id="admin-email"
                  type="email"
                  value={email}
                  autoComplete="username"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@yourstore.com"
                  className={field} />

                    <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35 transition-colors peer-focus:text-[#f0c2ae]" />
                  </div>
                </div>
            }

              <div>
                <label htmlFor="admin-password" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
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
                  placeholder="••••••••"
                  aria-invalid={Boolean(error)}
                  className={`${field} pr-12 ${error ? 'border-red-400/70' : ''}`} />

                  <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35 transition-colors peer-focus:text-[#f0c2ae]" />
                  {/* Not inside a label: the toggle sits in the field, and a button inside a
                      label would also fire the label's focus behaviour. */}
                  <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  // tabIndex -1 keeps Tab going straight from the field to Sign in.
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/40 transition-colors hover:text-white">

                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error &&
            <motion.p
              role="alert"
              initial={{ opacity: 0, transform: 'translateY(-4px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-200">

                  {error}
                </motion.p>
            }

              <button
              type="submit"
              disabled={busy}
              className="kit-cta group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#f0c2ae] via-[#e0a891] to-[#b5705a] py-3.5 text-sm font-semibold text-[#0f1629] disabled:opacity-70">

                <span aria-hidden className="kit-shine pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                {busy ?
              <Loader2Icon className="relative h-4 w-4 animate-spin" /> :

              <>
                    <span className="relative">Sign in</span>
                    <ArrowRightIcon className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
              }
              </button>
            </form>
          }

          <Link to="/" className="mt-7 inline-flex items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-[#f0c2ae]">
            ← Back to the website
          </Link>
        </motion.div>
      </div>
    </div>);

}
