import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CloudIcon,
  DownloadIcon,
  HistoryIcon,
  Loader2Icon,
  RefreshCwIcon,
  RotateCcwIcon,
  SaveIcon,
  Trash2Icon,
  UploadIcon } from
'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { deleteSnapshot, listSnapshots, saveSnapshot, type Snapshot } from '../../utils/snapshots';
import { exportContent, importContent } from '../../utils/contentIO';
import { isConnected } from '../../utils/backend';
import { fetchVersion, fetchVersions, type RemoteVersion } from '../../utils/api';

export function VersionHistory() {
  const { content, backend, replaceContent } = useContent();
  const connected = isConnected(backend);
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => listSnapshots());
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  /* ---- server-side history (auto-saved on every publish) ---- */
  const [remote, setRemote] = useState<RemoteVersion[]>([]);
  const [remoteStatus, setRemoteStatus] = useState<'idle' | 'loading'>('idle');
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const loadRemote = useCallback(async () => {
    if (!connected) return;
    setRemoteStatus('loading');
    try {
      setRemote(await fetchVersions(backend));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load server versions.');
    } finally {
      setRemoteStatus('idle');
    }
  }, [backend, connected]);

  useEffect(() => {
    void loadRemote();
  }, [loadRemote]);

  async function restoreRemote(version: RemoteVersion) {
    setRestoringId(version.id);
    try {
      const detail = await fetchVersion(backend, version.id);
      replaceContent(detail.content);
      setMessage(`Restored the server snapshot from ${new Date(version.createdAt).toLocaleString()}.`);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not restore that version.');
    } finally {
      setRestoringId(null);
    }
  }

  function handleSave() {
    setSnapshots(saveSnapshot(name, content));
    setName('');
    setMessage('Version saved.');
    setError('');
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      replaceContent(await importContent(file));
      setMessage('Content imported.');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald">Safety net</p>
        <h2 className="mt-1 text-2xl font-medium text-slate-900">Versions & backups</h2>
        <p className="mt-1 text-sm text-slate-500">
          Save a version before a big change, then restore it in one click. This browser keeps your last 12
          named versions{connected ? '; the server also snapshots the last 20 publishes automatically' : ''}.
        </p>
      </header>

      {(message || error) &&
      <p
        role="status"
        className={`rounded-md px-3 py-2 text-xs ${
        error ? 'bg-red-50 text-red-700' : 'bg-emerald/10 text-emerald'}`
        }>
        
          {error || message}
        </p>
      }

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Save current version
        </h3>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Diwali campaign"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/15" />
          
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald px-4 py-2 text-xs font-medium text-white hover:bg-emerald-deep">
            
            <SaveIcon className="h-3.5 w-3.5" />
            Save version
          </button>
        </div>
      </section>

      {connected &&
      <section className="rounded-lg border border-slate-200 bg-white">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <CloudIcon className="h-4 w-4 text-emerald" />
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Server snapshots <span className="text-slate-300">({remote.length})</span>
              </h3>
            </div>
            <button
            type="button"
            onClick={() => void loadRemote()}
            disabled={remoteStatus === 'loading'}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 disabled:opacity-50">

              {remoteStatus === 'loading' ?
            <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> :

            <RefreshCwIcon className="h-3.5 w-3.5" />
            }
              Refresh
            </button>
          </header>
          {remote.length === 0 && remoteStatus !== 'loading' ?
        <p className="px-4 py-6 text-sm text-slate-400">
              No server snapshots yet — one is written every time you publish.
            </p> :

        <ul className="divide-y divide-slate-100">
              {remote.map((version) =>
          <li key={version.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {version.label === 'autosave' ? 'Auto-saved on publish' : version.label}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(version.createdAt).toLocaleString()}</p>
                  </div>
                  <button
              type="button"
              onClick={() => void restoreRemote(version)}
              disabled={restoringId !== null}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 disabled:opacity-50">

                    {restoringId === version.id ?
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> :

              <RotateCcwIcon className="h-3.5 w-3.5" />
              }
                    Restore
                  </button>
                </li>
          )}
            </ul>
        }
        </section>
      }

      <section className="rounded-lg border border-slate-200 bg-white">
        <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <HistoryIcon className="h-4 w-4 text-slate-400" />
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Saved in this browser <span className="text-slate-300">({snapshots.length})</span>
          </h3>
        </header>
        {snapshots.length === 0 ?
        <p className="px-4 py-6 text-sm text-slate-400">No versions saved yet.</p> :

        <ul className="divide-y divide-slate-100">
            {snapshots.map((snapshot) =>
          <li key={snapshot.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{snapshot.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(snapshot.createdAt).toLocaleString()} ·{' '}
                    {snapshot.content.order?.filter((id) => snapshot.content.sections?.[id]?.visible).length ?? 0}{' '}
                    sections live
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                type="button"
                onClick={() => {
                  replaceContent(snapshot.content);
                  setMessage(`Restored “${snapshot.name}”.`);
                  setError('');
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400">
                
                    <RotateCcwIcon className="h-3.5 w-3.5" />
                    Restore
                  </button>
                  <button
                type="button"
                aria-label={`Delete ${snapshot.name}`}
                onClick={() => setSnapshots(deleteSnapshot(snapshot.id))}
                className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
          )}
          </ul>
        }
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          File backup
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Download everything as JSON to move content to another device, or import a previous export.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportContent(content)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">
            
            <DownloadIcon className="h-3.5 w-3.5" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">
            
            <UploadIcon className="h-3.5 w-3.5" />
            Import JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
        </div>
      </section>
    </div>);

}