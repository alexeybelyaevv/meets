import type { CreateEventDto, EventDto } from "@meets/shared";
import { apiFetch } from "@/lib/api";

export function getEvents() {
  return apiFetch<EventDto[]>("/events");
}

export function createEvent(payload: CreateEventDto) {
  return apiFetch<EventDto>("/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
