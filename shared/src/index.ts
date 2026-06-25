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

export type EventCategory = string;

export type EventPriceType = "free" | "paid";

export type CreateEventDto = {
  title: string;
  description?: string | null;
  categories: EventCategory[];
  photos?: string[];
  startsAt: string;
  locationName: string;
  locationAddress?: string | null;
  latitude: number;
  longitude: number;
  capacity?: number | null;
  peopleAlreadyThere?: number | null;
  priceType: EventPriceType;
  priceAmount?: number | null;
  currency?: "EUR";
  bringItems?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
};

export type EventDto = {
  id: string;
  title: string;
  description?: string | null;
  categories: EventCategory[];
  photos: string[];
  startsAt: string;
  locationName: string;
  locationAddress?: string | null;
  capacity?: number | null;
  peopleAlreadyThere: number;
  priceType: EventPriceType;
  priceAmount?: number | null;
  currency: "EUR";
  bringItems?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
};
