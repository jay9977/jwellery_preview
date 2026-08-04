import { useState } from 'react';
import {
  CloudIcon,
  CloudOffIcon,
  DownloadCloudIcon,
  Loader2Icon,
  PlugZapIcon,
  UploadCloudIcon } from
'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { TextField, ToggleField } from './Fields';
import { pingBackend } from '../../utils/api';
import { isConnected } from '../../utils/backend';

export function BackendEditor() {
  const { backend, updateBackend, publish, pull, syncStatus, syncError, lastSyncedAt, isDirty } = useContent();
  const [testState, setTestState] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const connected = isConnected(backend);

  async function handleTest() {
    setTestState('testing');
    try {
      setTestMessage(await pingBackend(backend));
      setTestState('ok');
    } catch (error) {
      setTestMessage(error instanceof Error ? error.message : 'Connection failed.');
      setTestState('fail');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald">Data source</p>
        <h2 className="mt-1 text-2xl font-medium text-slate-900">Backend connection</h2>
        <p className="mt-1 text-sm text-slate-500">
          Point the site at your own API. Content is loaded from the server on open and saved back as you edit,
          with a local copy kept as an offline fallback.
        </p>
      </header>

      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          {connected ?
          <CloudIcon className="h-4 w-4 text-emerald" /> :

          <CloudOffIcon className="h-4 w-4 text-slate-400" />
          }
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            {connected ? 'Connected to API' : 'Using local storage only'}
          </h3>
        </div>

        <ToggleField
          label="Use a real backend"
          description="When off, all content lives in this browser only."
          checked={backend.enabled}
          onChange={(value) => updateBackend({ enabled: value })} />
        
        <TextField
          label="API base URL"
          value={backend.baseUrl}
          onChange={(v) => updateBackend({ baseUrl: v })}
          placeholder="http://localhost:4000/api"
          hint="For the bundled server use http://localhost:4000/api. Set VITE_API_URL in .env so the public site uses it too — a URL typed here only applies to this browser." />
        
        <div>
          <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Admin session</span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium ${
              backend.apiKey ? 'bg-emerald/10 text-emerald' : 'bg-slate-100 text-slate-500'}`
              }>

              {backend.apiKey ? `Signed in · token ••••${backend.apiKey.slice(-4)}` : 'Not signed in'}
            </span>
            {backend.apiKey &&
            <button
              type="button"
              onClick={() => updateBackend({ apiKey: '' })}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">

                Clear token
              </button>
            }
          </div>
          <span className="mt-1 block text-xs text-slate-400">
            Your JWT is issued at sign-in and kept in this tab only — it is never written to localStorage.
            Sent as: Authorization: Bearer &lt;token&gt;
          </span>
        </div>

        <ToggleField
          label="Auto-save edits to the server"
          description="Publishes about a second after you stop typing. Turn off to publish manually."
          checked={backend.autoPublish}
          onChange={(value) => updateBackend({ autoPublish: value })} />
        

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleTest}
            disabled={!backend.baseUrl || testState === 'testing'}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400 disabled:opacity-50">
            
            {testState === 'testing' ?
            <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> :

            <PlugZapIcon className="h-3.5 w-3.5" />
            }
            Test connection
          </button>
          <button
            type="button"
            onClick={() => void pull()}
            disabled={!connected || syncStatus === 'loading'}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400 disabled:opacity-50">
            
            <DownloadCloudIcon className="h-3.5 w-3.5" />
            Load from server
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={!connected || syncStatus === 'saving'}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-deep disabled:opacity-50">
            
            <UploadCloudIcon className="h-3.5 w-3.5" />
            Publish now
          </button>
        </div>

        {testMessage &&
        <p
          role="status"
          className={`rounded-md px-3 py-2 text-xs ${
          testState === 'ok' ? 'bg-emerald/10 text-emerald' : 'bg-red-50 text-red-700'}`
          }>
          
            {testMessage}
          </p>
        }
        {syncError &&
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {syncError}
          </p>
        }
        {connected && !syncError &&
        <p className="text-xs text-slate-500">
            {syncStatus === 'saving' ?
          'Saving to server…' :
          syncStatus === 'loading' ?
          'Loading from server…' :
          lastSyncedAt ?
          `Last synced ${new Date(lastSyncedAt).toLocaleString()}${isDirty ? ' · unsaved changes' : ''}` :
          'Not synced yet.'}
          </p>
        }
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Endpoints your API must expose
        </h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-md bg-slate-50 p-3">
            <code className="text-xs font-semibold text-slate-900">GET /content</code>
            <p className="mt-1 text-xs text-slate-500">
              Returns the content document, either bare or as <code>{'{ "content": { … } }'}</code>. Must include
              a <code>sections</code> object. Missing fields fall back to the built-in defaults.
            </p>
          </li>
          <li className="rounded-md bg-slate-50 p-3">
            <code className="text-xs font-semibold text-slate-900">PUT /content</code>
            <p className="mt-1 text-xs text-slate-500">
              Receives <code>{'{ "content": { … } }'}</code> — the full document including theme, SEO, nav,
              sections, order and footer. Respond 200 or 204.
            </p>
          </li>
          <li className="rounded-md bg-slate-50 p-3">
            <code className="text-xs font-semibold text-slate-900">GET /health</code>
            <p className="mt-1 text-xs text-slate-500">
              Optional. Used by Test connection; falls back to <code>/content</code> when absent.
            </p>
          </li>
          <li className="rounded-md bg-slate-50 p-3">
            <code className="text-xs font-semibold text-slate-900">POST /subscribers</code>
            <p className="mt-1 text-xs text-slate-500">
              Receives <code>{'{ "email": "…" }'}</code> from the newsletter form on the landing page.
            </p>
          </li>
          <li className="rounded-md bg-slate-50 p-3">
            <code className="text-xs font-semibold text-slate-900">POST /auth/login</code>
            <span className="text-xs text-slate-400"> · </span>
            <code className="text-xs font-semibold text-slate-900">GET /auth/me</code>
            <p className="mt-1 text-xs text-slate-500">
              Login returns <code>{'{ "token": "…" }'}</code>. <code>/auth/me</code> confirms a stored token is
              still valid — the admin panel calls it before opening the editor.
            </p>
          </li>
          <li className="rounded-md bg-slate-50 p-3">
            <code className="text-xs font-semibold text-slate-900">GET /versions</code>
            <span className="text-xs text-slate-400"> · </span>
            <code className="text-xs font-semibold text-slate-900">GET /subscribers</code>
            <p className="mt-1 text-xs text-slate-500">
              Power the Versions and Newsletter subscribers tabs. Both require the bearer token.
            </p>
          </li>
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          All requests send <code>Content-Type: application/json</code> and, when a key is set,
          <code> Authorization: Bearer …</code>. Your server must allow this origin via CORS.
        </p>
      </section>
    </div>);

}