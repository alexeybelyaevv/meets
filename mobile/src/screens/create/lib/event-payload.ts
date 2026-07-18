import type { CreateEventDto } from "@meets/shared";
import { defaultValues } from "../data/form-options";
import type { EventFormValues } from "../types";

export function toCreateEventDto(values: EventFormValues): CreateEventDto {
  return {
    title: values.title,
    description: values.description || null,
    categories: values.categories,
    photos: values.photos,
    startsAt: toStartsAt(values.date, values.time),
    locationName: values.locationName,
    locationAddress: values.locationAddress || null,
    latitude:
      Number(values.locationLatitude) || Number(defaultValues.locationLatitude),
    longitude:
      Number(values.locationLongitude) ||
      Number(defaultValues.locationLongitude),
    capacity: parseOptionalNumber(values.capacity),
    peopleAlreadyThere: parseOptionalNumber(values.peopleAlreadyThere),
    priceType: values.priceType === "free" ? "free" : "paid",
    priceAmount:
      values.priceType === "host-fee"
        ? parseMoneyAmount(values.priceAmount)
        : null,
    currency: "EUR",
    bringItems: values.bringItems || null,
    minAge: null,
    maxAge: null,
  };
}

function toStartsAt(date: string, time: string) {
  const dateValue = date.trim();
  const timeValue = time.trim();

  if (!dateValue || !timeValue) {
    return "";
  }

  const isoLikeDate = /^\d{4}-\d{2}-\d{2}$/.test(dateValue);
  const twentyFourHourTime = /^\d{2}:\d{2}$/.test(timeValue);

  if (isoLikeDate && twentyFourHourTime) {
    return new Date(`${dateValue}T${timeValue}:00`).toISOString();
  }

  const parsedDate = new Date(`${dateValue} ${timeValue}`);
  return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString();
}

function parseOptionalNumber(value: string) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function parseMoneyAmount(value: string) {
  const normalizedValue = value.replace(",", ".").replace(/[^\d.]/g, "");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}
