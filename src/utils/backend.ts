export interface BackendConfig {
  enabled: boolean;
  baseUrl: string;
  /** Admin JWT. Held in sessionStorage only — never written to localStorage. */
  apiKey: string;
  autoPublish: boolean;
}

const KEY = 'aurelle.backend.config.v1';
const TOKEN_KEY = 'aurelle.admin.token';

/**
 * Build-time API URL. This is what makes the *public* site read from the server:
 * without it the connection would only exist in the browser where an admin typed it in.
 * Set VITE_API_URL in .env (see .env.example) before building.
 */
export const ENV_API_URL = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '');

export const defaultBackendConfig: BackendConfig = {
  enabled: Boolean(ENV_API_URL),
  baseUrl: ENV_API_URL,
  apiKey: '',
  autoPublish: true
};

/** The JWT lives in sessionStorage: it dies with the tab and is not shared across them. */
export function loadToken(): string {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function persistToken(token: string) {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function loadBackendConfig(): BackendConfig {
  if (typeof window === 'undefined') return defaultBackendConfig;

  let stored: Partial<BackendConfig> = {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) stored = JSON.parse(raw) as Partial<BackendConfig>;
  } catch {
    /* unreadable config — fall back to the build-time defaults */
  }

  const baseUrl = stored.baseUrl?.trim() || ENV_API_URL;
  return {
    baseUrl,
    // An explicitly saved choice wins; otherwise connect whenever a URL is known.
    enabled: stored.enabled ?? Boolean(baseUrl),
    autoPublish: stored.autoPublish ?? true,
    apiKey: loadToken()
  };
}

export function persistBackendConfig(config: BackendConfig) {
  persistToken(config.apiKey);
  try {
    // apiKey is deliberately excluded — tokens do not belong in localStorage.
    const { apiKey: _apiKey, ...safe } = config;
    window.localStorage.setItem(KEY, JSON.stringify(safe));
  } catch {
    /* storage unavailable */
  }
}

export function isConnected(config: BackendConfig): boolean {
  return config.enabled && config.baseUrl.trim().length > 0;
}
