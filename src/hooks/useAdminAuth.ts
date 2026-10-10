import { useCallback, useEffect, useState } from 'react';
import { useContent } from './/useContent';
import { currentSite, isConnected } from '../utils/backend';
import { fetchAccount } from '../utils/api';

/** Only ever gates the offline demo editor — a real session is gated by the server. */
export const DEMO_AUTH_KEY = 'giriraj.admin.demo-authed';

export type AdminAuthState = 'checking' | 'in' | 'out';

/**
 * Shared by the login page and the editor so they cannot disagree about whether
 * someone is signed in. With a server connected the gate is the token itself,
 * checked against /auth/me — a flag flipped in devtools does not open the editor.
 *
 * The editor additionally requires the `admin` role: a leads-desk account holds a
 * perfectly valid token, and without this check it would open the editor UI and
 * read the whole site content, even though the server refuses its writes.
 */
export function useAdminAuth() {
  const { backend, updateBackend } = useContent();
  const connected = isConnected(backend);
  const [state, setState] = useState<AdminAuthState>('checking');
  /** Set when a valid session exists but belongs to the leads desk, not the editor. */
  const [wrongPanel, setWrongPanel] = useState(false);
  /** A super admin session with no client picked — belongs in /super-admin. */
  const [superAdmin, setSuperAdmin] = useState(false);
  /** The super admin is editing a client's site on their behalf. */
  const [supportMode, setSupportMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (connected) {
        const account = await fetchAccount(backend);
        if (cancelled) return;
        // A super admin edits a client's site in support mode (a client picked for this tab).
        const isSuper = account?.role === 'superadmin';
        const isAdmin = account?.role === 'admin' || (isSuper && Boolean(currentSite()));
        setSuperAdmin(isSuper && !isAdmin);
        setSupportMode(isSuper && isAdmin);
        setWrongPanel(Boolean(account) && !isAdmin && !isSuper);
        setState(isAdmin ? 'in' : 'out');
        return;
      }
      const demo = window.sessionStorage.getItem(DEMO_AUTH_KEY) === 'yes';
      if (!cancelled) setState(demo ? 'in' : 'out');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, backend.baseUrl, backend.apiKey]);

  const signedIn = useCallback((mode: 'server' | 'demo') => {
    if (mode === 'demo') window.sessionStorage.setItem(DEMO_AUTH_KEY, 'yes');
    setState('in');
  }, []);

  const signOut = useCallback(() => {
    window.sessionStorage.removeItem(DEMO_AUTH_KEY);
    updateBackend({ apiKey: '' });
    setWrongPanel(false);
    setSuperAdmin(false);
    setState('out');
  }, [updateBackend]);

  return { state, wrongPanel, superAdmin, supportMode, signedIn, signOut };
}
