import { useCallback, useEffect, useState } from 'react';
import { DownloadIcon, Loader2Icon, MailIcon, RefreshCwIcon } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { isConnected } from '../../utils/backend';
import { fetchSubscribers, type RemoteSubscriber } from '../../utils/api';

function toCsv(rows: RemoteSubscriber[]): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return ['email,signed_up_at', ...rows.map((r) => `${escape(r.email)},${escape(r.createdAt)}`)].join('\n');
}

export function Subscribers() {
  const { backend } = useContent();
  const connected = isConnected(backend);
  const [rows, setRows] = useState<RemoteSubscriber[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!connected) return;
    setStatus('loading');
    setError('');
    try {
      setRows(await fetchSubscribers(backend));
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load subscribers.');
      setStatus('error');
    }
  }, [backend, connected]);

  useEffect(() => {
    void load();
  }, [load]);

  function download() {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald">Audience</p>
        <h2 className="mt-1 text-2xl font-medium text-slate-900">Newsletter subscribers</h2>
        <p className="mt-1 text-sm text-slate-500">
          Everyone who signed up through the newsletter section on the landing page.
        </p>
      </header>

      {!connected ?
      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Connect your API in <span className="font-medium text-slate-700">Backend connection</span> to see signups.
          Without a server the newsletter form is disabled, so nothing is being collected.
        </p> :

      <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Subscribers <span className="text-slate-300">({rows.length})</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
              type="button"
              onClick={() => void load()}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400 disabled:opacity-50">

                {status === 'loading' ?
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> :

              <RefreshCwIcon className="h-3.5 w-3.5" />
              }
                Refresh
              </button>
              <button
              type="button"
              onClick={download}
              disabled={rows.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400 disabled:opacity-50">

                <DownloadIcon className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {error &&
        <p role="alert" className="border-b border-slate-200 bg-red-50 px-4 py-2 text-xs text-red-700">
              {error}
            </p>
        }

          {rows.length === 0 && status !== 'loading' ?
        <p className="px-4 py-8 text-center text-sm text-slate-400">No signups yet.</p> :

        <ul className="divide-y divide-slate-100">
              {rows.map((row) =>
          <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                  <MailIcon className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{row.email}</span>
                  <time dateTime={row.createdAt} className="shrink-0 text-xs text-slate-400">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </time>
                </li>
          )}
            </ul>
        }
        </section>
      }
    </div>);

}
