import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

const LoginPage = lazy(() => import('@/routes/LoginPage'));
const DashboardPage = lazy(() => import('@/routes/DashboardPage'));
const BoardPage = lazy(() => import('@/routes/BoardPage'));
const AnalyticsPage = lazy(() => import('@/routes/AnalyticsPage'));

function RouteFallback() {
  return <div className="flex h-screen items-center justify-center">Loading…</div>;
}

function withSuspense(children: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/dashboard', element: withSuspense(<DashboardPage />) },
  { path: '/board', element: withSuspense(<BoardPage />) },
  { path: '/analytics', element: withSuspense(<AnalyticsPage />) },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
