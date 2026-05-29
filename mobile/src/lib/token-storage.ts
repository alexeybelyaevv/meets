import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthTokensDto } from '@meets/shared';

const accessTokenKey = 'meets.accessToken';
const refreshTokenKey = 'meets.refreshToken';

const webStorage = {
  async getItem(key: string) {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  async deleteItem(key: string) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

const nativeStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  deleteItem: SecureStore.deleteItemAsync,
};

const storage = Platform.OS === 'web' ? webStorage : nativeStorage;

export async function getTokens(): Promise<AuthTokensDto | null> {
  const [accessToken, refreshToken] = await Promise.all([
    storage.getItem(accessTokenKey),
    storage.getItem(refreshTokenKey),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export async function saveTokens(tokens: AuthTokensDto) {
  await Promise.all([
    storage.setItem(accessTokenKey, tokens.accessToken),
    storage.setItem(refreshTokenKey, tokens.refreshToken),
  ]);
}

export async function clearTokens() {
  await Promise.all([storage.deleteItem(accessTokenKey), storage.deleteItem(refreshTokenKey)]);
}
