import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { SOCIAL_PLATFORMS, socialIcon, socialPlaceholder, usableSocialLinks } from '../../data/social';
import { uid } from '../../utils/id';
import type { SocialLink, SocialPlatform } from '../../types/content';

export function SocialLinks() {
  const { content, updateFooter } = useContent();
  const links = content.footer.social;
  const live = usableSocialLinks(links);

  function setLinks(next: SocialLink[]) {
    updateFooter({ social: next });
  }

  function update(id: string, patch: Partial<SocialLink>) {
    setLinks(links.map((link) => link.id === id ? { ...link, ...patch } : link));
  }

  function add(platform: SocialPlatform) {
    const preset = SOCIAL_PLATFORMS.find((p) => p.value === platform);
    setLinks([...links, { id: uid('s'), platform, label: preset?.label ?? 'Link', url: '' }]);
  }

  function move(id: string, direction: -1 | 1) {
    const from = links.findIndex((l) => l.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= links.length) return;
    const next = [...links];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setLinks(next);
  }

  const missing = SOCIAL_PLATFORMS.filter((p) => !links.some((l) => l.platform === p.value));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald">Social</p>
        <h2 className="mt-1 text-2xl font-medium text-slate-900">Social & media links</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste the URL next to each logo. Icons appear in the footer and in the Contact Us section.
          An empty URL hides that icon without deleting it.
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Your links <span className="text-slate-300">({live.length} live of {links.length})</span>
          </h3>
        </div>

        {links.length === 0 ?
        <p className="px-4 py-8 text-center text-sm text-slate-400">
            No links yet — add one below.
          </p> :

        <ul className="divide-y divide-slate-100">
            {links.map((link, index) => {
            const Icon = socialIcon(link.platform);
            return (
              <li key={link.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                    link.url.trim() ?
                    'border-emerald/30 bg-emerald/10 text-emerald' :
                    'border-slate-200 bg-slate-50 text-slate-300'}`
                    }
                    title={link.label}>

                      <Icon className="h-4 w-4" />
                    </span>

                    <select
                    value={link.platform}
                    onChange={(e) => {
                      const platform = e.target.value as SocialPlatform;
                      const preset = SOCIAL_PLATFORMS.find((p) => p.value === platform);
                      // Follow the platform name unless a custom label was typed.
                      const usingPresetLabel = SOCIAL_PLATFORMS.some((p) => p.label === link.label);
                      update(link.id, {
                        platform,
                        ...(usingPresetLabel && preset ? { label: preset.label } : {})
                      });
                    }}
                    aria-label="Platform"
                    className="w-36 shrink-0 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15">

                      {SOCIAL_PLATFORMS.map((p) =>
                    <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                    )}
                    </select>

                    <input
                    type="url"
                    value={link.url}
                    onChange={(e) => update(link.id, { url: e.target.value })}
                    placeholder={socialPlaceholder(link.platform)}
                    aria-label={`${link.label} URL`}
                    className="min-w-[14rem] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald focus:ring-2 focus:ring-emerald/15" />

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                      type="button"
                      onClick={() => move(link.id, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${link.label} up`}
                      className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25">
                        ↑
                      </button>
                      <button
                      type="button"
                      onClick={() => move(link.id, 1)}
                      disabled={index === links.length - 1}
                      aria-label={`Move ${link.label} down`}
                      className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25">
                        ↓
                      </button>
                      <button
                      type="button"
                      onClick={() => setLinks(links.filter((l) => l.id !== link.id))}
                      aria-label={`Delete ${link.label}`}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">

                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                  type="text"
                  value={link.label}
                  onChange={(e) => update(link.id, { label: e.target.value })}
                  aria-label={`${link.label} tooltip text`}
                  placeholder="Tooltip / screen-reader label"
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none placeholder:text-slate-400 focus:border-emerald" />

                </li>);

          })}
          </ul>
        }

        {missing.length > 0 &&
        <div className="border-t border-slate-200 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Add a network</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {missing.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => add(p.value)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-emerald hover:text-emerald">

                    <Icon className="h-3.5 w-3.5" />
                    {p.label}
                  </button>);

            })}
            </div>
          </div>
        }

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={() => add('website')}
            className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-emerald hover:text-emerald">

            <PlusIcon className="h-3.5 w-3.5" />
            Add a custom link
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          How it will look
        </h3>
        {live.length === 0 ?
        <p className="mt-3 text-sm text-slate-400">
            Nothing to show yet — add a URL to one of the links above.
          </p> :

        <div className="mt-3 flex flex-wrap gap-2 rounded-md bg-slate-900 p-4">
            {live.map((link) => {
            const Icon = socialIcon(link.platform);
            return (
              <span
                key={link.id}
                title={link.label}
                className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70">

                  <Icon className="h-4 w-4" />
                </span>);

          })}
          </div>
        }
      </section>
    </div>);

}
