import type { SymbolViewProps } from "expo-symbols";
import type { TranslationKey } from "@/features/localization/localization";

export type EventCategoryOption = {
  icon: SymbolViewProps["name"];
  id: string;
  label: string;
  labelKey: Extract<TranslationKey, `category.${string}`>;
};

export const EVENT_CATEGORY_OPTIONS: EventCategoryOption[] = [
  {
    id: "coffee-chat",
    label: "Coffee & Chat",
    labelKey: "category.coffeeChat",
    icon: {
      ios: "cup.and.saucer.fill",
      android: "local_cafe",
      web: "local_cafe",
    },
  },
  {
    id: "walk",
    label: "Walk",
    labelKey: "category.walk",
    icon: {
      ios: "figure.walk",
      android: "directions_walk",
      web: "directions_walk",
    },
  },
  {
    id: "food",
    label: "Food",
    labelKey: "category.food",
    icon: { ios: "fork.knife", android: "restaurant", web: "restaurant" },
  },
  {
    id: "drinks",
    label: "Drinks",
    labelKey: "category.drinks",
    icon: { ios: "wineglass.fill", android: "local_bar", web: "local_bar" },
  },
  {
    id: "party-nightlife",
    label: "Party & Nightlife",
    labelKey: "category.partyNightlife",
    icon: {
      ios: "party.popper.fill",
      android: "nightlife",
      web: "nightlife",
    },
  },
  {
    id: "sports",
    label: "Sports",
    labelKey: "category.sports",
    icon: { ios: "figure.run", android: "sports_soccer", web: "sports_soccer" },
  },
  {
    id: "games",
    label: "Games",
    labelKey: "category.games",
    icon: {
      ios: "gamecontroller.fill",
      android: "sports_esports",
      web: "sports_esports",
    },
  },
  {
    id: "culture-events",
    label: "Culture & Events",
    labelKey: "category.cultureEvents",
    icon: {
      ios: "ticket.fill",
      android: "local_activity",
      web: "local_activity",
    },
  },
  {
    id: "study-coworking",
    label: "Study & Coworking",
    labelKey: "category.studyCoworking",
    icon: {
      ios: "laptopcomputer",
      android: "laptop",
      web: "laptop",
    },
  },
  {
    id: "outdoor",
    label: "Outdoor",
    labelKey: "category.outdoor",
    icon: { ios: "leaf.fill", android: "forest", web: "forest" },
  },
  {
    id: "networking",
    label: "Networking",
    labelKey: "category.networking",
    icon: {
      ios: "person.3.fill",
      android: "groups",
      web: "groups",
    },
  },
  {
    id: "other",
    label: "Other",
    labelKey: "category.other",
    icon: {
      ios: "square.grid.2x2.fill",
      android: "category",
      web: "category",
    },
  },
];
