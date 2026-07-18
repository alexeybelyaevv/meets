import type { SymbolViewProps } from "expo-symbols";

export type EventCategoryOption = {
  icon: SymbolViewProps["name"];
  id: string;
  label: string;
};

export const EVENT_CATEGORY_OPTIONS: EventCategoryOption[] = [
  {
    id: "coffee-chat",
    label: "Coffee & Chat",
    icon: {
      ios: "cup.and.saucer.fill",
      android: "local_cafe",
      web: "local_cafe",
    },
  },
  {
    id: "walk",
    label: "Walk",
    icon: {
      ios: "figure.walk",
      android: "directions_walk",
      web: "directions_walk",
    },
  },
  {
    id: "food",
    label: "Food",
    icon: { ios: "fork.knife", android: "restaurant", web: "restaurant" },
  },
  {
    id: "drinks",
    label: "Drinks",
    icon: { ios: "wineglass.fill", android: "local_bar", web: "local_bar" },
  },
  {
    id: "party-nightlife",
    label: "Party & Nightlife",
    icon: {
      ios: "party.popper.fill",
      android: "nightlife",
      web: "nightlife",
    },
  },
  {
    id: "sports",
    label: "Sports",
    icon: { ios: "figure.run", android: "sports_soccer", web: "sports_soccer" },
  },
  {
    id: "games",
    label: "Games",
    icon: {
      ios: "gamecontroller.fill",
      android: "sports_esports",
      web: "sports_esports",
    },
  },
  {
    id: "culture-events",
    label: "Culture & Events",
    icon: {
      ios: "ticket.fill",
      android: "local_activity",
      web: "local_activity",
    },
  },
  {
    id: "study-coworking",
    label: "Study & Coworking",
    icon: {
      ios: "laptopcomputer",
      android: "laptop",
      web: "laptop",
    },
  },
  {
    id: "outdoor",
    label: "Outdoor",
    icon: { ios: "leaf.fill", android: "forest", web: "forest" },
  },
  {
    id: "networking",
    label: "Networking",
    icon: {
      ios: "person.3.fill",
      android: "groups",
      web: "groups",
    },
  },
  {
    id: "other",
    label: "Other",
    icon: {
      ios: "square.grid.2x2.fill",
      android: "category",
      web: "category",
    },
  },
];
