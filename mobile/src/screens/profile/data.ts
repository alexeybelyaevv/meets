export type ProfileSocial = {
  handle: string;
  label: string;
  type: "instagram" | "telegram";
};

export type PastProfileEvent = {
  id: string;
  attendees: number;
  date: string;
  title: string;
  venue: string;
};

export const profile = {
  name: "Alex",
  initials: "AB",
  location: "Bratislava · Old Town",
  role: "Community host",
  bio:
    "I like low-pressure plans: coffee walks, galleries, rooftops, and small groups where people can actually talk.",
  memberSince: "Member since 2026",
  socials: [
    { type: "instagram", label: "Instagram", handle: "@alex.meets" },
    { type: "telegram", label: "Telegram", handle: "@alex_meets" },
  ] satisfies ProfileSocial[],
  interests: [
    "Coffee walks",
    "Startups",
    "Gallery nights",
    "Board games",
    "Local food",
    "Danube sunsets",
  ],
  stats: [
    { label: "Hosted", value: "18" },
    { label: "Joined", value: "42" },
    { label: "Rating", value: "4.9" },
  ],
  details: [
    { label: "Neighborhood", value: "Old Town / Sky Park" },
    { label: "Languages", value: "English, Russian, Slovak basics" },
    { label: "Group vibe", value: "Small groups, relaxed pace" },
  ],
  trust: [
    "Usually replies within a day",
    "Keeps plans beginner friendly",
    "Prefers public places for first meetups",
  ],
  pastEvents: [
    {
      id: "gallery-night",
      attendees: 16,
      date: "Jun 12",
      title: "Small gallery walk",
      venue: "Gallery Nedbalka",
    },
    {
      id: "founders-coffee",
      attendees: 9,
      date: "May 28",
      title: "Founders coffee chat",
      venue: "Urban House",
    },
    {
      id: "rooftop-games",
      attendees: 14,
      date: "May 10",
      title: "Rooftop board games",
      venue: "Sky Park",
    },
  ] satisfies PastProfileEvent[],
};
