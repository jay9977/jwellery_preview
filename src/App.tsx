import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ContentProvider } from './contexts/ContentContext';
import { CartProvider } from './contexts/CartContext';
import { ErrorBoundary } from './components/site/ErrorBoundary';
import { Landing } from './pages/Landing';

/**
 * The admin panel is its own chunk: a visitor reading the landing page should not
 * have to download the whole editor first.
 */
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));
const AdminLoginPage = lazy(() =>
import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);

function AdminLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100">
      <span className="text-sm text-slate-400">Loading the editor…</span>
    </div>);

}

export function App() {
  return (
    <ErrorBoundary
      label="App"
      fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-cream px-6">
          <div className="max-w-md text-center">
            <h1 className="display display-3 text-ink">Something went wrong</h1>
            <p className="body-sm mt-3 text-ink/60">
              Please refresh the page. If it keeps happening the saved content may be malformed —
              restore an earlier version from the admin panel.
            </p>
            <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-sm mt-6">

              Refresh
            </button>
          </div>
        </div>
      }>

      <ContentProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/admin-login"
                element={
                <Suspense fallback={<AdminLoading />}>
                    <AdminLoginPage />
                  </Suspense>
                } />

              <Route
                path="/admin"
                element={
                <Suspense fallback={<AdminLoading />}>
                    <Admin />
                  </Suspense>
                } />

              <Route path="*" element={<Landing />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ContentProvider>
    </ErrorBoundary>);

}
