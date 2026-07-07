const ADMIN_API_URL_STORAGE_KEY = 'nvf-admin-api-url';

export function getDefaultApiBaseUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:3000';

  const savedBaseUrl = window.localStorage.getItem(ADMIN_API_URL_STORAGE_KEY);
  if (savedBaseUrl) return savedBaseUrl;

  if (window.location.port === '3001') {
    return `${window.location.protocol}//${window.location.hostname}:3005`;
  }

  return window.location.origin;
}

export function rememberApiBaseUrl(baseUrl: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_API_URL_STORAGE_KEY, baseUrl);
}
