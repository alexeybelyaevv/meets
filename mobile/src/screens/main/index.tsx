import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import {
  Easing,
  runOnJS,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  APP_INTL_LOCALES,
  useLocalization,
} from "@/features/localization/localization";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { styles } from "./styles";
import { getEvents } from "@/features/events/api/events-api";
import type { EventDto } from "@meets/shared";
import {
  createDefaultFilterState,
  FiltersOverlay,
  getActiveFilterCount,
  getFilterSummary,
} from "./components/filters-overlay";
import { PlansDrawer } from "./components/plans-drawer";
import { Search } from "./components/search";
import { testEventPinImageDataUrls } from "./data/event-pin-images";
import { featuredPlans } from "./data/featured-plans";
import { eventToFeaturedPlan } from "./lib/event-to-featured-plan";
import { createMapHtml } from "./lib/map-html";

export default function MainScreen() {
  const { locale, t } = useLocalization();
  const mapRef = useRef<WebView>(null);
  const [events, setEvents] = useState<EventDto[]>([]);
  const [filters, setFilters] = useState(createDefaultFilterState);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const filtersProgress = useSharedValue(0);
  const filtersContentProgress = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const plans = useMemo(
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
  const mapHtml = useMemo(
    () => createMapHtml(plans, testEventPinImageDataUrls),
    [plans],
  );
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const activeFilterCount = getActiveFilterCount(filters);
  const filterSummary = getFilterSummary(filters, { locale, t });
  const topOverlayOffset = Math.max(insets.top + Spacing.two, 52);
  const drawerTopInset = topOverlayOffset + 58 + 16;
  const expandedDrawerSnapPoint = Math.max(220, windowHeight - drawerTopInset);
  const detailCollapsedSnapPoint = Math.min(
    520,
    Math.max(220, expandedDrawerSnapPoint - 120),
  );
  const snapPoints = useMemo(
    () =>
      selectedPlanId
        ? [detailCollapsedSnapPoint, expandedDrawerSnapPoint]
        : [220, expandedDrawerSnapPoint],
    [detailCollapsedSnapPoint, expandedDrawerSnapPoint, selectedPlanId],
  );
  const screenWidth = Math.min(windowWidth, MaxContentWidth);
  const searchBarWidth = Math.max(screenWidth - Spacing.three * 2, 0);
  const filtersBottomGap = Math.max(insets.bottom + Spacing.five, Spacing.five);
  const filtersExpandedHeight = Math.max(
    58,
    windowHeight - topOverlayOffset - filtersBottomGap,
  );
  useEffect(() => {
    let cancelled = false;

    getEvents()
      .then((nextEvents) => {
        if (!cancelled) {
          setEvents(nextEvents);
        }
      })
      .catch(() => {
        // Keep showing the local examples when the live feed is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMapMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        id?: unknown;
        type?: unknown;
      };

      if (
        message.type === "selectPlan" &&
        typeof message.id === "string" &&
        plans.some((plan) => plan.id === message.id)
      ) {
        setSelectedPlanId(message.id);
      }
    } catch {
      // Ignore messages not intended for this screen.
    }
  };
  const syncMapSelection = useCallback(() => {
    mapRef.current?.postMessage(
      JSON.stringify({
        id: selectedPlanId,
        type: "setSelectedPlan",
      }),
    );
  }, [selectedPlanId]);

  useEffect(() => {
    syncMapSelection();
  }, [syncMapSelection]);

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
        <View style={styles.mapLayer}>
          <WebView
            ref={mapRef}
            originWhitelist={["*"]}
            source={{ html: mapHtml, baseUrl: "https://basemaps.cartocdn.com" }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            mixedContentMode="always"
            allowsInlineMediaPlayback
            onLoadEnd={syncMapSelection}
            onMessage={handleMapMessage}
            style={styles.map}
          />
        </View>
        <Search
          activeFilterCount={activeFilterCount}
          filterSummary={filterSummary}
          openFilters={openFilters}
        />

        <PlansDrawer
          bottomInset={insets.bottom}
          drawerTopInset={drawerTopInset}
          onClearSelectedPlan={() => setSelectedPlanId(null)}
          onSelectPlan={setSelectedPlanId}
          plans={plans}
          selectedPlan={selectedPlan}
          selectedPlanId={selectedPlanId}
          snapPoints={snapPoints}
        />
        {filtersOpen && (
          <FiltersOverlay
            closeFilters={closeFilters}
            filters={filters}
            filtersContentProgress={filtersContentProgress}
            filtersExpandedHeight={filtersExpandedHeight}
            filtersProgress={filtersProgress}
            onApplyFilters={setFilters}
            searchSubtitle={filterSummary}
            searchBarWidth={searchBarWidth}
            topOverlayOffset={topOverlayOffset}
          />
        )}
        <BottomNavigation />
      </View>
    </ThemedView>
  );
}
