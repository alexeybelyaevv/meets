import { useEffect, useMemo, useState } from "react";
import { getEvents } from "@/features/events/api/events-api";
import type { EventDto } from "@meets/shared";
import { featuredPlans } from "@/screens/main/data/featured-plans";
import { eventToFeaturedPlan } from "@/screens/main/lib/event-to-featured-plan";
import type { FeaturedPlan } from "@/screens/main/types";

export function useEventPlans() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getEvents()
      .then((nextEvents) => {
        if (!cancelled) {
          setEvents(nextEvents);
          setEventsError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setEventsError(
            error instanceof Error ? error.message : "Could not load events",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const plans = useMemo<FeaturedPlan[]>(
    () => (events.length > 0 ? events.map(eventToFeaturedPlan) : featuredPlans),
    [events],
  );

  return {
    eventsError,
    loading,
    plans,
  };
}
