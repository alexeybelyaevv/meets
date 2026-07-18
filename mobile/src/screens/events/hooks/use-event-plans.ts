import { useEffect, useMemo, useState } from "react";
import { getEvents } from "@/features/events/api/events-api";
import type { EventDto } from "@meets/shared";
import { featuredPlans } from "@/screens/main/data/featured-plans";
import { eventToFeaturedPlan } from "@/screens/main/lib/event-to-featured-plan";
import type { FeaturedPlan } from "@/screens/main/types";
import {
  APP_INTL_LOCALES,
  useLocalization,
} from "@/features/localization/localization";

export function useEventPlans() {
  const { locale, t } = useLocalization();
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
            error instanceof Error ? error.message : t("events.loadError"),
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
  }, [t]);

  const plans = useMemo<FeaturedPlan[]>(
    () =>
      events.length > 0
        ? events.map((event) =>
            eventToFeaturedPlan(event, {
              intlLocale: APP_INTL_LOCALES[locale],
              t,
            }),
          )
        : featuredPlans,
    [events, locale, t],
  );

  return {
    eventsError,
    loading,
    plans,
  };
}
