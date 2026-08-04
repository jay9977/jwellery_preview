import type { SiteContent } from '../types/content';
import type { BackendConfig } from './backend';

export interface RemoteVersion {
  id: number;
  label: string;
  createdAt: string;
}

export interface RemoteVersionDetail extends RemoteVersion {
  content: SiteContent;
}

export interface RemoteSubscriber {
  id: number;
  email: string;
  createdAt: string;
}

function endpoint(config: BackendConfig, path: string): string {
  return `${config.baseUrl.trim().replace(/\/$/, '')}${path}`;
}

function headers(config: BackendConfig): HeadersInit {
  const base: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey.trim()) base.Authorization = `Bearer ${config.apiKey.trim()}`;
  return base;
}

/** Pull the server's own `{ error }` message out of a failed response. */
async function messageFrom(response: Response, fallback: string): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return fallback;
    const parsed = JSON.parse(text) as { error?: string };
    return parsed.error ?? fallback;
  } catch {
    return fallback;
  }
}

async function request<T>(config: BackendConfig, path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint(config, path), { ...init, headers: headers(config) });
  } catch {
    throw new Error('Could not reach the server. Check the base URL and CORS settings.');
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error(await messageFrom(response, 'The server rejected your session. Please sign in again.'));
  }
  if (!response.ok) {
    throw new Error(await messageFrom(response, `Server responded with ${response.status} ${response.statusText}.`));
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('The server did not return valid JSON.');
  }
}

/** GET /content → SiteContent (optionally wrapped as { content: SiteContent }) */
export async function fetchRemoteContent(config: BackendConfig): Promise<SiteContent> {
  const payload = await request<SiteContent | {content: SiteContent;}>(config, '/content');
  const content = (payload as {content?: SiteContent;})?.content ?? payload as SiteContent;
  if (!content || typeof content !== 'object' || !content.sections) {
    throw new Error('The /content response is missing a "sections" object.');
  }
  return content;
}

/** PUT /content with the full SiteContent document */
export async function pushRemoteContent(config: BackendConfig, content: SiteContent): Promise<void> {
  await request<void>(config, '/content', { method: 'PUT', body: JSON.stringify({ content }) });
}

/** GET /health, falling back to /content when no health route exists */
export async function pingBackend(config: BackendConfig): Promise<string> {
  try {
    await request<unknown>(config, '/health');
    return 'Connected — /health responded.';
  } catch {
    await fetchRemoteContent(config);
    return 'Connected — /content responded.';
  }
}

/** POST /subscribers { email } */
export async function submitSubscriber(config: BackendConfig, email: string): Promise<void> {
  await request<void>(config, '/subscribers', { method: 'POST', body: JSON.stringify({ email }) });
}

/** GET /subscribers → the newsletter list (admin only) */
export async function fetchSubscribers(config: BackendConfig): Promise<RemoteSubscriber[]> {
  const payload = await request<{subscribers?: RemoteSubscriber[];}>(config, '/subscribers');
  return payload?.subscribers ?? [];
}

/** GET /versions → server-side version history (admin only) */
export async function fetchVersions(config: BackendConfig): Promise<RemoteVersion[]> {
  const payload = await request<{versions?: RemoteVersion[];}>(config, '/versions');
  return payload?.versions ?? [];
}

/** GET /versions/:id → one snapshot including its full content */
export async function fetchVersion(config: BackendConfig, id: number): Promise<RemoteVersionDetail> {
  const payload = await request<{version?: RemoteVersionDetail;}>(config, `/versions/${id}`);
  if (!payload?.version?.content) throw new Error('That version could not be loaded.');
  return payload.version;
}

/** GET /auth/me → confirms the stored token is still accepted by the server */
export async function verifyToken(config: BackendConfig): Promise<boolean> {
  if (!config.apiKey.trim()) return false;
  try {
    await request<{email?: string;}>(config, '/auth/me');
    return true;
  } catch {
    return false;
  }
}

/** POST /auth/login { email?, password } → { token } */
export async function loginAdmin(baseUrl: string, password: string, email?: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl.trim().replace(/\/$/, '')}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email ? { email, password } : { password })
    });
  } catch {
    throw new Error('Could not reach the server. Is it running?');
  }
  if (!response.ok) {
    throw new Error(await messageFrom(response, `Login failed (${response.status}).`));
  }
  const data = (await response.json()) as {token?: string;};
  if (!data.token) throw new Error('The server did not return a token.');
  return data.token;
}

/** POST /upload (multipart) → { url } */
export async function uploadImage(config: BackendConfig, file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  let response: Response;
  try {
    response = await fetch(endpoint(config, '/upload'), {
      method: 'POST',
      headers: config.apiKey.trim() ? { Authorization: `Bearer ${config.apiKey.trim()}` } : undefined,
      body: form
    });
  } catch {
    throw new Error('Could not reach the server for the upload.');
  }
  if (!response.ok) {
    throw new Error(await messageFrom(response, `Upload failed (${response.status}).`));
  }
  const data = (await response.json()) as {url?: string;};
  if (!data.url) throw new Error('The server did not return an image URL.');
  return data.url;
}
