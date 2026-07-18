export type EventDateTimeMode = "date" | "time";

export function parseEventDateTimeValue(
  value: string | undefined,
  mode: EventDateTimeMode,
) {
  const normalizedValue = value ?? "";

  if (mode === "date") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedValue);

    if (match) {
      const [, year, month, day] = match;
      const parsedDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        12,
      );

      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  } else {
    const match = /^(\d{2}):(\d{2})$/.exec(normalizedValue);

    if (match) {
      const [, hours, minutes] = match;
      const parsedTime = new Date();
      parsedTime.setHours(Number(hours), Number(minutes), 0, 0);

      if (!Number.isNaN(parsedTime.getTime())) {
        return parsedTime;
      }
    }
  }

  const now = new Date();

  if (mode === "date") {
    now.setHours(12, 0, 0, 0);
    return now;
  }

  now.setSeconds(0, 0);
  return now;
}

export function toEventDateTimeValue(
  value: Date,
  mode: EventDateTimeMode,
) {
  if (mode === "time") {
    return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
  }

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
    value.getDate(),
  )}`;
}

export function formatEventDate(
  value: string | undefined,
  locale?: string,
  emptyLabel = "Choose date",
) {
  if (!value) {
    return emptyLabel;
  }

  const date = parseEventDateTimeValue(value, "date");
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatEventTime(
  value: string | undefined,
  locale?: string,
  emptyLabel = "Choose time",
) {
  if (!value) {
    return emptyLabel;
  }

  const time = parseEventDateTimeValue(value, "time");
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(time);
}

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
