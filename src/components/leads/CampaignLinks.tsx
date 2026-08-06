import { useState } from 'react';
import { CheckIcon, CopyIcon, LinkIcon } from 'lucide-react';
import { TAGGABLE, taggedLink } from '../../utils/leadSource';

/**
 * Ready-tagged links to post on each platform.
 *
 * A plain link only tells us the platform when the browser sends a referrer, and
 * social apps often send none — WhatsApp forwards, Instagram bio taps and QR codes
 * all arrive looking like someone typed the address. Post these instead and every
 * click is labelled exactly, campaign and all.
 */
export function CampaignLinks() {
  const [campaign, setCampaign] = useState('');
  const [copied, setCopied] = useState('');

  const origin = typeof window === 'undefined' ? 'https://example.com' : window.location.origin;

  async function copy(key: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(key);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      /* clipboard blocked — the field is selectable, so it can be copied by hand */
    }
  }

  return (
    <details className="rounded-lg border border-slate-200 bg-white">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700">
        <LinkIcon className="h-4 w-4 text-slate-400" />
        Links to post on each platform
        <span className="ml-1 text-xs font-normal text-slate-400">
          so every click is labelled with the platform it came from
        </span>
      </summary>

      <div className="border-t border-slate-200 p-4">
        <label className="block max-w-xs">
          <span className="text-[11px] uppercase tracking-widest text-slate-500">Campaign name (optional)</span>
          <input
            type="text"
            value={campaign}
            onChange={(event) => setCampaign(event.target.value)}
            placeholder="diwali-2026"
            className="mt-1.5 h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-emerald" />

        </label>

        <ul className="mt-4 space-y-2">
          {TAGGABLE.map((platform) => {
            const url = taggedLink(origin, platform.key, campaign);
            return (
              <li key={platform.key} className="flex items-center gap-2">
                <span className={`w-24 shrink-0 rounded-full border px-2 py-1 text-center text-[11px] ${platform.tone}`}>
                  {platform.label}
                </span>
                <input
                  type="text"
                  readOnly
                  value={url}
                  onFocus={(event) => event.target.select()}
                  className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-600 outline-none" />

                <button
                  type="button"
                  onClick={() => void copy(platform.key, url)}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-slate-300 px-2.5 text-xs text-slate-600 hover:border-slate-400">

                  {copied === platform.key ?
                  <>
                      <CheckIcon className="h-3.5 w-3.5 text-emerald" />
                      Copied
                    </> :

                  <>
                      <CopyIcon className="h-3.5 w-3.5" />
                      Copy
                    </>
                  }
                </button>
              </li>);

          })}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Put the matching link in your Instagram bio, Facebook post, WhatsApp broadcast or YouTube
          description. Untagged visits are still recorded — they just show as “Direct / typed” or the
          website that referred them.
        </p>
      </div>
    </details>);

}
