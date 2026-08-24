import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';

export function PublicOnlyRoute() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.status === 'authenticated');
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
