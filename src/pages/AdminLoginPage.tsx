import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { AdminLogin } from '../components/admin/AdminLogin';
import { useAdminAuth } from '../hooks/useAdminAuth';

/**
 * The sign-in page at /admin-login. Kept separate from the editor so the editor
 * route never renders a login form, and so the login URL can be shared or
 * bookmarked without exposing the editor itself.
 */
export function AdminLoginPage() {
  const { state, wrongPanel, signedIn, signOut } = useAdminAuth();
  const navigate = useNavigate();

  if (state === 'checking') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100">
        <Loader2Icon className="h-5 w-5 animate-spin text-slate-400" />
        <span className="sr-only">Checking your session…</span>
      </div>);

  }

  // Already signed in — no reason to show the form again.
  if (state === 'in') return <Navigate to="/admin" replace />;

  // A leads-desk session is valid, just not for this door.
  if (wrongPanel) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-medium text-slate-900">This is the leads account</h1>
          <p className="mt-2 text-sm text-slate-500">
            It opens the leads panel, not the site editor. Sign in with the admin account to edit the
            website.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href="/leads-panel"
              className="inline-flex h-10 items-center justify-center rounded-md bg-emerald text-sm font-medium text-white hover:bg-emerald-deep">

              Go to the leads panel
            </a>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 text-sm font-medium text-slate-600 hover:border-slate-400">

              Sign in as someone else
            </button>
          </div>
        </div>
      </div>);

  }

  return (
    <AdminLogin
      onSuccess={(mode, role) => {
        // A leads account can sign in here, but belongs in the other panel.
        if (mode === 'server' && role && role !== 'admin') {
          navigate('/leads-panel', { replace: true });
          return;
        }
        signedIn(mode);
        navigate('/admin', { replace: true });
      }} />);


}
