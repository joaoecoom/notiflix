import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { SetPasswordPage } from './components/auth/SetPasswordPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { SimulationApp } from './SimulationApp';
import type { ReactNode } from 'react';

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading, configured } = useAuth();
  if (!configured) return children;
  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, loading, isAdmin, configured } = useAuth();
  if (!configured) return children;
  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;
  return children;
}

function RootRedirect() {
  const { session, loading, isAdmin, configured } = useAuth();
  if (!configured) return <Navigate to="/app" replace />;
  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin' : '/app'} replace />;
}

function LoginGuard() {
  const { session, loading, isAdmin, configured } = useAuth();
  if (!configured) return <Navigate to="/app" replace />;
  if (loading) return <LoadingScreen />;
  if (session) return <Navigate to={isAdmin ? '/admin' : '/app'} replace />;
  return <LoginPage />;
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        fontSize: 15,
      }}
    >
      A carregar...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginGuard />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
          <Route
            path="/admin/*"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <SimulationApp />
              </RequireAuth>
            }
          />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
