import { useCallback, useEffect, useState } from 'react';
import { useContent } from './/useContent';
import { isConnected } from '../utils/backend';
import { verifyToken } from '../utils/api';

/** Only ever gates the offline demo editor — a real session is gated by the server. */
export const DEMO_AUTH_KEY = 'aurelle.admin.demo-authed';

export type AdminAuthState = 'checking' | 'in' | 'out';

/**
 * Shared by the login page and the editor so they cannot disagree about whether
 * someone is signed in. With a server connected the gate is the token itself,
 * checked against /auth/me — a flag flipped in devtools does not open the editor.
 */
export function useAdminAuth() {
  const { backend, updateBackend } = useContent();
  const connected = isConnected(backend);
  const [state, setState] = useState<AdminAuthState>('checking');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (connected) {
        const ok = await verifyToken(backend);
        if (!cancelled) setState(ok ? 'in' : 'out');
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
    setState('out');
  }, [updateBackend]);

  return { state, signedIn, signOut };
}
