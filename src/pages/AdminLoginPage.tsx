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
  const { state, signedIn } = useAdminAuth();
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

  return (
    <AdminLogin
      onSuccess={(mode) => {
        signedIn(mode);
        navigate('/admin', { replace: true });
      }} />);


}
