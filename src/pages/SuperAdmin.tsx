import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CrownIcon,
  EyeIcon,
  GlobeIcon,
  Loader2Icon,
  LogOutIcon,
  PauseCircleIcon,
  PencilIcon,
  PlayCircleIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
  StoreIcon,
  XIcon,
  type LucideIcon } from
'lucide-react';
import { useContent } from '../hooks/useContent';
import { isConnected, setCurrentSite } from '../utils/backend';
import {
  checkTenantDns,
  createTenant,
  deleteTenant,
  fetchAccount,
  fetchTenants,
  refreshTenantPhotos,
  rewriteTenantCopy,
  renewTenant,
  updateTenant,
  type DnsStatus,
  type NewTenant,
  type Tenant,
  type TenantPlan } from
'../utils/api';
import { FONT_PAIRS, PALETTES } from '../data/palettes';
import { TemplatePicker } from '../components/admin/TemplatePicker';
import { TEMPLATES } from '../data/templates';
import type { TemplateId } from '../types/content';

const PLANS: {id: TenantPlan;label: string;short: string;months: number;}[] = [
{ id: '1m', label: '1 month', short: '1M', months: 1 },
{ id: '6m', label: '6 months', short: '6M', months: 6 },
{ id: '12m', label: '1 year', short: '1Y', months: 12 }];


const DAY = 86_400_000;
const daysLeft = (t: Tenant) => Math.ceil((new Date(t.expiresAt).getTime() - Date.now()) / DAY);

/** The console keeps its own colours: a client's theme must never restyle the platform. */
function statusOf(t: Tenant): {label: string;tone: string;dot: string;bar: string;} {
  if (t.status === 'suspended') {
    return { label: 'Suspended', tone: 'bg-stone-100 text-stone-600 ring-stone-300', dot: 'bg-stone-400', bar: 'bg-stone-300' };
  }
  const left = daysLeft(t);
  if (left <= 0) return { label: 'Expired', tone: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500', bar: 'bg-red-400' };
  if (left <= 7) {
    return { label: `${left}d left`, tone: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500', bar: 'bg-amber-400' };
  }
  return { label: 'Live', tone: 'bg-green-50 text-green-700 ring-green-200', dot: 'bg-green-500', bar: 'bg-gradient-to-r from-[#d8b56d] to-[#a8823a]' };
}

/** A stable colour per client, so each one is recognisable at a glance. */
function hueOf(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

const initials = (name: string) =>
name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const slugify = (name: string) =>
name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

const display = "font-['Cormorant_Garamond',Georgia,serif]";
const input =
'mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#b8913f] focus:ring-4 focus:ring-[#b8913f]/15';
const label = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500';
const btn =
'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
const btnGhost = `${btn} border border-stone-200 bg-white text-stone-700 shadow-sm hover:border-stone-300 hover:bg-stone-50`;
const btnPrimary = `${btn} bg-[#1c1712] text-[#f3e6c8] shadow-sm hover:bg-[#2e261d]`;
const btnGold = `${btn} bg-gradient-to-r from-[#d0ac63] to-[#a8823a] text-white shadow-md shadow-[#a8823a]/25 hover:brightness-110`;
const btnDark = `${btn} border border-white/15 text-[#f3e6c8] hover:bg-white/10`;
const chosen = 'border-[#b8913f] bg-[#b8913f]/10 ring-2 ring-[#b8913f]/20';

/**
 * The platform owner's panel at /super-admin: every client website, their plan and
 * expiry, custom domains, and the door into each site's editor (support mode).
 */
export function SuperAdmin() {
  const { backend, updateBackend } = useContent();
  const connected = isConnected(backend);
  const [gate, setGate] = useState<'checking' | 'in' | 'out'>('checking');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [platformDomain, setPlatformDomain] = useState('');
  const [serverIp, setServerIp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');

  // Leaving support mode: this tab is no longer working on any one client.
  useEffect(() => setCurrentSite(''), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const account = connected ? await fetchAccount(backend) : null;
      if (!cancelled) setGate(account?.role === 'superadmin' ? 'in' : 'out');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, backend.baseUrl, backend.apiKey]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTenants(backend);
      setTenants(data.tenants);
      setPlatformDomain(data.platformDomain);
      setServerIp(data.serverIp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load clients.');
    } finally {
      setLoading(false);
    }
  }, [backend]);

  useEffect(() => {
    if (gate === 'in') void load();
  }, [gate, load]);

  const replace = (t: Tenant) => setTenants((list) => list.map((x) => x.id === t.id ? t : x));

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ?
    tenants.filter((t) => [t.name, t.slug, t.domain ?? '', t.ownerName, t.phone].some((v) => v.toLowerCase().includes(q))) :
    tenants;
  }, [tenants, query]);

  const counts = useMemo(
    () => ({
      total: tenants.length,
      live: tenants.filter((t) => t.status === 'active' && daysLeft(t) > 0).length,
      soon: tenants.filter((t) => t.status === 'active' && daysLeft(t) > 0 && daysLeft(t) <= 7).length,
      off: tenants.filter((t) => t.status !== 'active' || daysLeft(t) <= 0).length
    }),
    [tenants]
  );

  if (gate === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#16120e]">
        <Loader2Icon className="h-6 w-6 animate-spin text-[#c9a45c]" />
      </div>);

  }
  if (gate === 'out') return <Navigate to="/admin-login" replace />;

  function openEditor(t: Tenant) {
    setCurrentSite(t.slug);
    // A full load, so the whole app starts over on this client's content.
    window.location.href = '/admin';
  }

  const stats: [string, number, LucideIcon, string][] = [
  ['Clients', counts.total, StoreIcon, 'All websites on the platform'],
  ['Live', counts.live, GlobeIcon, 'Serving visitors right now'],
  ['Expiring soon', counts.soon, AlertTriangleIcon, 'Plan ends within 7 days'],
  ['Offline', counts.off, PauseCircleIcon, 'Expired or suspended']];


  return (
    <div className="min-h-screen w-full bg-[#f7f4ee] font-['Inter',system-ui,sans-serif] text-stone-900">
      <header className="relative overflow-hidden bg-[#16120e] text-[#f3e6c8]">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#c9a45c]/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-[#7a5a2a]/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 pt-6 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#e2c27d] to-[#9c7633] text-[#16120e] shadow-lg shadow-black/30">
              <CrownIcon className="h-5 w-5" />
            </span>
            <div>
              <p className={`${display} text-3xl leading-none`}>Platform Console</p>
              <p className="mt-1 text-xs text-[#f3e6c8]/55">Every client website, plan and domain in one place</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void load()} className={btnDark} disabled={loading}>
              <RefreshCwIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                updateBackend({ apiKey: '' });
                setGate('out');
              }}
              className={btnDark}>

              <LogOutIcon className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 pb-8 pt-7 sm:px-6 lg:grid-cols-4">
          {stats.map(([name, value, Icon, hint]) =>
          <div key={name} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f3e6c8]/55">{name}</p>
                <Icon className="h-4 w-4 text-[#c9a45c]" />
              </div>
              <p className={`${display} mt-2 text-5xl font-medium leading-none text-white`}>{value}</p>
              <p className="mt-2 text-[11px] text-[#f3e6c8]/45">{hint}</p>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className={`${display} text-3xl font-semibold text-stone-900`}>Clients</h1>
            <p className="text-sm text-stone-500">Edit any website, renew plans and connect domains.</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <label className="relative flex-1 sm:w-80 sm:flex-none">
              <span className="sr-only">Search clients</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -transtone-y-1/2 text-stone-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, domain, owner, phone…"
                className={`${input} mt-0 pl-9`} />

            </label>
            <button type="button" onClick={() => setAdding(true)} className={`${btnGold} py-2.5`}>
              <PlusIcon className="h-4 w-4" />
              Add client
            </button>
          </div>
        </div>

        {notice &&
        <div className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
            <span className="flex items-start gap-2">
              <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              {notice}
            </span>
            <button type="button" onClick={() => setNotice('')} aria-label="Dismiss" className="text-green-700 hover:text-green-900">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        }
        {error &&
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        }

        {shown.length > 0 ?
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((t) =>
          <TenantCard
            key={t.id}
            tenant={t}
            platformDomain={platformDomain}
            onEditSite={() => openEditor(t)}
            onEditDetails={() => setEditing(t)}
            onRenew={async (plan) => {
              try {
                replace(await renewTenant(backend, t.id, plan));
                setNotice(`${t.name} renewed — the website is live again.`);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Renewal failed.');
              }
            }}
            onToggle={async () => {
              try {
                replace(await updateTenant(backend, t.id, { status: t.status === 'active' ? 'suspended' : 'active' }));
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Update failed.');
              }
            }} />

          )}
          </div> :

        <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c1712] text-[#c9a45c]">
              {loading ? <Loader2Icon className="h-6 w-6 animate-spin" /> : <StoreIcon className="h-6 w-6" />}
            </span>
            <p className={`${display} mt-4 text-2xl font-semibold`}>
              {loading ? 'Loading clients…' : tenants.length ? 'No client matches that search' : 'No clients yet'}
            </p>
            {!loading && !tenants.length &&
          <>
                <p className="mt-1 max-w-sm text-sm text-stone-500">
                  Add your first jeweller — the website, headlines and colours are generated for you.
                </p>
                <button type="button" onClick={() => setAdding(true)} className={`${btnGold} mt-5 py-2.5`}>
                  <PlusIcon className="h-4 w-4" />
                  Add client
                </button>
              </>
          }
          </div>
        }
      </main>

      {adding &&
      <AddClient
        onClose={() => setAdding(false)}
        onCreated={(t, message) => {
          setTenants((list) => [t, ...list]);
          setAdding(false);
          setNotice(message);
        }} />

      }
      {editing &&
      <EditClient
        tenant={editing}
        serverIp={serverIp}
        platformDomain={platformDomain}
        onClose={() => setEditing(null)}
        onSaved={(t) => {
          replace(t);
          setEditing(null);
          setNotice(`${t.name} saved.`);
        }}
        onDeleted={() => {
          setTenants((list) => list.filter((x) => x.id !== editing.id));
          setEditing(null);
          setNotice(`${editing.name} deleted.`);
        }} />

      }
    </div>);

}

function siteLinks(t: Tenant, platformDomain: string) {
  return [
  t.domain ? `https://${t.domain}` : '',
  platformDomain ? `https://${t.slug}.${platformDomain}` : ''].
  filter(Boolean);
}

function TenantCard({
  tenant: t,
  platformDomain,
  onEditSite,
  onEditDetails,
  onRenew,
  onToggle





}: {tenant: Tenant;platformDomain: string;onEditSite: () => void;onEditDetails: () => void;onRenew: (plan: TenantPlan) => Promise<void>;onToggle: () => Promise<void>;}) {
  const [plan, setPlan] = useState<TenantPlan>(t.plan);
  const [busy, setBusy] = useState(false);
  const status = statusOf(t);
  const left = daysLeft(t);
  const planInfo = PLANS.find((p) => p.id === t.plan);
  const pct = Math.max(0, Math.min(100, left / ((planInfo?.months ?? 12) * 30.4) * 100));
  const hue = hueOf(t.slug);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  return (
    <article className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-transtone-y-0.5 hover:shadow-xl hover:shadow-stone-900/[0.06]">
      <div className="flex items-start gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-inner"
          style={{ background: `linear-gradient(135deg, hsl(${hue} 42% 58%), hsl(${hue} 48% 32%))` }}>

          {initials(t.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`${display} truncate text-[22px] font-semibold leading-tight text-stone-900`}>{t.name}</h3>
          <p className="truncate text-xs text-stone-500">
            {t.ownerName || 'No owner set'}
            {t.phone ? ` · ${t.phone}` : ''}
          </p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${status.tone}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="mt-4 space-y-1.5 text-xs">
        {siteLinks(t, platformDomain).map((url) =>
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 truncate font-medium text-[#8a6a2c] hover:underline">

            <GlobeIcon className="h-3.5 w-3.5 shrink-0" />
            {url.replace('https://', '')}
          </a>
        )}
        <a
          href={`/?site=${t.slug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800">

          <EyeIcon className="h-3.5 w-3.5 shrink-0" />
          Preview site <span className="font-mono text-[11px] text-stone-400">?site={t.slug}</span>
        </a>
      </div>

      <div className="mt-4 rounded-xl bg-stone-50 p-3 ring-1 ring-stone-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-700">{planInfo?.label ?? t.plan} plan</span>
          <span className={left <= 7 ? 'font-semibold text-red-600' : 'text-stone-500'}>
            {left > 0 ? `${left} days left` : `Expired ${-left}d ago`}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
          <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${t.status === 'active' ? pct : 0}%` }} />
        </div>
        <p className="mt-2 truncate text-[11px] text-stone-400">
          Expires {new Date(t.expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          {t.adminEmail ? ` · login ${t.adminEmail}` : ''}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onEditSite} className={`${btnPrimary} flex-1`}>
          <PencilIcon className="h-3.5 w-3.5" />
          Edit website
        </button>
        <button type="button" onClick={onEditDetails} className={btnGhost} title="Details, login & domain">
          <Settings2Icon className="h-3.5 w-3.5" />
          Details
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(onToggle)}
          className={btnGhost}
          title={t.status === 'active' ? 'Take the website offline' : 'Put the website back online'}>

          {t.status === 'active' ? <PauseCircleIcon className="h-3.5 w-3.5" /> : <PlayCircleIcon className="h-3.5 w-3.5" />}
          {t.status === 'active' ? 'Suspend' : 'Activate'}
        </button>
      </div>

      <div className="flex-1" />
      <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">Renew</span>
        <div role="radiogroup" aria-label="Renewal plan" className="flex rounded-lg bg-stone-100 p-0.5">
          {PLANS.map((p) =>
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={plan === p.id}
            title={p.label}
            onClick={() => setPlan(p.id)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
            plan === p.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`
            }>

              {p.short}
            </button>
          )}
        </div>
        <button type="button" disabled={busy} onClick={() => void run(() => onRenew(plan))} className={`${btnGold} ml-auto`}>
          {busy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <RefreshCwIcon className="h-3.5 w-3.5" />}
          Renew
        </button>
      </div>
    </article>);

}

function Modal({ title, onClose, children }: {title: string;onClose: () => void;children: React.ReactNode;}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/50 px-4 py-10 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-[#fbfaf7] shadow-2xl ring-1 ring-black/5">

        <div className="flex items-center justify-between bg-[#16120e] px-6 py-4 text-[#f3e6c8]">
          <h2 className={`${display} text-2xl font-medium`}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-[#f3e6c8]/60 hover:bg-white/10 hover:text-white">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>);

}

function Step({ n, children }: {n: number;children: React.ReactNode;}) {
  return (
    <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1c1712] text-[11px] text-[#e2c27d]">{n}</span>
      {children}
    </legend>);

}

function AddClient({
  onClose,
  onCreated


}: {onClose: () => void;onCreated: (t: Tenant, message: string) => void;}) {
  const { backend } = useContent();
  const [form, setForm] = useState<NewTenant>({ name: '', slug: '', plan: '12m', adminEmail: '', adminPassword: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  const [paletteId, setPaletteId] = useState(() => TEMPLATES.find((t) => t.id === 'royal')?.palette ?? 'auto');
  const [fontId, setFontId] = useState(() => TEMPLATES.find((t) => t.id === 'royal')?.font ?? FONT_PAIRS[0]?.id ?? '');
  const [templateId, setTemplateId] = useState<TemplateId>('royal');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (patch: Partial<NewTenant>) => setForm((f) => ({ ...f, ...patch }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const palette =
    paletteId === 'auto' ? PALETTES[Math.floor(Math.random() * PALETTES.length)] : PALETTES.find((p) => p.id === paletteId);
    try {
      const { tenant, ai, aiError, photos, photosError } = await createTenant(backend, {
        ...form,
        theme: palette ? { paletteId: palette.id, fontId, templateId, colors: { ...palette.colors } } : undefined
      });
      const copy = ai ?
      'AI wrote fresh headlines and copy' :
      `template copy used${aiError ? ` (AI failed: ${aiError})` : ' (set ANTHROPIC_API_KEY for AI copy)'}`;
      const pics = photos ?
      `${photos} new photos added` :
      photosError ?
      `photos not fetched: ${photosError}` :
      'template photos re-arranged (set UNSPLASH_ACCESS_KEY for new photos)';
      onCreated(tenant, `${tenant.name} is ready — ${copy}; ${pics}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the client.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Add a client" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <Step n={1}>Business</Step>
          <label className="block">
            <span className={label}>Business name *</span>
            <input
              required
              value={form.name}
              onChange={(e) => set({ name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
              placeholder="Giriraj Jewellers"
              className={input} />

          </label>
          <label className="block">
            <span className={label}>Site name (slug) *</span>
            <input
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: slugify(e.target.value) });
              }}
              placeholder="giriraj"
              className={input} />

          </label>
          <label className="block">
            <span className={label}>City</span>
            <input value={form.city ?? ''} onChange={(e) => set({ city: e.target.value })} placeholder="Jaipur" className={input} />
          </label>
          <label className="block">
            <span className={label}>Style / speciality</span>
            <input
              value={form.style ?? ''}
              onChange={(e) => set({ style: e.target.value })}
              placeholder="Traditional bridal gold, polki"
              className={input} />

          </label>
          <label className="block">
            <span className={label}>Owner name</span>
            <input value={form.ownerName ?? ''} onChange={(e) => set({ ownerName: e.target.value })} className={input} />
          </label>
          <label className="block">
            <span className={label}>Phone</span>
            <input value={form.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} className={input} />
          </label>
          <label className="block">
            <span className={label}>Business email</span>
            <input type="email" value={form.email ?? ''} onChange={(e) => set({ email: e.target.value })} className={input} />
          </label>
          <label className="block">
            <span className={label}>Custom domain</span>
            <input
              value={form.domain ?? ''}
              onChange={(e) => set({ domain: e.target.value })}
              placeholder="girirajjewellers.com (optional)"
              className={input} />

          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Notes for the AI copywriter</span>
            <textarea
              rows={2}
              value={form.notes ?? ''}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="Family business since 1985, known for temple jewellery, Hindi-English tone…"
              className={input} />

          </label>
        </fieldset>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <Step n={2}>Look &amp; feel</Step>
          <div className="sm:col-span-2">
            <span className={label}>Website template</span>
            <TemplatePicker
              value={templateId}
              onChange={(id) => {
                // Each template comes with a suggested look — still changeable just below.
                const def = TEMPLATES.find((t) => t.id === id);
                setTemplateId(id);
                if (def) {
                  setPaletteId(def.palette);
                  setFontId(def.font);
                }
              }} />
          </div>
          <div className="sm:col-span-2">
            <span className={label}>Colour palette</span>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPaletteId('auto')}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${paletteId === 'auto' ? chosen : 'border-stone-200 bg-white hover:border-stone-300'}`}>

                <SparklesIcon className="mr-1 inline h-3 w-3" />
                Surprise me
              </button>
              {PALETTES.map((p) =>
              <button
                key={p.id}
                type="button"
                title={`${p.name} — ${p.description}`}
                onClick={() => setPaletteId(p.id)}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs transition ${
                paletteId === p.id ? chosen : 'border-stone-200 bg-white hover:border-stone-300'}`
                }>

                  {[p.colors.cream, p.colors.accent, p.colors.gold].map((c, i) =>
                <span key={i} className="h-3 w-3 rounded-full border border-black/10" style={{ background: c }} />
                )}
                  <span className="ml-1">{p.name}</span>
                </button>
              )}
            </div>
          </div>
          <label className="block">
            <span className={label}>Fonts</span>
            <select value={fontId} onChange={(e) => setFontId(e.target.value)} className={input}>
              {FONT_PAIRS.map((f) =>
              <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              )}
            </select>
          </label>
        </fieldset>

        <fieldset className="grid gap-3 sm:grid-cols-3">
          <Step n={3}>Plan &amp; client login</Step>
          <label className="block">
            <span className={label}>Plan *</span>
            <select value={form.plan} onChange={(e) => set({ plan: e.target.value as TenantPlan })} className={input}>
              {PLANS.map((p) =>
              <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              )}
            </select>
          </label>
          <label className="block">
            <span className={label}>Login email *</span>
            <input
              required
              type="email"
              value={form.adminEmail}
              onChange={(e) => set({ adminEmail: e.target.value })}
              autoComplete="off"
              className={input} />

          </label>
          <label className="block">
            <span className={label}>Password * (8+)</span>
            <input
              required
              minLength={8}
              value={form.adminPassword}
              onChange={(e) => set({ adminPassword: e.target.value })}
              autoComplete="new-password"
              className={input} />

          </label>
        </fieldset>

        {error &&
        <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        }
        <div className="flex items-center justify-end gap-2">
          {busy && <span className="text-xs text-stone-500">Building the website — AI copy can take up to a minute…</span>}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={`${btnGold} py-2.5`}>
            {busy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <SparklesIcon className="h-3.5 w-3.5" />}
            Create website
          </button>
        </div>
      </form>
    </Modal>);

}

function EditClient({
  tenant,
  serverIp,
  platformDomain,
  onClose,
  onSaved,
  onDeleted






}: {tenant: Tenant;serverIp: string;platformDomain: string;onClose: () => void;onSaved: (t: Tenant) => void;onDeleted: () => void;}) {
  const { backend } = useContent();
  const [form, setForm] = useState({
    name: tenant.name,
    domain: tenant.domain ?? '',
    ownerName: tenant.ownerName,
    phone: tenant.phone,
    email: tenant.email,
    notes: tenant.notes,
    adminEmail: tenant.adminEmail,
    adminPassword: '',
    expiresAt: tenant.expiresAt.slice(0, 10)
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dns, setDns] = useState<DnsStatus | null>(null);
  const [dnsBusy, setDnsBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoNote, setPhotoNote] = useState('');

  const [copyBusy, setCopyBusy] = useState(false);
  const [copyNote, setCopyNote] = useState('');
  async function newCopy() {
    setCopyBusy(true);
    setCopyNote('');
    try {
      const { ai, aiError } = await rewriteTenantCopy(backend, tenant.id);
      setCopyNote(ai ? 'New copy written by AI.' : `New copy mix applied${aiError ? ` (AI failed: ${aiError})` : ''}.`);
    } catch (err) {
      setCopyNote(err instanceof Error ? err.message : 'Could not rewrite the text.');
    } finally {
      setCopyBusy(false);
    }
  }

  async function newPhotos() {
    setPhotoBusy(true);
    setPhotoNote('');
    try {
      const count = await refreshTenantPhotos(backend, tenant.id);
      setPhotoNote(`${count} photos replaced — open the website to see them.`);
    } catch (err) {
      setPhotoNote(err instanceof Error ? err.message : 'Could not fetch photos.');
    } finally {
      setPhotoBusy(false);
    }
  }
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { adminPassword, adminEmail, expiresAt, ...rest } = form;
      onSaved(
        await updateTenant(backend, tenant.id, {
          ...rest,
          ...(adminEmail !== tenant.adminEmail ? { adminEmail } : {}),
          ...(adminPassword ? { adminPassword } : {}),
          // End of the chosen day, so "expires on the 10th" still serves on the 10th.
          ...(expiresAt !== tenant.expiresAt.slice(0, 10) ? { expiresAt: `${expiresAt}T23:59:59` } : {})
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setDnsBusy(true);
    setError('');
    try {
      setDns(await checkTenantDns(backend, tenant.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DNS check failed.');
    } finally {
      setDnsBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await deleteTenant(backend, tenant.id, confirmDelete);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.');
      setBusy(false);
    }
  }

  const fields: [keyof typeof form, string, string?][] = [
  ['name', 'Business name'],
  ['ownerName', 'Owner name'],
  ['phone', 'Phone'],
  ['email', 'Business email', 'email'],
  ['adminEmail', 'Client login email', 'email'],
  ['adminPassword', 'New login password (leave empty to keep)'],
  ['expiresAt', 'Expiry date', 'date']];


  return (
    <Modal title={`${tenant.name} — details & domain`} onClose={onClose}>
      <form onSubmit={save} className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(([key, text, type]) =>
          <label key={key} className="block">
              <span className={label}>{text}</span>
              <input
              type={type ?? 'text'}
              value={form[key]}
              onChange={(e) => set({ [key]: e.target.value })}
              autoComplete={key === 'adminPassword' ? 'new-password' : 'off'}
              className={input} />

            </label>
          )}
          <label className="block sm:col-span-2">
            <span className={label}>Notes</span>
            <textarea rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} className={input} />
          </label>
        </div>

        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="text-sm font-medium text-stone-900">Custom domain</h3>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <label className="block flex-1">
              <span className={label}>Domain</span>
              <input
                value={form.domain}
                onChange={(e) => set({ domain: e.target.value })}
                placeholder="girirajjewellers.com"
                className={input} />

            </label>
            <button type="button" onClick={() => void verify()} disabled={dnsBusy || !tenant.domain} className={btnGhost}>
              {dnsBusy && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
              Verify DNS
            </button>
          </div>
          {dns &&
          <p className={`mt-2 text-xs ${dns.connected ? 'text-green-700' : 'text-amber-700'}`}>
              {dns.connected ?
            <>
                  <CheckCircle2Icon className="mr-1 inline h-3.5 w-3.5" />
                  Connected — {dns.domain} points to this server{dns.wwwConnected ? ' (www too)' : '; www is not pointed yet'}.
                </> :

            `Pending — ${dns.domain} resolves to ${dns.root.join(', ') || 'nothing'}${dns.expected ? `, expected ${dns.expected}` : ' (set SERVER_IP on the server to compare)'}.`
            }
            </p>
          }
          <div className="mt-3 rounded-md bg-stone-50 p-3 text-xs leading-relaxed text-stone-600">
            <p className="font-medium text-stone-800">Send this to the client (DNS settings at GoDaddy / Hostinger etc.):</p>
            <table className="mt-2 w-full font-mono text-[11px]">
              <tbody>
                <tr>
                  <td className="pr-3">A</td>
                  <td className="pr-3">@</td>
                  <td>{serverIp || '<SERVER_IP>'}</td>
                </tr>
                <tr>
                  <td className="pr-3">A</td>
                  <td className="pr-3">www</td>
                  <td>{serverIp || '<SERVER_IP>'}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2">
              The secure (https) certificate is issued automatically on the first visit once DNS points here.
              {platformDomain ? ` Until then the site is live at https://${tenant.slug}.${platformDomain}.` : ''}
            </p>
          </div>
        </section>

        {error &&
        <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        }
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={`${btnPrimary} py-2.5`}>
            {busy && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
            Save changes
          </button>
        </div>

        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="text-sm font-medium text-stone-900">Text &amp; photos</h3>
          <p className="mt-1 text-xs text-stone-500">
            Rewrite every headline, product name, article and FAQ with a fresh mix for this business. Text the client
            edited is replaced too; photos and design stay.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" disabled={copyBusy} onClick={() => void newCopy()} className={btnGhost}>
              {copyBusy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <SparklesIcon className="h-3.5 w-3.5" />}
              Rewrite text
            </button>
            {copyNote && <span className="text-xs text-stone-600">{copyNote}</span>}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Replace every photo on this website with new ones that no other client uses. Photos the client uploaded are
            replaced too.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" disabled={photoBusy} onClick={() => void newPhotos()} className={btnGhost}>
              {photoBusy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <SparklesIcon className="h-3.5 w-3.5" />}
              Get new photos
            </button>
            {photoNote && <span className="text-xs text-stone-600">{photoNote}</span>}
          </div>
        </section>

        <section className="rounded-xl border border-red-200 p-4">
          <h3 className="text-sm font-medium text-red-700">Delete this client</h3>
          <p className="mt-1 text-xs text-stone-500">
            Removes the website, its logins, leads, enquiries and uploaded images for good. To pause a site instead, use
            Suspend. Type <strong>{tenant.slug}</strong> to confirm.
          </p>
          <div className="mt-2 flex gap-2">
            <input
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              aria-label="Type the site name to confirm"
              className={`${input} mt-0 max-w-xs`} />

            <button
              type="button"
              disabled={busy || confirmDelete !== tenant.slug}
              onClick={() => void remove()}
              className={`${btn} bg-red-600 text-white hover:bg-red-700`}>

              Delete forever
            </button>
          </div>
        </section>
      </form>
    </Modal>);

}
