import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '@/app/store';
import { sessionCleared, sessionEstablished } from '@/features/auth/authSlice';
import { clearRefreshToken, getRefreshToken, setRefreshToken } from '@/features/auth/refreshTokenStorage';
import * as authService from '@/features/auth/auth.service';
import { __resetHttpClientState, authenticatedFetch } from './httpClient';

const testUser = { id: 1, username: 'emilys', email: 'e@x.com', firstName: 'Emily', lastName: 'S', image: '' };

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('authenticatedFetch', () => {
  beforeEach(() => {
    store.dispatch(sessionCleared());
    clearRefreshToken();
    __resetHttpClientState();
  });

  afterEach(() => {
    store.dispatch(sessionCleared());
    clearRefreshToken();
    __resetHttpClientState();
    vi.restoreAllMocks();
  });

  it('attaches the Bearer token from the store when one exists', async () => {
    store.dispatch(sessionEstablished({ user: testUser, accessToken: 'token-1' }));
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, { ok: true }));

    await authenticatedFetch('/api/tasks');

    const [, init] = fetchSpy.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer token-1');
  });

  it('does not attach a Bearer token when skipAuth is true', async () => {
    store.dispatch(sessionEstablished({ user: testUser, accessToken: 'token-1' }));
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, { ok: true }));

    await authenticatedFetch('/api/public', { skipAuth: true });

    const [, init] = fetchSpy.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBeNull();
  });

  it('on a 401, refreshes the token and retries the request once, returning the retried response', async () => {
    store.dispatch(sessionEstablished({ user: testUser, accessToken: 'expired-token' }));
    setRefreshToken('refresh-token-1');

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { data: 'success' }));

    vi.spyOn(authService, 'refreshAccessToken').mockResolvedValue({
      accessToken: 'new-token',
      refreshToken: 'refresh-token-2',
    });

    const response = await authenticatedFetch('/api/tasks');

    expect(response.status).toBe(200);
    expect(authService.refreshAccessToken).toHaveBeenCalledWith('refresh-token-1');
    expect(store.getState().auth.accessToken).toBe('new-token');
    expect(getRefreshToken()).toBe('refresh-token-2');

    const [, retryInit] = fetchSpy.mock.calls[1];
    const retryHeaders = new Headers(retryInit?.headers);
    expect(retryHeaders.get('Authorization')).toBe('Bearer new-token');
  });

  it('dedupes concurrent refreshes: two simultaneous 401s only trigger one refresh call', async () => {
    store.dispatch(sessionEstablished({ user: testUser, accessToken: 'expired-token' }));
    setRefreshToken('refresh-token-1');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(401, { message: 'expired' }));

    // A real (short) delay, not a manually-controlled promise: gives both
    // authenticatedFetch calls' initial 401 handling a chance to run before
    // the refresh settles, so the dedup path is exercised deterministically
    // rather than depending on exact microtask interleaving.
    vi.spyOn(authService, 'refreshAccessToken').mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ accessToken: 'new-token', refreshToken: 'refresh-token-2' }), 10);
        }),
    );

    await Promise.all([authenticatedFetch('/api/tasks'), authenticatedFetch('/api/sprints')]);

    expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('clears the session and rejects when the refresh call itself fails', async () => {
    store.dispatch(sessionEstablished({ user: testUser, accessToken: 'expired-token' }));
    setRefreshToken('refresh-token-1');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(401, { message: 'expired' }));
    vi.spyOn(authService, 'refreshAccessToken').mockRejectedValue(new Error('Token refresh failed: 401'));

    await expect(authenticatedFetch('/api/tasks')).rejects.toThrow('Token refresh failed');

    expect(getRefreshToken()).toBeNull();
    expect(store.getState().auth.status).toBe('unauthenticated');
  });

  it('does not loop when the retried request also returns a 401', async () => {
    store.dispatch(sessionEstablished({ user: testUser, accessToken: 'expired-token' }));
    setRefreshToken('refresh-token-1');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(401, { message: 'still unauthorized' }));
    vi.spyOn(authService, 'refreshAccessToken').mockResolvedValue({
      accessToken: 'new-token',
      refreshToken: 'refresh-token-2',
    });

    const response = await authenticatedFetch('/api/tasks');

    expect(response.status).toBe(401);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
