import type { EventDto } from "@meets/shared";
import type { FeaturedPlan } from "../types";

export function eventToFeaturedPlan(event: EventDto): FeaturedPlan {
  const category = event.categories[0] ?? "Event";
  const attendeeCount = event.peopleAlreadyThere ?? 0;
  const capacity = event.capacity ?? Math.max(attendeeCount, 1);
  const startsAt = new Date(event.startsAt);
  const dateLabel = Number.isNaN(startsAt.getTime())
    ? "Date"
    : startsAt.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
  const timeLabel = Number.isNaN(startsAt.getTime())
    ? "Time"
    : startsAt.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });

  return {
    id: event.id,
    title: event.title,
    venue: event.locationName,
    meta: `${dateLabel} · ${timeLabel} · ${attendeeCount} going`,
    tag: category,
    price:
      event.priceType === "free"
        ? "Free"
        : event.priceAmount
          ? `${event.priceAmount} ${event.currency}`
          : "Paid",
    description: event.description || "No description yet.",
    host: "Meets host",
    hostRole: event.locationAddress || "Event organizer",
    hostInitials: "MH",
    attendeeCount,
    capacity,
    timeLabel: `${dateLabel}, ${timeLabel}`,
    latitude: event.latitude,
    longitude: event.longitude,
  };
}
