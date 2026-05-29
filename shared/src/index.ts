export type AuthProvider = "apple" | "google" | "telegram";

export type UserDto = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};

export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUserDto = {
  user: UserDto;
  tokens: AuthTokensDto;
};

export type SocialAccountDto = {
  provider: AuthProvider;
  providerUserId: string;
  email?: string | null;
  username?: string | null;
};

export type EventCategory =
  | "coffee"
  | "bar"
  | "sport"
  | "walk"
  | "board_games"
  | "english_club";

export type EventDto = {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  startsAt: string;
  latitude: number;
  longitude: number;
  maxParticipants?: number;
};
