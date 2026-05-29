import { useCallback, useEffect, useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import type { AuthUserDto } from '@meets/shared';
import { API_URL } from '@/lib/api';
import { clearTokens, getTokens, saveTokens } from '@/lib/token-storage';
import { loginWithApple, loginWithGoogle, logout } from '../api/auth-api';

type AuthAction = 'apple' | 'google' | 'telegram' | 'logout';
type GoogleSignInResult =
  | {
      type: 'success';
      data: {
        idToken?: string | null;
      };
    }
  | {
      type: string;
      data?: {
        idToken?: string | null;
      } | null;
    };

type NativeGoogleSignin = {
  configure: (options: { iosClientId?: string; webClientId?: string }) => void;
  hasPlayServices: (options: { showPlayServicesUpdateDialog: boolean }) => Promise<boolean>;
  signIn: () => Promise<GoogleSignInResult>;
};

const googleSignInRequiresNativeBuild =
  Platform.OS === 'web' || Constants.appOwnership === 'expo';

let googleSigninPromise: Promise<NativeGoogleSignin> | null = null;

async function getGoogleSignin() {
  if (googleSignInRequiresNativeBuild) {
    throw new Error('Google Sign-In requires an Expo development build, not Expo Go.');
  }

  googleSigninPromise ??= import('@react-native-google-signin/google-signin')
    .then((googleSigninModule) => {
      const googleSignin = googleSigninModule.GoogleSignin as NativeGoogleSignin;
      googleSignin.configure({
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });
      return googleSignin;
    })
    .catch((error: unknown) => {
      googleSigninPromise = null;
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('RNGoogleSignin')) {
        throw new Error('Google Sign-In requires an Expo development build, not Expo Go.');
      }
      throw error;
    });

  return googleSigninPromise;
}

export function useSocialAuth() {
  const [loading, setLoading] = useState<AuthAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUserDto | null>(null);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const isGoogleAvailable = !googleSignInRequiresNativeBuild;

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable).catch(() => {
        setIsAppleAvailable(false);
      });
    }
  }, []);

  const runAuthAction = useCallback(async <T>(action: AuthAction, task: () => Promise<T>) => {
    setLoading(action);
    setError(null);

    try {
      return await task();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Authentication failed';
      setError(message);
      throw authError;
    } finally {
      setLoading(null);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    return runAuthAction('apple', async () => {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token');
      }

      const response = await loginWithApple({
        identityToken: credential.identityToken,
        fullName: {
          givenName: credential.fullName?.givenName ?? undefined,
          familyName: credential.fullName?.familyName ?? undefined,
        },
      });

      await saveTokens(response.tokens);
      setAuthUser(response);
      return response;
    });
  }, [runAuthAction]);

  const signInWithGoogle = useCallback(async () => {
    return runAuthAction('google', async () => {
      const GoogleSignin = await getGoogleSignin();

      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Native Google Sign-In requires a development build; it does not run in Expo Go.
      const result = await GoogleSignin.signIn();
      if (result.type !== 'success' || !result.data.idToken) {
        throw new Error('Google did not return an ID token');
      }

      const response = await loginWithGoogle({ idToken: result.data.idToken });
      await saveTokens(response.tokens);
      setAuthUser(response);
      return response;
    });
  }, [runAuthAction]);

  const startTelegramLogin = useCallback(async () => {
    return runAuthAction('telegram', async () => {
      const telegramLoginUrl =
        process.env.EXPO_PUBLIC_TELEGRAM_LOGIN_URL ?? `${API_URL}/auth/telegram/start`;

      // Telegram Login is a web redirect flow. The production path should redirect back
      // to the app with a temporary code, then exchange it with the backend for tokens.
      await WebBrowser.openBrowserAsync(telegramLoginUrl);
    });
  }, [runAuthAction]);

  const signOut = useCallback(async () => {
    return runAuthAction('logout', async () => {
      const tokens = await getTokens();
      try {
        if (tokens?.refreshToken) {
          await logout(tokens.refreshToken);
        }
      } finally {
        await clearTokens();
        setAuthUser(null);
      }
    });
  }, [runAuthAction]);

  return {
    authUser,
    error,
    loading,
    isAppleAvailable,
    isGoogleAvailable,
    signInWithApple,
    signInWithGoogle,
    startTelegramLogin,
    signOut,
  };
}
