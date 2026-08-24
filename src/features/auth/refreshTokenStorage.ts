const REFRESH_TOKEN_KEY = 'sprintdesk:refreshToken';

export function getRefreshToken(): string | null {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
