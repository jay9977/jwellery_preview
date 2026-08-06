import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  DownloadIcon,
  Loader2Icon,
  MailIcon,
  PhoneIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon } from
'lucide-react';
import { useContent } from '../../hooks/useContent';
import { deleteLead, fetchLeads, updateLead, type Lead, type LeadStatus } from '../../utils/api';
import { detectPlatform } from '../../utils/leadSource';
import { CampaignLinks } from './CampaignLinks';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost'];

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-sky-50 text-sky-700 border-sky-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  qualified: 'bg-violet-50 text-violet-700 border-violet-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-slate-100 text-slate-500 border-slate-200'
};

function when(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return date.toLocaleDateString();
}

/** Where the visit came from, in words rather than a raw URL. */
function sourceLabel(lead: Lead): string {
  return detectPlatform(lead).label;
}

function toCsv(leads: Lead[]): string {
  const head = [
    'Name', 'Email', 'Phone', 'Status', 'Interest', 'Came from', 'Campaign', 'Referrer',
    'Device', 'Visits', 'Page views', 'First seen', 'Last seen', 'Notes'
  ];
  const cell = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = leads.map((lead) =>
  [
    lead.name, lead.email, lead.phone, lead.status, lead.interest, detectPlatform(lead).label,
    lead.utmCampaign, lead.source, lead.device, lead.visits, lead.pageViews,
    new Date(lead.firstSeenAt).toLocaleString(), new Date(lead.lastSeenAt).toLocaleString(), lead.notes
  ].map(cell).join(',')
  );
  return [head.map(cell).join(','), ...rows].join('\n');
}

export function LeadsTable() {
  const { backend } = useContent();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [onlyIdentified, setOnlyIdentified] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await fetchLeads(backend);
      setLeads(result.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load leads.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backend.baseUrl, backend.apiKey]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (platformFilter !== 'all' && detectPlatform(lead).key !== platformFilter) return false;
      if (onlyIdentified && !lead.email && !lead.phone) return false;
      if (!needle) return true;
      return `${lead.name} ${lead.email} ${lead.phone} ${lead.interest} ${sourceLabel(lead)}`.
      toLowerCase().
      includes(needle);
    });
  }, [leads, query, statusFilter, platformFilter, onlyIdentified]);

  /** How many leads each platform brought, biggest first. */
  const byPlatform = useMemo(() => {
    const counts = new Map<string, {key: string;label: string;tone: string;total: number;contactable: number;}>();
    for (const lead of leads) {
      const platform = detectPlatform(lead);
      const row = counts.get(platform.key) ?? { ...platform, total: 0, contactable: 0 };
      row.total += 1;
      if (lead.email || lead.phone) row.contactable += 1;
      counts.set(platform.key, row);
    }
    return [...counts.values()].sort((a, b) => b.total - a.total);
  }, [leads]);

  const stats = useMemo(
    () => ({
      total: leads.length,
      identified: leads.filter((l) => l.email || l.phone).length,
      today: leads.filter((l) => Date.now() - new Date(l.lastSeenAt).getTime() < 864e5).length,
      won: leads.filter((l) => l.status === 'won').length
    }),
    [leads]
  );

  async function patch(lead: Lead, changes: Partial<Lead>) {
    setSavingId(lead.id);
    // Show the change straight away; put it back if the server refuses.
    const previous = leads;
    setLeads((rows) => rows.map((row) => row.id === lead.id ? { ...row, ...changes } : row));
    try {
      await updateLead(backend, lead.id, changes as never);
    } catch (err) {
      setLeads(previous);
      setError(err instanceof Error ? err.message : 'Could not save that change.');
    } finally {
      setSavingId(null);
    }
  }

  async function remove(lead: Lead) {
    if (!window.confirm(`Delete this lead${lead.email ? ` (${lead.email})` : ''}? This cannot be undone.`)) return;
    const previous = leads;
    setLeads((rows) => rows.filter((row) => row.id !== lead.id));
    try {
      await deleteLead(backend, lead.id);
    } catch (err) {
      setLeads(previous);
      setError(err instanceof Error ? err.message : 'Could not delete that lead.');
    }
  }

  function exportCsv() {
    const blob = new Blob([toCsv(visible)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
        { label: 'Total leads', value: stats.total },
        { label: 'With contact details', value: stats.identified },
        { label: 'Active in last 24h', value: stats.today },
        { label: 'Won', value: stats.won }].
        map((stat) =>
        <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-2xl font-medium text-slate-900">{stat.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">{stat.label}</p>
          </div>
        )}
      </div>

      {byPlatform.length > 0 &&
      <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-[11px] uppercase tracking-widest text-slate-500">Where they came from</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {byPlatform.map((platform) =>
          <li key={platform.key}>
                <button
              type="button"
              onClick={() => setPlatformFilter(platformFilter === platform.key ? 'all' : platform.key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-shadow ${platform.tone} ${
              platformFilter === platform.key ? 'ring-2 ring-emerald/40' : 'hover:shadow-sm'}`
              }>

                  <span className="font-medium">{platform.label}</span>
                  <span className="tabular-nums">{platform.total}</span>
                  <span className="opacity-60">· {platform.contactable} contactable</span>
                </button>
              </li>
          )}
          </ul>
        </div>
      }

      <CampaignLinks />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, phone or interest"
            aria-label="Search leads"
            className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-emerald" />

        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | LeadStatus)}
          aria-label="Filter by status"
          className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-emerald">

          <option value="all">All statuses</option>
          {STATUSES.map((status) =>
          <option key={status} value={status}>
              {status[0].toUpperCase() + status.slice(1)}
            </option>
          )}
        </select>

        <select
          value={platformFilter}
          onChange={(event) => setPlatformFilter(event.target.value)}
          aria-label="Filter by platform"
          className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-emerald">

          <option value="all">All platforms</option>
          {byPlatform.map((platform) =>
          <option key={platform.key} value={platform.key}>
              {platform.label} ({platform.total})
            </option>
          )}
        </select>

        <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyIdentified}
            onChange={(event) => setOnlyIdentified(event.target.checked)} />

          Contactable only
        </label>

        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex h-10 items-center gap-1.5 rounded-md border border-slate-300 px-3 text-sm text-slate-600 hover:border-slate-400">

          <RefreshCwIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>

        <button
          type="button"
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-emerald px-3 text-sm font-medium text-white hover:bg-emerald-deep disabled:opacity-50">

          <DownloadIcon className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {error &&
      <p role="alert" className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      }

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ?
        <p className="flex items-center justify-center gap-2 p-10 text-sm text-slate-400">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Loading leads…
          </p> :
        visible.length === 0 ?
        <p className="p-10 text-center text-sm text-slate-400">
            {leads.length === 0 ?
          'No leads yet. Every visitor to the site will appear here automatically.' :
          'No leads match those filters.'}
          </p> :

        <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Visitor</th>
                  <th className="px-4 py-3 font-medium">Interested in</th>
                  <th className="px-4 py-3 font-medium">Came from</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((lead) =>
              // The row and its expanded detail are siblings, so the key lives here.
              <Fragment key={lead.id}>
                    <tr className="align-top hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <button
                      type="button"
                      onClick={() => setOpenId(openId === lead.id ? null : lead.id)}
                      className="text-left">

                          <span className="font-medium text-slate-900">
                            {lead.name || (lead.email ? lead.email.split('@')[0] : 'Anonymous visitor')}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {lead.email || lead.phone || `Visitor ${lead.visitorId.slice(0, 8)}`}
                          </span>
                        </button>
                        <div className="mt-1.5 flex gap-2">
                          {lead.email &&
                      <a
                        href={`mailto:${lead.email}`}
                        title={`Email ${lead.email}`}
                        className="text-slate-400 hover:text-emerald">

                              <MailIcon className="h-3.5 w-3.5" />
                            </a>
                      }
                          {lead.phone &&
                      <a
                        href={`tel:${lead.phone.replace(/\s/g, '')}`}
                        title={`Call ${lead.phone}`}
                        className="text-slate-400 hover:text-emerald">

                              <PhoneIcon className="h-3.5 w-3.5" />
                            </a>
                      }
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{lead.interest || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] ${
                      detectPlatform(lead).tone}`
                      }>

                          {detectPlatform(lead).label}
                        </span>
                        <span className="mt-1 block text-xs capitalize text-slate-400">
                          {lead.utmCampaign ? `${lead.utmCampaign} · ` : ''}
                          {lead.device || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {lead.visits} visit{lead.visits === 1 ? '' : 's'} · {lead.pageViews} views
                        <span className="mt-0.5 block text-xs text-slate-400">{when(lead.lastSeenAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                      value={lead.status}
                      onChange={(event) => void patch(lead, { status: event.target.value as LeadStatus })}
                      disabled={savingId === lead.id}
                      aria-label={`Status for ${lead.name || lead.visitorId}`}
                      className={`rounded-full border px-2.5 py-1 text-xs capitalize outline-none ${STATUS_STYLE[lead.status]}`}>

                          {STATUSES.map((status) =>
                      <option key={status} value={status}>
                              {status}
                            </option>
                      )}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                      type="button"
                      onClick={() => void remove(lead)}
                      aria-label="Delete lead"
                      className="text-slate-300 hover:text-red-600">

                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>

                    {openId === lead.id &&
                <tr className="bg-slate-50/80">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid gap-5 lg:grid-cols-2">
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-slate-500">What they did</p>
                              <ol className="mt-2 space-y-1.5 text-xs text-slate-600">
                                {(lead.activity ?? []).length === 0 ?
                          <li className="text-slate-400">Only the first visit so far.</li> :
                          (lead.activity ?? []).map((entry, i) =>
                          <li key={`${entry.at}-${i}`} className="flex gap-2">
                                      <span className="text-slate-400">{when(entry.at)}</span>
                                      <span className="font-medium text-slate-700">{entry.type}</span>
                                      <span>{entry.detail}</span>
                                    </li>
                          )
                          }
                              </ol>
                              <p className="mt-3 text-xs text-slate-400">
                                First seen {new Date(lead.firstSeenAt).toLocaleString()} · landed on{' '}
                                {lead.landingPage || '/'}
                              </p>
                            </div>
                            <div>
                              <label className="text-[11px] uppercase tracking-widest text-slate-500">
                                Notes
                                <textarea
                            defaultValue={lead.notes}
                            onBlur={(event) => {
                              if (event.target.value !== lead.notes) {
                                void patch(lead, { notes: event.target.value });
                              }
                            }}
                            rows={4}
                            placeholder="Called on Monday, wants a 22K bangle in size 2.6…"
                            className="mt-2 w-full rounded-md border border-slate-300 p-2.5 text-sm normal-case tracking-normal text-slate-800 outline-none focus:border-emerald" />

                              </label>
                            </div>
                          </div>
                        </td>
                      </tr>
                }
                  </Fragment>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>

      <p className="text-xs text-slate-400">
        Every visitor is recorded against a first-party cookie the site sets itself — no third-party
        tracker is involved. A row becomes contactable as soon as the visitor sends an enquiry or
        signs up to the newsletter.
      </p>
    </div>);

}
