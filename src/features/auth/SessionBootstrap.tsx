import { useEffect, useState, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/app/store';
import { accessTokenRefreshed, sessionCleared, sessionEstablished } from './authSlice';
import { clearRefreshToken, getRefreshToken, setRefreshToken } from './refreshTokenStorage';
import { getCurrentUser, refreshAccessToken } from './auth.service';
import { Skeleton } from '@/components/ui/Skeleton';

export interface SessionBootstrapProps {
  children: ReactNode;
}

export function SessionBootstrap({ children }: SessionBootstrapProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        if (isMounted) setIsValidating(false);
        return;
      }

      try {
        const refreshed = await refreshAccessToken(refreshToken);
        setRefreshToken(refreshed.refreshToken);
        // Put the token in the store first so getCurrentUser's authenticatedFetch call can attach it.
        dispatch(accessTokenRefreshed(refreshed.accessToken));
        const user = await getCurrentUser();
        if (isMounted) {
          dispatch(sessionEstablished({ user, accessToken: refreshed.accessToken }));
        }
      } catch {
        clearRefreshToken();
        if (isMounted) dispatch(sessionCleared());
      } finally {
        if (isMounted) setIsValidating(false);
      }
    }

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return <>{children}</>;
}
