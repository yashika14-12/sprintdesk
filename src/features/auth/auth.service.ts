import type { AuthUser, LoginResponse, RefreshResponse } from '@/types/auth';
import { authenticatedFetch } from '@/services/httpClient';

const DUMMY_JSON_BASE_URL = 'https://dummyjson.com';

/** Short-lived on purpose so the silent-refresh flow is observable without waiting. */
const SESSION_EXPIRY_MINUTES = 1;

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: SESSION_EXPIRY_MINUTES }),
  });

  if (!response.ok) {
    throw new Error(response.status === 400 ? 'Invalid username or password' : `Login failed: ${response.status}`);
  }

  return response.json() as Promise<LoginResponse>;
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, expiresInMins: SESSION_EXPIRY_MINUTES }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return response.json() as Promise<RefreshResponse>;
}

/** Reads the Bearer token from the store via authenticatedFetch — call only after dispatching accessTokenRefreshed/sessionEstablished. */
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await authenticatedFetch(`${DUMMY_JSON_BASE_URL}/auth/me`);

  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.status}`);
  }

  return response.json() as Promise<AuthUser>;
}
