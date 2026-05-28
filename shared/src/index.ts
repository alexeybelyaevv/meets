export type AuthProvider = "google" | "apple" | "facebook";

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

export type UserDto = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};
