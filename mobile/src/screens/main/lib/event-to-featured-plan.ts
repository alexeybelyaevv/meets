import type { EventDto } from "@meets/shared";
import { EVENT_CATEGORY_OPTIONS } from "@/features/events/data/event-categories";
import type { Translate } from "@/features/localization/localization";
import type { FeaturedPlan } from "../types";

export function eventToFeaturedPlan(
  event: EventDto,
  localization: { intlLocale: string; t: Translate },
): FeaturedPlan {
  const { intlLocale, t } = localization;
  const categoryValue = event.categories[0];
  const categoryOption = EVENT_CATEGORY_OPTIONS.find(
    (option) => option.id === categoryValue,
  );
  const category = categoryOption
    ? t(categoryOption.labelKey)
    : (categoryValue ?? t("common.event"));
  const attendeeCount = event.peopleAlreadyThere ?? 0;
  const capacity = event.capacity ?? Math.max(attendeeCount, 1);
  const startsAt = new Date(event.startsAt);
  const dateLabel = Number.isNaN(startsAt.getTime())
    ? t("create.date")
    : startsAt.toLocaleDateString(intlLocale, {
        month: "short",
        day: "numeric",
      });
  const timeLabel = Number.isNaN(startsAt.getTime())
    ? t("create.time")
    : startsAt.toLocaleTimeString(intlLocale, {
        hour: "2-digit",
        minute: "2-digit",
      });

  return {
    id: event.id,
    title: event.title,
    venue: event.locationName,
    meta: `${dateLabel} · ${timeLabel} · ${t("events.going", {
      count: attendeeCount,
    })}`,
    tag: category,
    price:
      event.priceType === "free"
        ? t("common.free")
        : event.priceAmount
          ? `${event.priceAmount} ${event.currency}`
          : t("common.paid"),
    description: event.description || t("create.noDescription"),
    host: t("events.meetsHost"),
    hostRole: event.locationAddress || t("events.organizer"),
    hostInitials: "MH",
    attendeeCount,
    capacity,
    timeLabel: `${dateLabel}, ${timeLabel}`,
    latitude: event.latitude,
    longitude: event.longitude,
  };
}
