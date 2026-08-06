/**
 * Visitor capture for the leads panel.
 *
 * Everyone who reaches the site becomes a lead row, keyed by a random id kept in
 * a first-party cookie — our own cookie, no third-party tracker, nothing shared
 * with anyone. The row starts anonymous ("visitor") and fills itself in the
 * moment the person hands over details in the enquiry or newsletter form.
 */
import { ENV_API_URL, loadBackendConfig } from './backend';

const COOKIE = 'girija_vid';
const SESSION_FLAG = 'girija.session';
const COOKIE_DAYS = 365;

export type LeadEvent =
  | 'arrived'
  | 'enquiry'
  | 'quick-view'
  | 'search'
  | 'newsletter'
  | 'contact';

export interface LeadIdentity {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
}

function readCookie(name: string): string {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

function writeCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  // SameSite=Lax so it survives a normal click-through from Google or Instagram.
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/** The id the server keys this visitor on. Created once, then reused for a year. */
export function visitorId(): string {
  try {
    const existing = readCookie(COOKIE);
    if (/^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;

    const fresh =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ?
      crypto.randomUUID().replace(/-/g, '') :
      `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
    writeCookie(COOKIE, fresh, COOKIE_DAYS);
    return fresh;
  } catch {
    return ''; // cookies blocked — tracking simply does not happen
  }
}

/** First page of a new browsing session? Used to count visits, not page views. */
function isNewVisit(): boolean {
  try {
    if (window.sessionStorage.getItem(SESSION_FLAG)) return false;
    window.sessionStorage.setItem(SESSION_FLAG, '1');
    return true;
  } catch {
    return false;
  }
}

function deviceKind(): string {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/** Where the API lives — the admin's saved base URL, else the build-time one. */
function apiBase(): string {
  try {
    const config = loadBackendConfig();
    if (config.enabled && config.baseUrl.trim()) return config.baseUrl.trim().replace(/\/$/, '');
  } catch {
    /* fall through to the build-time value */
  }
  return ENV_API_URL;
}

/**
 * Report an event. Fire-and-forget: a visitor's page must never wait on it, and a
 * failure here must never surface to them.
 */
export function trackLead(event: LeadEvent, detail = '', identity: LeadIdentity = {}) {
  const base = apiBase();
  const id = visitorId();
  if (!base || !id) return;

  const params = new URLSearchParams(window.location.search);
  const payload = {
    visitorId: id,
    page: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    referrer: document.referrer || '',
    utmSource: params.get('utm_source') ?? '',
    utmMedium: params.get('utm_medium') ?? '',
    utmCampaign: params.get('utm_campaign') ?? '',
    device: deviceKind(),
    newVisit: event === 'arrived' ? isNewVisit() : false,
    event,
    detail,
    ...identity
  };

  try {
    const body = JSON.stringify(payload);
    // Deliberately not sendBeacon: it always sends in credentials mode, which needs
    // Access-Control-Allow-Credentials on a cross-origin API and is silently blocked
    // without it. `keepalive` gives the same survives-the-page-closing behaviour.
    void fetch(`${base}/leads/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => {
      /* the visitor never needs to know tracking failed */
    });
  } catch {
    /* tracking is never allowed to break the page */
  }
}
