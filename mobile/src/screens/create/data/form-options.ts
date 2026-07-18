import type { EventFormValues, Step } from "../types";

export const steps: Step[] = [
  {
    id: "basics",
    eyebrow: "Step 1",
    title: "Basics",
    icon: { ios: "text.alignleft", android: "subject", web: "subject" },
  },
  {
    id: "place",
    eyebrow: "Step 2",
    title: "Place",
    icon: {
      ios: "mappin.and.ellipse",
      android: "location_on",
      web: "location_on",
    },
  },
  {
    id: "people",
    eyebrow: "Step 3",
    title: "People",
    icon: { ios: "person.2.fill", android: "groups", web: "groups" },
  },
  {
    id: "review",
    eyebrow: "Step 4",
    title: "Review",
    icon: {
      ios: "checkmark.circle.fill",
      android: "check_circle",
      web: "check_circle",
    },
  },
];

export const defaultValues: EventFormValues = {
  title: "",
  description: "",
  categories: ["outdoor"],
  photos: [],
  date: "",
  time: "",
  locationName: "",
  locationAddress: "",
  locationLatitude: "48.1452",
  locationLongitude: "17.1164",
  capacity: "8",
  peopleAlreadyThere: "1",
  priceType: "free",
  priceAmount: "",
  bringItems: "",
};
