import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SmartphoneIcon,
  UploadIcon } from
'lucide-react';
import { useContent } from '../hooks/useContent';
import { isCustomSectionId, sectionLabel } from '../data/sections';
import { SectionEditor } from '../components/admin/SectionEditor';
import { GlobalEditor } from '../components/admin/GlobalEditor';
import { ThemeEditor } from '../components/admin/ThemeEditor';
import { VersionHistory } from '../components/admin/VersionHistory';
import { BackendEditor } from '../components/admin/BackendEditor';
import { SyncBadge } from '../components/admin/SyncBadge';
import { Subscribers } from '../components/admin/Subscribers';
import { LeadsTable } from '../components/leads/LeadsTable';
import { SocialLinks } from '../components/admin/SocialLinks';
import { ContactMessages } from '../components/admin/ContactMessages';
import { exportContent, importContent } from '../utils/contentIO';
import { useAdminAuth } from '../hooks/useAdminAuth';
import type { SectionId } from '../types/content';

type Tab = 'global' | 'theme' | 'social' | 'versions' | 'leads' | 'subscribers' | 'messages' | 'backend' | SectionId;

export function Admin() {
  const { content, backend, isDirty, toggleSection, moveSection, addSection, replaceContent, resetAll } =
  useContent();
  const { state: authState, signOut } = useAdminAuth();
  const [tab, setTab] = useState<Tab>('hero');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  /* The selected tab can outlive its section — deleted here, or missing from content
     that was pulled, imported or reset. Fall back to the first section that exists. */
  const NON_SECTION_TABS = ['global', 'theme', 'social', 'versions', 'leads', 'subscribers', 'messages', 'backend'];
  useEffect(() => {
    if (NON_SECTION_TABS.includes(tab) || content.sections[tab]) return;
    setTab(content.order.find((id) => content.sections[id]) ?? 'global');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, content.sections, content.order]);

  if (authState === 'checking') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100">
        <Loader2Icon className="h-5 w-5 animate-spin text-slate-400" />
        <span className="sr-only">Checking your session…</span>
      </div>);

  }

  // The editor never renders a login form — signing in happens at /admin-login.
  if (authState === 'out') return <Navigate to="/admin-login" replace />;

  const visibleCount = content.order.filter((id) => content.sections[id]?.visible).length;

  function openPreview() {
    setPreviewKey((k) => k + 1);
    setMode('preview');
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const next = await importContent(file);
      replaceContent(next);
      setImportError('');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed.');
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">Landing page editor</p>
            <p className="text-xs text-slate-500">
              {content.brand.name} · {visibleCount} of {content.order.length} sections live
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SyncBadge />
            <div className="flex rounded-md border border-slate-300 p-0.5">
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium ${
                mode === 'edit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`
                }>
                
                <PencilIcon className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={openPreview}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium ${
                mode === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`
                }>
                
                <EyeIcon className="h-3.5 w-3.5" />
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={() => exportContent(content)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">
              
              <DownloadIcon className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">
              
              <UploadIcon className="h-3.5 w-3.5" />
              Import
            </button>
            <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />

            {confirmReset ?
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Discard all edits?</span>
                <button
                type="button"
                onClick={() => {
                  resetAll();
                  setConfirmReset(false);
                }}
                className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700">
                
                  Yes, reset
                </button>
                <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600">
                
                  Cancel
                </button>
              </div> :

            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">
              
                <RotateCcwIcon className="h-3.5 w-3.5" />
                Reset
              </button>
            }

            {confirmSignOut ?
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {isDirty ? 'You have unsaved changes. Sign out anyway?' : 'Sign out?'}
                </span>
                <button
                type="button"
                onClick={signOut}
                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700">

                  Yes, sign out
                </button>
                <button
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600">

                  Cancel
                </button>
              </div> :

            <button
              type="button"
              onClick={() => setConfirmSignOut(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-red-400 hover:text-red-600">

                <LogOutIcon className="h-3.5 w-3.5" />
                Sign out
              </button>
            }

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-deep">

              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Open site
            </Link>
          </div>
        </div>
        {importError &&
        <p role="alert" className="bg-red-50 px-4 py-2 text-xs text-red-700 sm:px-6">
            {importError}
          </p>
        }
      </header>

      {mode === 'preview' ?
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex rounded-md border border-slate-300 bg-white p-0.5">
              <button
              type="button"
              onClick={() => setDevice('desktop')}
              aria-label="Desktop preview"
              className={`rounded p-1.5 ${device === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
              
                <MonitorIcon className="h-4 w-4" />
              </button>
              <button
              type="button"
              onClick={() => setDevice('mobile')}
              aria-label="Mobile preview"
              className={`rounded p-1.5 ${device === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
              
                <SmartphoneIcon className="h-4 w-4" />
              </button>
            </div>
            <button
            type="button"
            onClick={() => setPreviewKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-400">
            
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh preview
            </button>
          </div>
          <div className="flex justify-center">
            <iframe
            key={previewKey}
            title="Landing page preview"
            src="/"
            className={`h-[76vh] rounded-lg border border-slate-300 bg-white shadow-sm ${
            device === 'mobile' ? 'w-[390px]' : 'w-full'}`
            } />
          
          </div>
        </div> :

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="space-y-2">
              <button
              type="button"
              onClick={() => setTab('theme')}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              tab === 'theme' ?
              'border-emerald bg-white text-emerald' :
              'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
              }>
              
                Colours & typography
                <span className="flex overflow-hidden rounded" aria-hidden>
                  {(['cream', 'sand', 'ink', 'accent', 'gold'] as const).map((key) =>
                <span
                  key={key}
                  className="h-4 w-3"
                  style={{ backgroundColor: content.theme.colors[key] }} />

                )}
                </span>
              </button>
              <button
              type="button"
              onClick={() => setTab('global')}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              tab === 'global' ?
              'border-emerald bg-white text-emerald' :
              'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
              }>
              
                Brand, SEO, header & footer
              </button>
              <button
              type="button"
              onClick={() => setTab('social')}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              tab === 'social' ?
              'border-emerald bg-white text-emerald' :
              'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
              }>

                Social & media links
              </button>
              <button
              type="button"
              onClick={() => setTab('versions')}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              tab === 'versions' ?
              'border-emerald bg-white text-emerald' :
              'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
              }>
              
                Versions & backups
              </button>
              <button
              type="button"
              onClick={() => setTab('leads')}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              tab === 'leads' ?
              'border-emerald bg-white text-emerald' :
              'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
              }>

                Leads
              </button>
              <button
              type="button"
              onClick={() => setTab('subscribers')}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              tab === 'subscribers' ?
              'border-emerald bg-white text-emerald' :
              'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
              }>

                Newsletter subscribers
              </button>
              <button
              type="button"
              onClick={() => setTab('messages')}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              tab === 'messages' ?
              'border-emerald bg-white text-emerald' :
              'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
              }>

                Contact messages
              </button>
              <button
              type="button"
              onClick={() => setTab('backend')}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              tab === 'backend' ?
              'border-emerald bg-white text-emerald' :
              'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`
              }>
              
                Backend connection
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <p className="border-b border-slate-200 px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Page sections
              </p>
              <ul className="divide-y divide-slate-100">
                {content.order.map((id, index) => {
                const section = content.sections[id];
                // An order entry with no section behind it must not take the panel down.
                if (!section) return null;
                const isActive = tab === id;
                return (
                  <li key={id} className={`flex items-center gap-1 px-2 py-2 ${isActive ? 'bg-emerald/5' : ''}`}>
                      <button
                      type="button"
                      onClick={() => setTab(id)}
                      className="flex-1 px-2 py-1 text-left"
                      aria-current={isActive}>
                      
                        <span
                        className={`block text-sm font-medium ${
                        isActive ? 'text-emerald' : section.visible ? 'text-slate-800' : 'text-slate-400'}`
                        }>
                        
                          {sectionLabel(id, section)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {section.visible ? 'Visible' : 'Hidden'}
                          {isCustomSectionId(id) && ' · added by you'}
                        </span>
                      </button>
                      <button
                      type="button"
                      aria-label={`Move ${sectionLabel(id, section)} up`}
                      onClick={() => moveSection(id, -1)}
                      disabled={index === 0}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25">
                      
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                      type="button"
                      aria-label={`Move ${sectionLabel(id, section)} down`}
                      onClick={() => moveSection(id, 1)}
                      disabled={index === content.order.length - 1}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25">
                      
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                      type="button"
                      aria-label={`${section.visible ? 'Hide' : 'Show'} ${sectionLabel(id, section)}`}
                      onClick={() => toggleSection(id)}
                      className={`rounded p-1.5 hover:bg-slate-100 ${
                      section.visible ? 'text-emerald' : 'text-slate-400'}`
                      }>
                      
                        {section.visible ?
                      <EyeIcon className="h-4 w-4" /> :

                      <EyeOffIcon className="h-4 w-4" />
                      }
                      </button>
                    </li>);

              })}
              </ul>
              <div className="border-t border-slate-200 p-2">
                <button
                  type="button"
                  onClick={() => setTab(addSection())}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-600 hover:border-emerald hover:text-emerald">

                  <PlusIcon className="h-3.5 w-3.5" />
                  Add a section
                </button>
              </div>
            </div>

            <p className="px-1 text-xs leading-relaxed text-slate-500">
              {backend.enabled && backend.baseUrl ?
            backend.autoPublish ?
            'Edits publish to your API automatically, and a local copy is kept as a fallback.' :
            'Edits are held locally — use Publish now in Backend connection to push them.' :
            'Changes save on this device only. Connect your API in Backend connection to go live.'}
            </p>
          </aside>

          <main className="pb-16">
            {tab === 'theme' ?
          <ThemeEditor /> :
          tab === 'social' ?
          <SocialLinks /> :
          tab === 'versions' ?
          <VersionHistory /> :
          tab === 'leads' ?
          <LeadsTable /> :
          tab === 'subscribers' ?
          <Subscribers /> :
          tab === 'messages' ?
          <ContactMessages /> :
          tab === 'backend' ?
          <BackendEditor /> :
          tab === 'global' ?
          <GlobalEditor /> :

          <SectionEditor id={tab} onDeleted={() => setTab('hero')} />
          }
          </main>
        </div>
      }
    </div>);

}