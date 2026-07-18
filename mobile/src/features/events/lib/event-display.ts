import { EVENT_CATEGORY_OPTIONS } from "@/features/events/data/event-categories";
import type {
  Translate,
  TranslationKey,
} from "@/features/localization/localization";

const weekdayKeys: Record<string, TranslationKey> = {
  Friday: "date.friday",
  Monday: "date.monday",
  Saturday: "date.saturday",
  Sunday: "date.sunday",
  Thursday: "date.thursday",
  Tuesday: "date.tuesday",
  Wednesday: "date.wednesday",
};

export function localizeEventCategory(value: string, t: Translate) {
  const category = EVENT_CATEGORY_OPTIONS.find(
    (option) => option.id === value || option.label === value,
  );

  return category ? t(category.labelKey) : value;
}

export function localizeEventPrice(value: string, t: Translate) {
  switch (value) {
    case "Free":
      return t("common.free");
    case "Paid":
      return t("common.paid");
    case "Pay on site":
      return t("common.payOnSite");
    case "Host fee":
      return t("common.hostFee");
    default:
      return value;
  }
}

export function localizeEventTimeLabel(value: string, t: Translate) {
  const separatorIndex = value.indexOf(",");

  if (separatorIndex === -1) {
    return value;
  }

  const datePart = value.slice(0, separatorIndex);
  const rest = value.slice(separatorIndex);

  if (datePart === "Today") {
    return `${t("filters.today")}${rest}`;
  }

  if (datePart === "Tomorrow") {
    return `${t("filters.tomorrow")}${rest}`;
  }

  const weekdayKey = weekdayKeys[datePart];
  return weekdayKey ? `${t(weekdayKey)}${rest}` : value;
}
