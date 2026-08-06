/**
 * Works out which platform a visitor arrived from.
 *
 * Two signals, in order of trust:
 *  1. `utm_source` on the link — exact, because you chose it when you posted the link.
 *  2. The browser's referrer — good for web clicks, but social apps mangle it
 *     (Instagram sends `l.instagram.com`, Facebook `lm.facebook.com`, X `t.co`)
 *     and apps like WhatsApp usually send nothing at all.
 *
 * Which is why the panel offers ready-tagged links: tag them and the platform is
 * never a guess.
 */

export interface Platform {
  key: string;
  label: string;
  /** Tailwind classes for the pill in the table. */
  tone: string;
}

const PLATFORMS: Record<string, Platform> = {
  instagram: { key: 'instagram', label: 'Instagram', tone: 'bg-pink-50 text-pink-700 border-pink-200' },
  facebook: { key: 'facebook', label: 'Facebook', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  whatsapp: { key: 'whatsapp', label: 'WhatsApp', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  youtube: { key: 'youtube', label: 'YouTube', tone: 'bg-red-50 text-red-700 border-red-200' },
  google: { key: 'google', label: 'Google', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  twitter: { key: 'twitter', label: 'X / Twitter', tone: 'bg-slate-100 text-slate-700 border-slate-300' },
  linkedin: { key: 'linkedin', label: 'LinkedIn', tone: 'bg-sky-50 text-sky-700 border-sky-200' },
  pinterest: { key: 'pinterest', label: 'Pinterest', tone: 'bg-rose-50 text-rose-700 border-rose-200' },
  telegram: { key: 'telegram', label: 'Telegram', tone: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  snapchat: { key: 'snapchat', label: 'Snapchat', tone: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  tiktok: { key: 'tiktok', label: 'TikTok', tone: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  email: { key: 'email', label: 'Email', tone: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  referral: { key: 'referral', label: 'Another website', tone: 'bg-slate-100 text-slate-600 border-slate-300' },
  direct: { key: 'direct', label: 'Direct / typed', tone: 'bg-slate-100 text-slate-500 border-slate-200' }
};

/** Platforms worth offering a ready-made tagged link for. */
export const TAGGABLE = [
  PLATFORMS.instagram,
  PLATFORMS.facebook,
  PLATFORMS.whatsapp,
  PLATFORMS.youtube,
  PLATFORMS.google,
  PLATFORMS.twitter,
  PLATFORMS.linkedin,
  PLATFORMS.pinterest
];

/** Hostname fragments social apps actually send, mapped to the platform. */
const HOST_PATTERNS: [RegExp, string][] = [
  [/instagram|ig\.me/i, 'instagram'],
  [/facebook|fb\.com|fb\.me|messenger/i, 'facebook'],
  [/whatsapp|wa\.me/i, 'whatsapp'],
  [/youtube|youtu\.be/i, 'youtube'],
  [/google|googleadservices|gstatic/i, 'google'],
  [/twitter|^t\.co$|x\.com/i, 'twitter'],
  [/linkedin|lnkd\.in/i, 'linkedin'],
  [/pinterest|pin\.it/i, 'pinterest'],
  [/telegram|t\.me/i, 'telegram'],
  [/snapchat/i, 'snapchat'],
  [/tiktok/i, 'tiktok'],
  [/mail\.|outlook|gmail|yahoo|proton/i, 'email']
];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

export function detectPlatform(lead: {source?: string;utmSource?: string;}): Platform {
  const tagged = (lead.utmSource ?? '').trim().toLowerCase();
  if (tagged) {
    for (const [pattern, key] of HOST_PATTERNS) {
      if (pattern.test(tagged)) return PLATFORMS[key];
    }
    // A tag we do not recognise is still exact — show it as given.
    return { key: tagged, label: tagged.replace(/^\w/, (c) => c.toUpperCase()), tone: PLATFORMS.referral.tone };
  }

  const source = (lead.source ?? '').trim();
  if (!source) return PLATFORMS.direct;

  const host = hostOf(source);
  for (const [pattern, key] of HOST_PATTERNS) {
    if (pattern.test(host)) return PLATFORMS[key];
  }
  // Our own domain referring itself is not a new arrival.
  if (typeof window !== 'undefined' && host === window.location.hostname) return PLATFORMS.direct;
  return { ...PLATFORMS.referral, label: host || PLATFORMS.referral.label };
}

/** The link to post on a platform so its clicks are labelled exactly. */
export function taggedLink(origin: string, platformKey: string, campaign = ''): string {
  const url = new URL(origin);
  url.searchParams.set('utm_source', platformKey);
  url.searchParams.set('utm_medium', 'social');
  if (campaign.trim()) url.searchParams.set('utm_campaign', campaign.trim().toLowerCase().replace(/\s+/g, '-'));
  return url.toString();
}
