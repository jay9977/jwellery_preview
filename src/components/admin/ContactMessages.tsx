import { useCallback, useEffect, useState } from 'react';
import {
  DownloadIcon,
  Loader2Icon,
  MailIcon,
  MailOpenIcon,
  PhoneIcon,
  RefreshCwIcon,
  Trash2Icon } from
'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { isConnected } from '../../utils/backend';
import {
  deleteContactMessage,
  fetchContactMessages,
  setContactMessageRead,
  type RemoteContactMessage } from
'../../utils/api';

function toCsv(rows: RemoteContactMessage[]): string {
  const cell = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [
  'name,email,phone,subject,message,received_at',
  ...rows.map((r) =>
  [r.name, r.email, r.phone, r.subject, r.message, r.createdAt].map(cell).join(',')
  )].
  join('\n');
}

export function ContactMessages() {
  const { backend } = useContent();
  const connected = isConnected(backend);
  const [rows, setRows] = useState<RemoteContactMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!connected) return;
    setStatus('loading');
    setError('');
    try {
      const data = await fetchContactMessages(backend);
      setRows(data.messages);
      setUnread(data.unread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages.');
    } finally {
      setStatus('idle');
    }
  }, [backend, connected]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleRead(row: RemoteContactMessage) {
    setBusyId(row.id);
    try {
      await setContactMessageRead(backend, row.id, !row.read);
      setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, read: !row.read } : r));
      setUnread((n) => Math.max(0, n + (row.read ? 1 : -1)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the message.');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: RemoteContactMessage) {
    setBusyId(row.id);
    try {
      await deleteContactMessage(backend, row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      if (!row.read) setUnread((n) => Math.max(0, n - 1));
      setConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the message.');
    } finally {
      setBusyId(null);
    }
  }

  function download() {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contact-messages-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald">Inbox</p>
        <h2 className="mt-1 text-2xl font-medium text-slate-900">Contact messages</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enquiries sent through the Contact Us form on the landing page.
        </p>
      </header>

      {!connected ?
      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Connect your API in <span className="font-medium text-slate-700">Backend connection</span> to read
          messages. Without a server the contact form tells visitors to call or email instead, so nothing is lost.
        </p> :

      <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Messages <span className="text-slate-300">({rows.length})</span>
              {unread > 0 &&
            <span className="ml-2 rounded-full bg-emerald px-2 py-0.5 text-[10px] font-semibold text-white">
                  {unread} new
                </span>
            }
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
        <p className="px-4 py-8 text-center text-sm text-slate-400">No messages yet.</p> :

        <ul className="divide-y divide-slate-100">
              {rows.map((row) =>
          <li key={row.id} className={`px-4 py-4 ${row.read ? '' : 'bg-emerald/[0.03]'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {!row.read &&
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" aria-label="Unread" />
                  }
                        <p className="text-sm font-medium text-slate-900">{row.name}</p>
                        <a
                    href={`mailto:${row.email}`}
                    className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-800">

                          {row.email}
                        </a>
                        {row.phone &&
                  <a
                    href={`tel:${row.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">

                            <PhoneIcon className="h-3 w-3" />
                            {row.phone}
                          </a>
                  }
                      </div>
                      {row.subject &&
                <p className="mt-1 text-xs font-medium text-slate-600">{row.subject}</p>
                }
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {row.message}
                      </p>
                      <time dateTime={row.createdAt} className="mt-2 block text-xs text-slate-400">
                        {new Date(row.createdAt).toLocaleString()}
                      </time>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                  type="button"
                  onClick={() => void toggleRead(row)}
                  disabled={busyId === row.id}
                  title={row.read ? 'Mark as unread' : 'Mark as read'}
                  aria-label={row.read ? `Mark ${row.name}'s message as unread` : `Mark ${row.name}'s message as read`}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40">

                        {row.read ?
                  <MailOpenIcon className="h-3.5 w-3.5" /> :

                  <MailIcon className="h-3.5 w-3.5" />
                  }
                      </button>
                      {confirmId === row.id ?
                <button
                  type="button"
                  onClick={() => void remove(row)}
                  disabled={busyId === row.id}
                  className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">

                          Confirm
                        </button> :

                <button
                  type="button"
                  onClick={() => setConfirmId(row.id)}
                  aria-label={`Delete ${row.name}'s message`}
                  className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">

                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                }
                    </div>
                  </div>
                </li>
          )}
            </ul>
        }
        </section>
      }
    </div>);

}
