import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomNavigation,
  BottomNavigationInset,
} from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { Search } from "./components/search";

export const Grapefruit = "#FF5A5F";
export const GrapefruitSoft = "#FFE6E3";
export const WarmSurface = "#FFFCFB";
export const WarmGray = "#F4F1EF";
export const WarmBorder = "#E8E2DF";
export const Charcoal = "#201A1A";
export const MutedText = "#766F6B";

const featuredPlans = [
  {
    id: "sunset",
    title: "Sunset picnic by the Danube",
    venue: "Tyrsovo nabrezie",
    meta: "Today · 19:00 · 24 going",
    tag: "Outdoor",
    price: "Free",
    description:
      "Bring a blanket, snacks, and something easy to share. We will sit by the river, watch the sunset, and keep it relaxed.",
    host: "Mia",
    hostRole: "Local guide",
    hostInitials: "MS",
    attendeeCount: 24,
    capacity: 32,
    timeLabel: "Today, 19:00",
    latitude: 48.1377,
    longitude: 17.1153,
  },
  {
    id: "coffee",
    title: "Founders coffee chat",
    venue: "Urban House",
    meta: "Tomorrow · 10:30 · 8 going",
    tag: "Networking",
    price: "€4",
    description:
      "A small morning table for people building products, looking for feedback, or just wanting sharper conversation over coffee.",
    host: "Adam",
    hostRole: "Startup operator",
    hostInitials: "AK",
    attendeeCount: 8,
    capacity: 12,
    timeLabel: "Tomorrow, 10:30",
    latitude: 48.1446,
    longitude: 17.1125,
  },
  {
    id: "gallery",
    title: "Small gallery walk",
    venue: "Gallery Nedbalka",
    meta: "Friday · 18:00 · 16 going",
    tag: "Culture",
    price: "€7",
    description:
      "A slow gallery walk with a quick drink after. No art background needed, just curiosity and a comfortable pace.",
    host: "Nina",
    hostRole: "Design student",
    hostInitials: "NV",
    attendeeCount: 16,
    capacity: 20,
    timeLabel: "Friday, 18:00",
    latitude: 48.1443,
    longitude: 17.113,
  },
  {
    id: "rooftop",
    title: "Rooftop board games",
    venue: "Sky Park",
    meta: "Saturday · 20:00 · 12 going",
    tag: "Social",
    price: "€5",
    description:
      "Casual board games on the rooftop. We will keep the games light, social, and beginner friendly.",
    host: "Leo",
    hostRole: "Community host",
    hostInitials: "LD",
    attendeeCount: 12,
    capacity: 18,
    timeLabel: "Saturday, 20:00",
    latitude: 48.1439,
    longitude: 17.1239,
  },
];

const mapPoints = JSON.stringify(
  featuredPlans.map(({ id, latitude, longitude }) => ({
    id,
    latitude,
    longitude,
  })),
);

const mapHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <style>
      html, body, #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #f4f1ef;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .leaflet-container {
        background: #f4f1ef;
      }

      .leaflet-control-attribution {
        font-size: 10px;
      }

      .event-marker-shell {
        background: transparent;
        border: 0;
        opacity: 1;
        transition: none;
        will-change: transform;
      }

      .leaflet-marker-icon.event-marker-shell {
        opacity: 1;
      }

      .event-marker {
        position: relative;
        width: 34px;
        height: 46px;
      }

      .event-marker__icon {
        position: relative;
        z-index: 2;
        display: block;
        width: 34px;
        height: 46px;
        filter: drop-shadow(0 7px 8px rgba(32, 26, 26, 0.18));
      }

      .event-marker__halo {
        position: absolute;
        left: 6px;
        top: 6px;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: rgba(255, 90, 95, 0.1);
        box-shadow: 0 0 0 5px rgba(255, 90, 95, 0.05);
        z-index: -1;
      }

      .event-marker__pulse {
        position: absolute;
        left: 17px;
        top: 40px;
        width: 8px;
        height: 8px;
        margin-left: -4px;
        margin-top: -4px;
        border-radius: 999px;
        background: rgba(255, 90, 95, 0.38);
        pointer-events: none;
        z-index: 1;
      }

      .event-marker__pulse::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: rgba(255, 90, 95, 0.34);
        animation: markerPulse 1.8s ease-out infinite;
      }

      @keyframes markerPulse {
        0% {
          opacity: 0.7;
          transform: scale(0.8);
        }

        70% {
          opacity: 0;
          transform: scale(3.2);
        }

        100% {
          opacity: 0;
          transform: scale(3.2);
        }
      }

    </style>
  </head>

  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map', {
        zoomControl: false,
        attributionControl: true,
        center: [48.1452, 17.1164],
        zoom: 14,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map);

      const points = ${mapPoints};

      points.forEach((point) => {
        const icon = L.divIcon({
          className: 'event-marker-shell',
          iconSize: [34, 46],
          iconAnchor: [17, 40],
          popupAnchor: [0, -36],
          html:
            '<div class="event-marker">' +
              '<div class="event-marker__halo"></div>' +
              '<div class="event-marker__pulse"></div>' +
              '<svg class="event-marker__icon" viewBox="0 0 34 46" aria-hidden="true">' +
                '<path d="M17 2.5C9.8 2.5 4 8.3 4 15.5c0 9.3 10.5 21 11.8 22.4 0.6 0.7 1.8 0.7 2.4 0C19.5 36.5 30 24.8 30 15.5 30 8.3 24.2 2.5 17 2.5Z" fill="#FF5A5F" stroke="#FFFCFB" stroke-width="2.8" />' +
                '<circle cx="17" cy="15.8" r="6.2" fill="#FFFCFB" />' +
                '<circle cx="17" cy="15.8" r="2.9" fill="#FFE6E3" />' +
              '</svg>' +
            '</div>',
        });

        L.marker([point.latitude, point.longitude], { icon })
          .addTo(map)
          .on('click', () => {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'selectPlan',
              id: point.id,
            }));
          });
      });

      if (points.length > 0) {
        const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]));
        map.fitBounds(bounds, {
          paddingTopLeft: [52, 118],
          paddingBottomRight: [52, 270],
          maxZoom: 15,
        });
      }

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    </script>
  </body>
</html>`;

function useStaggeredFilterStyle(progress: SharedValue<number>, start: number) {
  const end = start + 0.28;

  return useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, start, end, 1], [0, 0, 1, 1]),
  }));
}

export default function MainScreen() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const filtersProgress = useSharedValue(0);
  const filtersContentProgress = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const selectedPlan =
    featuredPlans.find((plan) => plan.id === selectedPlanId) ?? null;
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
  const planListStyle = useMemo(
    () => [
      styles.planList,
      { paddingBottom: BottomNavigationInset + insets.bottom + Spacing.five },
    ],
    [insets.bottom],
  );
  const handleMapMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        id?: unknown;
        type?: unknown;
      };

      if (
        message.type === "selectPlan" &&
        typeof message.id === "string" &&
        featuredPlans.some((plan) => plan.id === message.id)
      ) {
        setSelectedPlanId(message.id);
      }
    } catch {
      // Ignore messages not intended for this screen.
    }
  };
  const filtersMorphSurfaceAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(filtersProgress.value, [0, 0.05, 1], [0, 1, 1]),
    left: Spacing.three,
    top: topOverlayOffset,
    width: searchBarWidth,
    height: interpolate(
      filtersProgress.value,
      [0, 1],
      [58, filtersExpandedHeight],
    ),
    borderRadius: interpolate(filtersProgress.value, [0, 1], [29, 30]),
  }));
  const filtersGlowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(filtersProgress.value, [0, 0.28, 1], [0, 0.16, 0]),
    left: Spacing.three - 4,
    top: topOverlayOffset - 4,
    width: searchBarWidth + 8,
    height: interpolate(
      filtersProgress.value,
      [0, 1],
      [66, filtersExpandedHeight + 8],
    ),
    borderRadius: interpolate(filtersProgress.value, [0, 1], [33, 34]),
  }));
  const filtersPanelFrameAnimatedStyle = useAnimatedStyle(() => ({
    left: Spacing.three,
    top: topOverlayOffset,
    width: searchBarWidth,
    height: interpolate(
      filtersProgress.value,
      [0, 1],
      [58, filtersExpandedHeight],
    ),
    borderRadius: interpolate(filtersProgress.value, [0, 1], [29, 30]),
  }));
  const filtersBarGhostAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(filtersProgress.value, [0, 0.18, 0.34], [1, 0.58, 0]),
    transform: [
      {
        scale: interpolate(filtersProgress.value, [0, 0.34], [1, 0.96]),
      },
    ],
  }));
  const filtersContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filtersContentProgress.value,
  }));
  const filtersSubmitAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(filtersContentProgress.value, [0, 0.72, 1], [0, 0, 1]),
  }));
  const filtersHeroAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.06,
  );
  const whenSectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.16,
  );
  const categorySectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.24,
  );
  const priceSectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.32,
  );
  const sizeSectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.4,
  );
  const moreSectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.48,
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
        <View style={styles.mapLayer}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: mapHtml, baseUrl: "https://basemaps.cartocdn.com" }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            mixedContentMode="always"
            allowsInlineMediaPlayback
            onMessage={handleMapMessage}
            style={styles.map}
          />
        </View>
        <Search openFilters={openFilters} />

        <BottomSheet
          key={selectedPlanId ? "plan-details" : "plan-list"}
          enablePanDownToClose={Boolean(selectedPlanId)}
          enableDynamicSizing={false}
          index={0}
          onAnimate={(_, toIndex) => {
            if (selectedPlanId && toIndex === -1) {
              setSelectedPlanId(null);
            }
          }}
          onClose={() => {
            if (selectedPlanId) {
              setSelectedPlanId(null);
            }
          }}
          snapPoints={snapPoints}
          topInset={drawerTopInset}
          backgroundStyle={[
            styles.drawerBackground,
            {
              backgroundColor: WarmSurface,
              borderColor: WarmBorder,
            },
          ]}
          handleStyle={styles.drawerHandleArea}
          handleIndicatorStyle={styles.drawerHandle}
          style={styles.drawer}
        >
          {selectedPlan ? (
            <>
              <View style={styles.detailHeaderFixed}>
                <View style={styles.detailHeaderTitleBlock}>
                  <ThemedText type="smallBold" style={styles.planTag}>
                    {selectedPlan.tag} · {selectedPlan.price}
                  </ThemedText>
                  <ThemedText
                    type="subtitle"
                    style={styles.detailTitle}
                    numberOfLines={2}
                  >
                    {selectedPlan.title}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={styles.detailMeta}
                    numberOfLines={1}
                  >
                    {selectedPlan.venue} · {selectedPlan.meta}
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityLabel="Close plan details"
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => setSelectedPlanId(null)}
                  style={({ pressed }) => [
                    styles.detailCloseButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: "xmark",
                      android: "close",
                      web: "close",
                    }}
                    size={18}
                    tintColor={Charcoal}
                    weight="bold"
                  />
                </Pressable>
              </View>

              <BottomSheetScrollView
                contentContainerStyle={[
                  styles.detailContent,
                  {
                    paddingBottom:
                      BottomNavigationInset + insets.bottom + Spacing.four,
                  },
                ]}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.detailPhoto}>
                  <View style={styles.detailPhotoBadge}>
                    <ThemedText
                      type="smallBold"
                      style={styles.detailPhotoBadgeText}
                    >
                      {selectedPlan.tag}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText type="default" style={styles.detailDescription}>
                  {selectedPlan.description}
                </ThemedText>

                <View style={styles.detailStatsRow}>
                  <View style={styles.detailStat}>
                    <SymbolView
                      name={{
                        ios: "person.2.fill",
                        android: "groups",
                        web: "groups",
                      }}
                      size={18}
                      tintColor={Grapefruit}
                      weight="bold"
                    />
                    <View style={styles.detailStatTextBlock}>
                      <ThemedText
                        type="smallBold"
                        style={styles.detailStatValue}
                      >
                        {selectedPlan.attendeeCount}/{selectedPlan.capacity}
                      </ThemedText>
                      <ThemedText type="small" style={styles.detailStatLabel}>
                        people going
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.detailStat}>
                    <SymbolView
                      name={{
                        ios: "clock.fill",
                        android: "schedule",
                        web: "schedule",
                      }}
                      size={18}
                      tintColor={Grapefruit}
                      weight="bold"
                    />
                    <View style={styles.detailStatTextBlock}>
                      <ThemedText
                        type="smallBold"
                        style={styles.detailStatValue}
                      >
                        {selectedPlan.timeLabel}
                      </ThemedText>
                      <ThemedText type="small" style={styles.detailStatLabel}>
                        starts
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={styles.hostPanel}>
                  <View style={styles.hostAvatar}>
                    <ThemedText type="smallBold" style={styles.hostAvatarText}>
                      {selectedPlan.hostInitials}
                    </ThemedText>
                  </View>
                  <View style={styles.hostTextBlock}>
                    <ThemedText type="small" style={styles.hostEyebrow}>
                      Hosted by
                    </ThemedText>
                    <ThemedText type="default" style={styles.hostName}>
                      {selectedPlan.host}
                    </ThemedText>
                    <ThemedText type="small" style={styles.hostRole}>
                      {selectedPlan.hostRole}
                    </ThemedText>
                  </View>
                  <View style={styles.hostRatingPill}>
                    <ThemedText type="smallBold" style={styles.hostRatingText}>
                      4.9
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.detailActions}>
                  <Pressable style={styles.primaryAction}>
                    <ThemedText
                      type="smallBold"
                      style={styles.primaryActionText}
                    >
                      Join plan
                    </ThemedText>
                  </Pressable>
                  <Pressable style={styles.secondaryAction}>
                    <SymbolView
                      name={{
                        ios: "heart",
                        android: "favorite_border",
                        web: "favorite_border",
                      }}
                      size={20}
                      tintColor={Grapefruit}
                      weight="bold"
                    />
                  </Pressable>
                </View>
              </BottomSheetScrollView>
            </>
          ) : (
            <>
              <View style={styles.drawerHeaderFixed}>
                <View>
                  <ThemedText type="subtitle" style={styles.drawerTitle}>
                    Nearby plans
                  </ThemedText>
                  <ThemedText type="small" style={styles.drawerSubtitle}>
                    Fake listings for layout only
                  </ThemedText>
                </View>
                <View style={styles.countPill}>
                  <ThemedText type="smallBold" style={styles.countText}>
                    {featuredPlans.length} near
                  </ThemedText>
                </View>
              </View>

              <BottomSheetScrollView
                contentContainerStyle={planListStyle}
                showsVerticalScrollIndicator={false}
              >
                {featuredPlans.map((plan) => (
                  <Pressable
                    key={plan.id}
                    style={({ pressed }) => [
                      styles.planCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.planImage}>
                      <ThemedText type="smallBold" style={styles.planImageText}>
                        {plan.tag.slice(0, 1)}
                      </ThemedText>
                    </View>
                    <View style={styles.planContent}>
                      <View style={styles.planTopLine}>
                        <ThemedText type="smallBold" style={styles.planTag}>
                          {plan.tag}
                        </ThemedText>
                        <ThemedText type="smallBold" style={styles.planPrice}>
                          {plan.price}
                        </ThemedText>
                      </View>
                      <ThemedText
                        type="default"
                        style={styles.planTitle}
                        numberOfLines={1}
                      >
                        {plan.title}
                      </ThemedText>
                      <ThemedText
                        type="small"
                        style={styles.planMeta}
                        numberOfLines={1}
                      >
                        {plan.venue} · {plan.meta}
                      </ThemedText>
                    </View>
                  </Pressable>
                ))}
              </BottomSheetScrollView>
            </>
          )}
        </BottomSheet>
        {filtersOpen && (
          <Animated.View style={styles.filtersOverlay}>
            <Animated.View
              pointerEvents="none"
              style={[styles.filtersMorphGlow, filtersGlowAnimatedStyle]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.filtersMorphSurface,
                filtersMorphSurfaceAnimatedStyle,
              ]}
            >
              <Animated.View
                style={[
                  styles.filtersMorphBarGhost,
                  filtersBarGhostAnimatedStyle,
                ]}
              >
                <View style={styles.searchIconWrap}>
                  <SymbolView
                    name={{
                      ios: "magnifyingglass",
                      android: "search",
                      web: "search",
                    }}
                    size={18}
                    tintColor={WarmSurface}
                    weight="bold"
                  />
                </View>
                <View style={styles.searchTextBlock}>
                  <ThemedText type="default" style={styles.searchTitle}>
                    Search plans
                  </ThemedText>
                  <ThemedText type="small" style={styles.searchSubtitle}>
                    Anywhere · any time · filters
                  </ThemedText>
                </View>
                <View style={styles.searchTuneWrap}>
                  <SymbolView
                    name={{
                      ios: "slider.horizontal.3",
                      android: "tune",
                      web: "tune",
                    }}
                    size={18}
                    tintColor={Grapefruit}
                    weight="bold"
                  />
                </View>
              </Animated.View>
            </Animated.View>
            <Animated.View
              style={[
                styles.filtersPanel,
                filtersPanelFrameAnimatedStyle,
                filtersContentAnimatedStyle,
              ]}
            >
              <View style={styles.filtersHeader}>
                <Pressable
                  accessibilityLabel="Close filters"
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={closeFilters}
                  style={({ pressed }) => [
                    styles.filtersCloseButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: "xmark",
                      android: "close",
                      web: "close",
                    }}
                    size={18}
                    tintColor={Charcoal}
                    weight="bold"
                  />
                </Pressable>
                <ThemedText type="default" style={styles.filtersHeaderTitle}>
                  Filters
                </ThemedText>
                <View style={styles.filtersHeaderSpacer} />
              </View>

              <ScrollView
                contentContainerStyle={[
                  styles.filtersContent,
                  { paddingBottom: 100 },
                ]}
                showsVerticalScrollIndicator={false}
              >
                <Animated.View
                  style={[styles.filterHeroPanel, filtersHeroAnimatedStyle]}
                >
                  <View style={styles.filterHeroTop}>
                    <View style={styles.filterHeroIcon}>
                      <SymbolView
                        name={{
                          ios: "location.fill",
                          android: "location_on",
                          web: "location_on",
                        }}
                        size={22}
                        tintColor={WarmSurface}
                        weight="bold"
                      />
                    </View>
                    <View style={styles.filterHeroCopy}>
                      <ThemedText type="smallBold" style={styles.filterEyebrow}>
                        Explore nearby
                      </ThemedText>
                      <ThemedText
                        type="subtitle"
                        style={styles.filterSearchTitle}
                      >
                        Bratislava
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText type="small" style={styles.filterSearchMeta}>
                    Handpicked plans around Old Town, the Danube, and Sky Park.
                  </ThemedText>
                  <View style={styles.filterHeroPills}>
                    {["Tonight", "Under €10", "Social"].map((label) => (
                      <View key={label} style={styles.filterHeroPill}>
                        <ThemedText
                          type="smallBold"
                          style={styles.filterHeroPillText}
                        >
                          {label}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.filterSection, whenSectionAnimatedStyle]}
                >
                  <ThemedText type="default" style={styles.filterSectionTitle}>
                    When
                  </ThemedText>
                  <View style={styles.filterChipGrid}>
                    {["Today", "Tomorrow", "This weekend", "Any time"].map(
                      (label, index) => (
                        <View
                          key={label}
                          style={[
                            styles.filterChip,
                            index === 0 && styles.filterChipSelected,
                          ]}
                        >
                          <ThemedText
                            type="smallBold"
                            style={[
                              styles.filterChipText,
                              index === 0 && styles.filterChipTextSelected,
                            ]}
                          >
                            {label}
                          </ThemedText>
                        </View>
                      ),
                    )}
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.filterSection, categorySectionAnimatedStyle]}
                >
                  <ThemedText type="default" style={styles.filterSectionTitle}>
                    Category
                  </ThemedText>
                  <View style={styles.filterChipGrid}>
                    {[
                      "Outdoor",
                      "Networking",
                      "Culture",
                      "Social",
                      "Food",
                      "Wellness",
                    ].map((label, index) => (
                      <View
                        key={label}
                        style={[
                          styles.filterChip,
                          index < 2 && styles.filterChipSelected,
                        ]}
                      >
                        <ThemedText
                          type="smallBold"
                          style={[
                            styles.filterChipText,
                            index < 2 && styles.filterChipTextSelected,
                          ]}
                        >
                          {label}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.filterSection, priceSectionAnimatedStyle]}
                >
                  <View style={styles.filterSectionHeader}>
                    <ThemedText
                      type="default"
                      style={styles.filterSectionTitle}
                    >
                      Price
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.filterValueText}>
                      Free - €10
                    </ThemedText>
                  </View>
                  <View style={styles.fakeRangeTrack}>
                    <View style={styles.fakeRangeFill} />
                    <View style={[styles.fakeRangeThumb, { left: "16%" }]} />
                    <View style={[styles.fakeRangeThumb, { left: "72%" }]} />
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.filterSection, sizeSectionAnimatedStyle]}
                >
                  <ThemedText type="default" style={styles.filterSectionTitle}>
                    Group size
                  </ThemedText>
                  <View style={styles.filterSegmented}>
                    {["Small", "Medium", "Big"].map((label, index) => (
                      <View
                        key={label}
                        style={[
                          styles.filterSegment,
                          index === 1 && styles.filterSegmentSelected,
                        ]}
                      >
                        <ThemedText
                          type="smallBold"
                          style={[
                            styles.filterSegmentText,
                            index === 1 && styles.filterSegmentTextSelected,
                          ]}
                        >
                          {label}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.filterSection, moreSectionAnimatedStyle]}
                >
                  <ThemedText type="default" style={styles.filterSectionTitle}>
                    More options
                  </ThemedText>
                  {[
                    ["Friends of friends", "Show plans with mutuals"],
                    ["Beginner friendly", "Low pressure and easy to join"],
                    ["Near me", "Within 3 km"],
                  ].map(([title, description], index) => (
                    <View key={title} style={styles.filterOptionRow}>
                      <View>
                        <ThemedText
                          type="smallBold"
                          style={styles.filterOptionTitle}
                        >
                          {title}
                        </ThemedText>
                        <ThemedText
                          type="small"
                          style={styles.filterOptionMeta}
                        >
                          {description}
                        </ThemedText>
                      </View>
                      <View
                        style={[
                          styles.filterToggle,
                          index !== 1 && styles.filterToggleOn,
                        ]}
                      >
                        <View
                          style={[
                            styles.filterToggleThumb,
                            index !== 1 && styles.filterToggleThumbOn,
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </Animated.View>
              </ScrollView>

              <Animated.View
                style={[styles.filtersSubmitWrap, filtersSubmitAnimatedStyle]}
              >
                <Pressable
                  onPress={closeFilters}
                  style={({ pressed }) => [
                    styles.filtersSubmitButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: "magnifyingglass",
                      android: "search",
                      web: "search",
                    }}
                    size={18}
                    tintColor={WarmSurface}
                    weight="bold"
                  />
                  <ThemedText type="smallBold" style={styles.filtersSubmitText}>
                    Show 24 plans
                  </ThemedText>
                </Pressable>
                <View
                  style={{
                    height: 18,
                  }}
                />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        )}
        <BottomNavigation />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  screen: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    overflow: "hidden",
  },
  map: {
    flex: 1,
    backgroundColor: WarmGray,
  },
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: WarmGray,
  },
  searchBar: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    backgroundColor: WarmSurface,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    elevation: 14,
  },
  searchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Grapefruit,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Charcoal,
    fontSize: 16,
    fontWeight: "600",
    padding: 0,
  },
  searchTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  searchTitle: {
    color: Charcoal,
    fontWeight: "700",
  },
  searchSubtitle: {
    color: MutedText,
    fontSize: 12,
  },
  searchTuneWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GrapefruitSoft,
  },
  clearSearchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarmSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    elevation: 14,
  },
  filtersOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    elevation: 40,
  },
  filtersMorphSurface: {
    position: "absolute",
    backgroundColor: WarmSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    elevation: 22,
    overflow: "hidden",
  },
  filtersMorphGlow: {
    position: "absolute",
    backgroundColor: WarmSurface,
  },
  filtersMorphBarGhost: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.three,
  },
  filtersPanel: {
    position: "absolute",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  filtersHeader: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WarmBorder,
  },
  filtersCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarmGray,
  },
  filtersHeaderTitle: {
    color: Charcoal,
    fontWeight: "800",
  },
  filtersHeaderSpacer: {
    width: 38,
    height: 38,
  },
  filtersContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  filterHeroPanel: {
    minHeight: 168,
    borderRadius: 30,
    padding: Spacing.four,
    gap: Spacing.three,
    justifyContent: "center",
    backgroundColor: GrapefruitSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  filterHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  filterHeroIcon: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Grapefruit,
  },
  filterHeroCopy: {
    flex: 1,
    minWidth: 0,
  },
  filterEyebrow: {
    color: Grapefruit,
    fontSize: 12,
    textTransform: "uppercase",
  },
  filterSearchTitle: {
    color: Charcoal,
    fontSize: 26,
    lineHeight: 32,
  },
  filterSearchMeta: {
    color: MutedText,
    lineHeight: 20,
  },
  filterHeroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  filterHeroPill: {
    minHeight: 32,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
    backgroundColor: WarmSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  filterHeroPillText: {
    color: Charcoal,
    fontSize: 11,
  },
  filterSection: {
    gap: Spacing.two,
    borderRadius: 24,
    padding: Spacing.three,
    backgroundColor: WarmSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  filterSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  filterSectionTitle: {
    color: Charcoal,
    fontWeight: "800",
  },
  filterValueText: {
    color: Grapefruit,
    fontSize: 12,
  },
  filterChipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  filterChip: {
    minHeight: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    backgroundColor: "#FBF8F7",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  filterChipSelected: {
    backgroundColor: Grapefruit,
    borderColor: Grapefruit,
  },
  filterChipText: {
    color: Charcoal,
    fontSize: 12,
  },
  filterChipTextSelected: {
    color: WarmSurface,
  },
  fakeRangeTrack: {
    height: 34,
    justifyContent: "center",
  },
  fakeRangeFill: {
    height: 6,
    marginHorizontal: Spacing.two,
    borderRadius: 3,
    backgroundColor: GrapefruitSoft,
  },
  fakeRangeThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    backgroundColor: Grapefruit,
    borderWidth: 3,
    borderColor: WarmSurface,
  },
  filterSegmented: {
    minHeight: 48,
    flexDirection: "row",
    gap: Spacing.one,
    borderRadius: 24,
    padding: Spacing.half,
    backgroundColor: WarmGray,
  },
  filterSegment: {
    flex: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterSegmentSelected: {
    backgroundColor: WarmSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  filterSegmentText: {
    color: MutedText,
    fontSize: 12,
  },
  filterSegmentTextSelected: {
    color: Charcoal,
  },
  filterOptionRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  filterOptionTitle: {
    color: Charcoal,
  },
  filterOptionMeta: {
    color: MutedText,
  },
  filterToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor: WarmBorder,
  },
  filterToggleOn: {
    backgroundColor: Grapefruit,
  },
  filterToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: WarmSurface,
  },
  filterToggleThumbOn: {
    alignSelf: "flex-end",
  },
  filtersSubmitWrap: {
    position: "absolute",
    left: Spacing.two,
    right: Spacing.two,
    bottom: 0,
    alignItems: "center",
    padding: Spacing.one,
    backgroundColor: WarmSurface,
  },
  filtersSubmitButton: {
    width: "100%",
    height: 54,
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    backgroundColor: Grapefruit,
    elevation: 12,
  },
  filtersSubmitText: {
    color: WarmSurface,
  },
  drawer: {
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
    zIndex: 16,
    elevation: 16,
  },
  drawerBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
  },
  drawerHandleArea: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  hiddenDrawerHandleArea: {
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  drawerHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#DDD5D1",
  },
  hiddenDrawerHandle: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  drawerHeaderFixed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WarmBorder,
    backgroundColor: WarmSurface,
  },
  drawerTitle: {
    color: Charcoal,
    fontSize: 25,
    lineHeight: 31,
  },
  drawerSubtitle: {
    color: MutedText,
  },
  countPill: {
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    backgroundColor: GrapefruitSoft,
  },
  countText: {
    color: Grapefruit,
    fontSize: 12,
  },
  detailContent: {
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  detailHeaderFixed: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WarmBorder,
    backgroundColor: WarmSurface,
  },
  detailHeaderTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  detailCloseWrap: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 30,
    elevation: 30,
  },
  detailAvatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GrapefruitSoft,
  },
  detailAvatarText: {
    color: Grapefruit,
    fontSize: 20,
  },
  detailCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarmGray,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  detailTitleBlock: {
    gap: Spacing.half,
  },
  detailTitle: {
    color: Charcoal,
    fontSize: 24,
    lineHeight: 30,
  },
  detailMeta: {
    color: MutedText,
  },
  detailPhoto: {
    minHeight: 132,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: Spacing.three,
    backgroundColor: GrapefruitSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  detailPhotoBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    backgroundColor: WarmSurface,
  },
  detailPhotoBadgeText: {
    color: Grapefruit,
    fontSize: 11,
  },
  detailDescription: {
    color: Charcoal,
    lineHeight: 22,
  },
  detailStatsRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  detailStat: {
    flex: 1,
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: 20,
    padding: Spacing.two,
    backgroundColor: "#FBF8F7",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  detailStatTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  detailStatValue: {
    color: Charcoal,
    fontSize: 12,
  },
  detailStatLabel: {
    color: MutedText,
    fontSize: 11,
  },
  hostPanel: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: 24,
    padding: Spacing.two,
    backgroundColor: "#FBF8F7",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  hostAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Grapefruit,
  },
  hostAvatarText: {
    color: WarmSurface,
    fontSize: 15,
  },
  hostTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  hostEyebrow: {
    color: MutedText,
    fontSize: 11,
  },
  hostName: {
    color: Charcoal,
    fontWeight: "700",
  },
  hostRole: {
    color: MutedText,
  },
  hostRatingPill: {
    height: 32,
    minWidth: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GrapefruitSoft,
  },
  hostRatingText: {
    color: Grapefruit,
    fontSize: 12,
  },
  detailActions: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  primaryAction: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Grapefruit,
  },
  primaryActionText: {
    color: WarmSurface,
  },
  secondaryAction: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarmSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
  },
  planList: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  planCard: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    backgroundColor: "#FBF8F7",
    padding: Spacing.two,
  },
  planImage: {
    width: 82,
    height: 82,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GrapefruitSoft,
  },
  planImageText: {
    color: Grapefruit,
    fontSize: 22,
  },
  planContent: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  planTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  planTag: {
    color: Grapefruit,
  },
  planPrice: {
    color: Charcoal,
  },
  planTitle: {
    color: Charcoal,
  },
  planMeta: {
    color: MutedText,
  },
  pressed: {
    opacity: 0.72,
  },
});
