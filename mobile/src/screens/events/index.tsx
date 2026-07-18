import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  FadeIn,
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
import { useLocalization } from "@/features/localization/localization";
import {
  createDefaultFilterState,
  FiltersOverlay,
  getActiveFilterCount,
  getFilterSummary,
} from "@/screens/main/components/filters-overlay";
import { getTestEventImage } from "@/screens/main/data/event-images";
import { EventCard } from "./components/event-card";
import { EventsEmptyState } from "./components/events-empty-state";
import { EventsFilterBar } from "./components/events-filter-bar";
import { useEventPlans } from "./hooks/use-event-plans";
import { eventsStyles as styles } from "./styles";

export function EventsScreen() {
  const router = useRouter();
  const { locale, t } = useLocalization();
  const [filters, setFilters] = useState(createDefaultFilterState);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersProgress = useSharedValue(0);
  const filtersContentProgress = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { eventsError, plans } = useEventPlans();
  const activeFilterCount = getActiveFilterCount(filters);
  const filterSummary = getFilterSummary(filters, {
    includeRadius: true,
    locale,
    t,
  });
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
        <EventsFilterBar
          activeFilterCount={activeFilterCount}
          filterSummary={filterSummary}
          onOpenFilters={openFilters}
          top={topOverlayOffset}
        />

        <View
          style={[
            styles.content,
            { paddingTop: topOverlayOffset + 58 + Spacing.four },
          ]}
        >
          <FlatList
            contentContainerStyle={[
              styles.listContent,
              {
                paddingBottom:
                  BottomNavigationInset + insets.bottom + Spacing.four,
              },
            ]}
            data={plans}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <EventsListHeader eventsError={eventsError} />
            }
            ListEmptyComponent={<EventsEmptyState />}
            renderItem={({ index, item }) => (
              <EventCard
                imageSource={getTestEventImage(
                  plans.findIndex((plan) => plan.id === item.id),
                )}
                index={index}
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
            filters={filters}
            filtersContentProgress={filtersContentProgress}
            filtersExpandedHeight={filtersExpandedHeight}
            filtersProgress={filtersProgress}
            onApplyFilters={setFilters}
            searchSubtitle={filterSummary}
            searchTitle={t("filters.eventsNearby")}
            searchBarWidth={searchBarWidth}
            showRadiusFilter
            topOverlayOffset={topOverlayOffset}
          />
        )}
        <BottomNavigation />
      </View>
    </ThemedView>
  );
}

function EventsListHeader({
  eventsError,
}: {
  eventsError: string | null;
}) {
  const { t } = useLocalization();

  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.listHeader}>
      <ThemedText type="subtitle" style={styles.title}>
        {t("events.discoverNearby")}
      </ThemedText>
      <ThemedText type="small" style={styles.subtitle} numberOfLines={1}>
        {eventsError
          ? t("events.feedReconnecting")
          : t("events.subtitle")}
      </ThemedText>
    </Animated.View>
  );
}
