import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';

export function ProtectedRoute() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.status === 'authenticated');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
