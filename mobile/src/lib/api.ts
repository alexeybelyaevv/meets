import { getTokens } from './token-storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function apiFetch<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(init.headers);
  const tokens = await getTokens();

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (tokens?.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  return response.json() as Promise<TResponse>;
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    return Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

