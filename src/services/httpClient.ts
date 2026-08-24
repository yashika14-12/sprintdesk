import { store } from '@/app/store';
import { accessTokenRefreshed, sessionCleared } from '@/features/auth/authSlice';
import { clearRefreshToken, getRefreshToken, setRefreshToken } from '@/features/auth/refreshTokenStorage';
import { refreshAccessToken } from '@/features/auth/auth.service';

export interface AuthenticatedFetchOptions extends RequestInit {
  /** Skip attaching a Bearer token and skip the 401 refresh/retry flow. */
  skipAuth?: boolean;
}

let refreshPromise: Promise<string> | null = null;

export function __resetHttpClientState(): void {
  refreshPromise = null;
}

async function performRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const refreshed = await refreshAccessToken(refreshToken);
  store.dispatch(accessTokenRefreshed(refreshed.accessToken));
  setRefreshToken(refreshed.refreshToken);
  return refreshed.accessToken;
}

export async function authenticatedFetch(url: string, options: AuthenticatedFetchOptions = {}): Promise<Response> {
  const { skipAuth, headers, ...rest } = options;
  const accessToken = store.getState().auth.accessToken;

  const requestHeaders = new Headers(headers);
  if (!skipAuth && accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...rest, headers: requestHeaders });

  if (skipAuth || response.status !== 401) {
    return response;
  }

  try {
    if (!refreshPromise) {
      refreshPromise = performRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const newAccessToken = await refreshPromise;

    const retryHeaders = new Headers(headers);
    retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
    return fetch(url, { ...rest, headers: retryHeaders });
  } catch (error) {
    clearRefreshToken();
    store.dispatch(sessionCleared());
    throw error;
  }
}
