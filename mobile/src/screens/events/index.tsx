import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import {
  Easing,
  runOnJS,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomNavigation,
  BottomNavigationInset,
} from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { FiltersOverlay } from "@/screens/main/components/filters-overlay";
import type { FeaturedPlan } from "@/screens/main/types";
import { EventCard } from "./components/event-card";
import { EventsEmptyState } from "./components/events-empty-state";
import { EventsSearchBar } from "./components/events-search-bar";
import { useEventPlans } from "./hooks/use-event-plans";
import { eventsStyles as styles } from "./styles";

export function EventsScreen() {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtersProgress = useSharedValue(0);
  const filtersContentProgress = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { eventsError, plans } = useEventPlans();
  const filteredPlans = useFilteredPlans(plans, query);
  const topOverlayOffset = Math.max(insets.top + Spacing.two, 52);
  const screenWidth = Math.min(windowWidth, MaxContentWidth);
  const searchBarWidth = Math.max(screenWidth - Spacing.three * 2, 0);
  const filtersBottomGap = Math.max(insets.bottom + Spacing.five, Spacing.five);
  const filtersExpandedHeight = Math.max(
    58,
    windowHeight - topOverlayOffset - filtersBottomGap,
  );

  const openFilters = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFiltersOpen(true);
    filtersProgress.value = 0;
    filtersContentProgress.value = 0;
    filtersProgress.value = withTiming(1, {
      duration: 460,
      easing: Easing.bezier(0.2, 0.86, 0.2, 1),
    });
    filtersContentProgress.value = withDelay(
      250,
      withSpring(1, {
        damping: 20,
        mass: 0.68,
        stiffness: 150,
      }),
    );
  };

  const closeFilters = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    filtersContentProgress.value = withTiming(0, {
      duration: 130,
      easing: Easing.in(Easing.cubic),
    });
    filtersProgress.value = withDelay(
      52,
      withTiming(
        0,
        {
          duration: 360,
          easing: Easing.bezier(0.58, 0, 0.32, 1),
        },
        (finished) => {
          if (finished) {
            runOnJS(setFiltersOpen)(false);
          }
        },
      ),
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.screen}>
        <EventsSearchBar
          onChangeQuery={setQuery}
          onClearQuery={() => setQuery("")}
          onOpenFilters={openFilters}
          query={query}
          top={topOverlayOffset}
        />

        <View
          style={[
            styles.content,
            { paddingTop: topOverlayOffset + 58 + Spacing.three },
          ]}
        >
          <View style={styles.summaryRow}>
            <View>
              <ThemedText type="subtitle" style={styles.title}>
                Events
              </ThemedText>
              <ThemedText type="small" style={styles.subtitle}>
                {eventsError ? "Showing local examples" : "Live event feed"}
              </ThemedText>
            </View>
            <View style={styles.countPill}>
              <ThemedText type="smallBold" style={styles.countText}>
                {filteredPlans.length}
              </ThemedText>
            </View>
          </View>

          <FlatList
            contentContainerStyle={[
              styles.listContent,
              {
                paddingBottom:
                  BottomNavigationInset + insets.bottom + Spacing.four,
              },
            ]}
            data={filteredPlans}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<EventsEmptyState query={query} />}
            renderItem={({ item }) => (
              <EventCard
                onPress={() =>
                  router.push({
                    pathname: "/events/[eventId]",
                    params: { eventId: item.id },
                  })
                }
                plan={item}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {filtersOpen && (
          <FiltersOverlay
            closeFilters={closeFilters}
            filtersContentProgress={filtersContentProgress}
            filtersExpandedHeight={filtersExpandedHeight}
            filtersProgress={filtersProgress}
            searchTitle="Search events"
            searchBarWidth={searchBarWidth}
            submitLabel="Show events"
            topOverlayOffset={topOverlayOffset}
          />
        )}
        <BottomNavigation />
      </View>
    </ThemedView>
  );
}

function useFilteredPlans(plans: FeaturedPlan[], query: string) {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return plans;
    }

    return plans.filter((plan) =>
      [plan.title, plan.venue, plan.tag, plan.meta].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [plans, query]);
}
