import type { AuthProvider } from '@meets/shared';

export type VerifiedSocialProfile = {
  provider: AuthProvider;
  providerUserId: string;
  email?: string | null;
  emailVerified?: boolean;
  username?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};
