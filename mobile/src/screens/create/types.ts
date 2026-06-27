import type { SymbolViewProps } from "expo-symbols";

export type PriceType = "free" | "paid";

export type EventFormValues = {
  title: string;
  description: string;
  categories: string[];
  photos: string[];
  date: string;
  time: string;
  locationName: string;
  locationAddress: string;
  locationLatitude: string;
  locationLongitude: string;
  capacity: string;
  peopleAlreadyThere: string;
  priceType: PriceType;
  priceAmount: string;
  bringItems: string;
  hasAgeLimit: boolean;
  minAge: number;
  maxAge: number;
};

export type Step = {
  id: string;
  title: string;
  eyebrow: string;
  icon: SymbolViewProps["name"];
};

export type LocationSuggestion = {
  address: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  name: string;
  provider: "osm";
};
