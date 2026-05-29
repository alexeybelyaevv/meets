import type { AuthUserDto } from '@meets/shared';
import { apiFetch } from '@/lib/api';

export type AppleLoginRequest = {
  identityToken: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
};

export type GoogleLoginRequest = {
  idToken: string;
};

export type TelegramLoginRequest = {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export function loginWithApple(body: AppleLoginRequest) {
  return apiFetch<AuthUserDto>('/auth/apple', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function loginWithGoogle(body: GoogleLoginRequest) {
  return apiFetch<AuthUserDto>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function loginWithTelegram(body: TelegramLoginRequest) {
  return apiFetch<AuthUserDto>('/auth/telegram', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function refreshAuth(refreshToken: string) {
  return apiFetch<AuthUserDto>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function logout(refreshToken: string) {
  return apiFetch<{ ok: true }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

