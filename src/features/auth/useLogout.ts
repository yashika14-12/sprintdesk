import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '@/app/store';
import { sessionCleared } from './authSlice';
import { clearRefreshToken } from './refreshTokenStorage';

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return () => {
    clearRefreshToken();
    dispatch(sessionCleared());
    navigate('/login', { replace: true });
  };
}
