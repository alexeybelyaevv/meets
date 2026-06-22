import { Controller, useForm, useWatch } from "react-hook-form";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import {
  BottomNavigation,
  BottomNavigationInset,
} from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";

const Grapefruit = "#FF5A5F";
const GrapefruitSoft = "#FFE6E3";
const WarmSurface = "#FFFCFB";
const WarmGray = "#F4F1EF";
const WarmBorder = "#E8E2DF";
const Charcoal = "#201A1A";
const MutedText = "#766F6B";
const Green = "#2F9E6D";

type PriceType = "free" | "paid";

type EventFormValues = {
  title: string;
  description: string;
  categories: string[];
  photos: string[];
  date: string;
  time: string;
  locationName: string;
  locationAddress: string;
  locationLatitude: string;
  locationLongitude: string;
  peopleNeeded: string;
  peopleAlreadyThere: string;
  priceType: PriceType;
  priceAmount: string;
  moneyToBring: string;
  bringItems: string;
  hasAgeLimit: boolean;
  minAge: number;
  maxAge: number;
};

type Step = {
  id: string;
  title: string;
  eyebrow: string;
  icon: SymbolViewProps["name"];
};

type LocationSuggestion = {
  address: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  name: string;
  provider: "osm";
};

const steps: Step[] = [
  {
    id: "basics",
    eyebrow: "Step 1",
    title: "Basics",
    icon: { ios: "text.alignleft", android: "subject", web: "subject" },
  },
  {
    id: "place",
    eyebrow: "Step 2",
    title: "Place",
    icon: {
      ios: "mappin.and.ellipse",
      android: "location_on",
      web: "location_on",
    },
  },
  {
    id: "people",
    eyebrow: "Step 3",
    title: "People",
    icon: { ios: "person.2.fill", android: "groups", web: "groups" },
  },
  {
    id: "review",
    eyebrow: "Step 4",
    title: "Review",
    icon: {
      ios: "checkmark.circle.fill",
      android: "check_circle",
      web: "check_circle",
    },
  },
];

const categories = [
  "Outdoor",
  "Food",
  "Sport",
  "Culture",
  "Games",
  "Study",
  "Party",
  "Other",
];
const agePresets = [
  { label: "16+", minAge: 16, maxAge: 35 },
  { label: "18+", minAge: 18, maxAge: 35 },
  { label: "21+", minAge: 21, maxAge: 35 },
  { label: "30+", minAge: 30, maxAge: 55 },
];
const defaultValues: EventFormValues = {
  title: "",
  description: "",
  categories: ["Outdoor"],
  photos: [],
  date: "",
  time: "",
  locationName: "",
  locationAddress: "",
  locationLatitude: "48.1452",
  locationLongitude: "17.1164",
  peopleNeeded: "8",
  peopleAlreadyThere: "1",
  priceType: "free",
  priceAmount: "",
  moneyToBring: "",
  bringItems: "",
  hasAgeLimit: false,
  minAge: 18,
  maxAge: 35,
};

function createLocationMapHtml(latitude: string, longitude: string) {
  const lat = Number(latitude) || 48.1452;
  const lng = Number(longitude) || 17.1164;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: #F4F1EF;
      }

      .leaflet-container {
        background: #F4F1EF;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .leaflet-control-attribution {
        font-size: 9px;
      }

      .event-marker-shell {
        background: transparent;
        border: 0;
      }

      .event-marker {
        position: relative;
        width: 34px;
        height: 46px;
        filter: drop-shadow(0 8px 10px rgba(32, 26, 26, 0.24));
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const selectedPoint = [${lat}, ${lng}];
      const map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        center: selectedPoint,
        zoom: 15,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(map);

      const icon = L.divIcon({
        className: 'event-marker-shell',
        iconSize: [34, 46],
        iconAnchor: [17, 40],
        html:
          '<svg class="event-marker" viewBox="0 0 34 46" aria-hidden="true">' +
            '<path d="M17 2.5C9.8 2.5 4 8.3 4 15.5c0 9.3 10.5 21 11.8 22.4 0.6 0.7 1.8 0.7 2.4 0C19.5 36.5 30 24.8 30 15.5 30 8.3 24.2 2.5 17 2.5Z" fill="#FF5A5F" stroke="#FFFCFB" stroke-width="2.8" />' +
            '<circle cx="17" cy="15.8" r="6.2" fill="#FFFCFB" />' +
            '<circle cx="17" cy="15.8" r="2.9" fill="#FFE6E3" />' +
          '</svg>',
      });
      const marker = L.marker(selectedPoint, { icon }).addTo(map);

      map.on('click', (event) => {
        const nextPoint = [event.latlng.lat, event.latlng.lng];
        marker.setLatLng(nextPoint);
        map.panTo(nextPoint);
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'locationSelected',
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        }));
      });

      setTimeout(() => map.invalidateSize(), 250);
    </script>
  </body>
</html>`;
}

const osmAmenitySearchTerms: Record<string, string[]> = {
  bar: ["bar", "pub", "biergarten"],
  bars: ["bar", "pub", "biergarten"],
  cafe: ["cafe"],
  cafes: ["cafe"],
  coffee: ["cafe"],
  club: ["nightclub"],
  clubs: ["nightclub"],
  nightclub: ["nightclub"],
  pub: ["pub", "bar"],
  pubs: ["pub", "bar"],
  restaurant: ["restaurant", "fast_food"],
  restaurants: ["restaurant", "fast_food"],
};

function escapeOverpassRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getOsmAmenityValues(query: string) {
  const normalizedQuery = query.toLowerCase();
  const values = Object.entries(osmAmenitySearchTerms)
    .filter(([term]) => normalizedQuery.includes(term))
    .flatMap(([, amenityValues]) => amenityValues);

  return [...new Set(values)];
}

function formatOsmAddress(tags: Record<string, string> | undefined) {
  if (!tags) {
    return "";
  }

  const street = tags["addr:street"];
  const houseNumber = tags["addr:housenumber"];
  const city = tags["addr:city"];
  const addressLine = [street, houseNumber].filter(Boolean).join(" ");

  return [addressLine, city].filter(Boolean).join(", ");
}

export default function CreateScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [created, setCreated] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSearching, setLocationSearching] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(1 / steps.length);
  const { control, handleSubmit, setValue } = useForm<EventFormValues>({
    defaultValues,
  });
  const values = useWatch({ control });
  const activeStep = steps[stepIndex];
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  const isLastStep = stepIndex === steps.length - 1;
  const bottomPadding = BottomNavigationInset + 76;

  const goToStep = (nextIndex: number) => {
    setStepIndex(nextIndex);
    progress.value = withTiming((nextIndex + 1) / steps.length, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  };

  const goNext = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToStep(Math.min(stepIndex + 1, steps.length - 1));
  };

  const goBack = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToStep(Math.max(stepIndex - 1, 0));
  };

  const applyLocation = async ({
    address,
    latitude,
    longitude,
    name,
  }: LocationSuggestion) => {
    let nextAddress = address;

    if (typeof latitude === "number" && typeof longitude === "number") {
      setValue("locationLatitude", String(latitude));
      setValue("locationLongitude", String(longitude));

      if (!nextAddress) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );
          const result = (await response.json()) as {
            display_name?: string;
          };

          nextAddress =
            result.display_name ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        } catch {
          nextAddress = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        }
      }
    }

    setValue("locationName", name);
    setValue("locationAddress", nextAddress);
    setLocationSearch(name);
    setLocationSuggestions([]);
  };

  const searchLocation = async (
    searchText = locationSearch,
    options?: { showAlert?: boolean },
  ) => {
    const query = searchText.trim();

    if (!query) {
      setLocationSuggestions([]);
      return;
    }

    setLocationSearching(true);

    try {
      const centerLatitude =
        Number(values.locationLatitude) || Number(defaultValues.locationLatitude);
      const centerLongitude =
        Number(values.locationLongitude) || Number(defaultValues.locationLongitude);
      const amenityValues = getOsmAmenityValues(query);
      const escapedQuery = escapeOverpassRegex(query);
      const overpassAmenityClause =
        amenityValues.length > 0
          ? `nwr(around:12000,${centerLatitude},${centerLongitude})["amenity"~"^(${amenityValues.join("|")})$",i];`
          : "";
      const overpassQuery = `[out:json][timeout:12];(${overpassAmenityClause}nwr(around:12000,${centerLatitude},${centerLongitude})["name"~"${escapedQuery}",i]["amenity"];nwr(around:12000,${centerLatitude},${centerLongitude})["name"~"${escapedQuery}",i]["tourism"];nwr(around:12000,${centerLatitude},${centerLongitude})["name"~"${escapedQuery}",i]["shop"];);out center tags 12;`;

      const [nominatimResult, overpassResult] = await Promise.allSettled([
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&namedetails=1&q=${encodeURIComponent(query)}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        ),
        fetch("https://overpass-api.de/api/interpreter", {
          body: `data=${encodeURIComponent(overpassQuery)}`,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        }),
      ]);
      const nominatimResults =
        nominatimResult.status === "fulfilled"
          ? ((await nominatimResult.value.json()) as {
              category?: string;
              display_name?: string;
              lat?: string;
              lon?: string;
              name?: string;
              namedetails?: {
                name?: string;
              };
              type?: string;
            }[])
          : [];
      const overpassResults =
        overpassResult.status === "fulfilled"
          ? ((await overpassResult.value.json()) as {
              elements?: {
                center?: {
                  lat?: number;
                  lon?: number;
                };
                lat?: number;
                lon?: number;
                tags?: Record<string, string>;
              }[];
            })
          : {};
      const nominatimSuggestions = nominatimResults
        .filter((result) => result.lat && result.lon)
        .map((result) => {
          const address = result.display_name ?? query;
          const name =
            result.name ||
            result.namedetails?.name ||
            address.split(",")[0] ||
            query;

          return {
            address,
            category: result.type || result.category,
            latitude: Number(result.lat),
            longitude: Number(result.lon),
            name,
            provider: "osm" as const,
          };
        });
      const overpassSuggestions =
        overpassResults.elements?.map((element) => {
          const latitude = element.lat ?? element.center?.lat;
          const longitude = element.lon ?? element.center?.lon;
          const tags = element.tags;
          const name = tags?.name || tags?.brand || query;
          const category = tags?.amenity || tags?.tourism || tags?.shop;

          return {
            address: formatOsmAddress(tags),
            category,
            latitude,
            longitude,
            name,
            provider: "osm" as const,
          };
        }) ?? [];
      const suggestionsByKey = new Map<string, LocationSuggestion>();

      [...overpassSuggestions, ...nominatimSuggestions]
        .filter(
          (suggestion) =>
            typeof suggestion.latitude === "number" &&
            typeof suggestion.longitude === "number",
        )
        .forEach((suggestion) => {
          const key = `${suggestion.name}-${suggestion.latitude?.toFixed(5)}-${suggestion.longitude?.toFixed(5)}`;

          if (!suggestionsByKey.has(key)) {
            suggestionsByKey.set(key, suggestion);
          }
        });
      const suggestions = [...suggestionsByKey.values()].slice(0, 5);

      if (suggestions.length === 0) {
        if (options?.showAlert) {
          Alert.alert("Location not found", "Try a more specific place or address.");
        }
        return;
      }

      setLocationSuggestions(suggestions);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      if (options?.showAlert) {
        Alert.alert("Location search failed", "Check connection and try again.");
      }
    } finally {
      setLocationSearching(false);
    }
  };

  const reverseLocation = async (latitude: number, longitude: number) => {
    setValue("locationLatitude", String(latitude));
    setValue("locationLongitude", String(longitude));

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const result = (await response.json()) as {
        display_name?: string;
        name?: string;
      };
      const address = result.display_name ?? `${latitude}, ${longitude}`;

      setValue("locationName", result.name || address.split(",")[0] || "Map point");
      setValue("locationAddress", address);
    } catch {
      setValue("locationName", "Map point");
      setValue("locationAddress", `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  };

  const handleLocationMapMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        latitude?: unknown;
        longitude?: unknown;
        type?: unknown;
      };

      if (
        message.type === "locationSelected" &&
        typeof message.latitude === "number" &&
        typeof message.longitude === "number"
      ) {
        void reverseLocation(message.latitude, message.longitude);
      }
    } catch {
      // Ignore messages not intended for this screen.
    }
  };

  const pickPhotos = async (currentPhotos: string[]) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Photos permission", "Allow photo access to add images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ["images"],
      quality: 0.85,
      selectionLimit: 6,
    });

    if (result.canceled) {
      return;
    }

    const nextPhotos = [
      ...currentPhotos,
      ...result.assets.map((asset) => asset.uri),
    ].slice(0, 6);

    setValue("photos", nextPhotos);
  };

  const onSubmit = handleSubmit((formValues) => {
    setCreated(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (Platform.OS === "web") {
      console.log("Created event draft", formValues);
      return;
    }

    Alert.alert("Draft ready", "Frontend flow collected the event details.");
  });

  if (created) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.content, { paddingBottom: bottomPadding }]}>
            <View style={styles.donePanel}>
              <View style={styles.doneIcon}>
                <SymbolView
                  name={{ ios: "checkmark", android: "check", web: "check" }}
                  size={34}
                  tintColor={WarmSurface}
                  weight="bold"
                />
              </View>
              <ThemedText type="smallBold" style={styles.doneEyebrow}>
                Event draft
              </ThemedText>
              <ThemedText type="subtitle" style={styles.doneTitle}>
                Ready for the map
              </ThemedText>
              <ThemedText type="default" style={styles.doneBody}>
                The create flow is frontend-only for now. Backend save and map
                publishing can plug into this submit step later.
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setCreated(false);
                  goToStep(0);
                }}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  Create another
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
        <BottomNavigation />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.progressPanel,
            { top: Math.max(insets.top + Spacing.one, Spacing.three) },
          ]}
        >
          <View style={styles.progressTopLine}>
            {steps.map((step, index) => {
              const active = index === stepIndex;
              const complete = index < stepIndex;

              return (
                <Pressable
                  key={step.id}
                  accessibilityRole="button"
                  disabled={index > stepIndex}
                  onPress={() => goToStep(index)}
                  style={styles.stepItem}
                >
                  <View
                    style={[
                      styles.stepIcon,
                      (active || complete) && styles.stepIconActive,
                    ]}
                  >
                    <SymbolView
                      name={step.icon}
                      size={17}
                      tintColor={active || complete ? WarmSurface : MutedText}
                      weight="bold"
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoiding}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              {
                paddingTop: Math.max(insets.top, 76),
                paddingBottom: bottomPadding,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              key={activeStep.id}
              entering={SlideInRight.duration(260).easing(
                Easing.out(Easing.cubic),
              )}
              exiting={SlideOutLeft.duration(180).easing(
                Easing.in(Easing.cubic),
              )}
              style={styles.stepPanel}
            >
              <View style={styles.header}>
                <View>
                  <ThemedText type="smallBold" style={styles.eyebrow}>
                    Create public event
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.title}>
                    Build the plan
                  </ThemedText>
                </View>
              </View>

              {stepIndex === 0 && (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(120)}
                  style={styles.stepBody}
                >
                  <ControlledInput
                    control={control}
                    label="Event name"
                    name="title"
                    placeholder="Rooftop board games"
                  />
                  <ControlledInput
                    control={control}
                    label="Description"
                    multiline
                    name="description"
                    placeholder="What will happen, who should join, and what is the vibe?"
                  />
                  <View style={styles.fieldGroup}>
                    <FieldLabel label="Categories" />
                    <Controller
                      control={control}
                      name="categories"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.categorySelect}>
                          <View style={styles.selectedCategoryRow}>
                            {value.length > 0 ? (
                              value.map((category) => (
                                <Pressable
                                  key={category}
                                  accessibilityRole="button"
                                  onPress={() =>
                                    onChange(
                                      value.filter((item) => item !== category),
                                    )
                                  }
                                  style={({ pressed }) => [
                                    styles.categoryPill,
                                    pressed && styles.pressed,
                                  ]}
                                >
                                  <ThemedText
                                    type="smallBold"
                                    style={styles.categoryPillText}
                                  >
                                    {category}
                                  </ThemedText>
                                  <SymbolView
                                    name={{
                                      ios: "xmark",
                                      android: "close",
                                      web: "close",
                                    }}
                                    size={12}
                                    tintColor={Grapefruit}
                                    weight="bold"
                                  />
                                </Pressable>
                              ))
                            ) : (
                              <ThemedText
                                type="small"
                                style={styles.categoryEmptyText}
                              >
                                Pick one or more vibes
                              </ThemedText>
                            )}
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => setCategoriesOpen((open) => !open)}
                              style={({ pressed }) => [
                                styles.categoryAddButton,
                                categoriesOpen && styles.categoryAddButtonOpen,
                                pressed && styles.pressed,
                              ]}
                            >
                              <SymbolView
                                name={
                                  categoriesOpen
                                    ? {
                                        ios: "xmark",
                                        android: "close",
                                        web: "close",
                                      }
                                    : {
                                        ios: "plus",
                                        android: "add",
                                        web: "add",
                                      }
                                }
                                size={18}
                                tintColor={
                                  categoriesOpen ? WarmSurface : Grapefruit
                                }
                                weight="bold"
                              />
                            </Pressable>
                          </View>
                          {categoriesOpen ? (
                            <View style={styles.categoryOptionGrid}>
                              {categories
                                .filter((category) => !value.includes(category))
                                .map((category) => (
                                  <Pressable
                                    key={category}
                                    accessibilityRole="button"
                                    onPress={() => onChange([...value, category])}
                                    style={({ pressed }) => [
                                      styles.chip,
                                      pressed && styles.pressed,
                                    ]}
                                  >
                                    <ThemedText
                                      type="smallBold"
                                      style={styles.chipText}
                                    >
                                      {category}
                                    </ThemedText>
                                  </Pressable>
                                ))}
                            </View>
                          ) : null}
                        </View>
                      )}
                    />
                  </View>
                  <View style={styles.fieldGroup}>
                    <FieldLabel label="Photos" optional />
                    <Controller
                      control={control}
                      name="photos"
                      render={({ field: { onChange, value } }) => (
                        <ScrollView
                          horizontal
                          contentContainerStyle={styles.photoRow}
                          showsHorizontalScrollIndicator={false}
                        >
                          {value.map((uri) => (
                            <View key={uri} style={styles.photoPreview}>
                              <Image
                                source={{ uri }}
                                style={styles.photoPreviewImage}
                              />
                              <Pressable
                                accessibilityRole="button"
                                onPress={() =>
                                  onChange(
                                    value.filter((item) => item !== uri),
                                  )
                                }
                                style={({ pressed }) => [
                                  styles.photoRemoveButton,
                                  pressed && styles.pressed,
                                ]}
                              >
                                <SymbolView
                                  name={{
                                    ios: "xmark",
                                    android: "close",
                                    web: "close",
                                  }}
                                  size={12}
                                  tintColor={WarmSurface}
                                  weight="bold"
                                />
                              </Pressable>
                            </View>
                          ))}
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => void pickPhotos(value)}
                            style={({ pressed }) => [
                              styles.photoAddSlot,
                              pressed && styles.pressed,
                            ]}
                          >
                            <View style={styles.photoAddIcon}>
                              <SymbolView
                                name={{
                                  ios: "plus",
                                  android: "add",
                                  web: "add",
                                }}
                                size={22}
                                tintColor={Grapefruit}
                                weight="bold"
                              />
                            </View>
                            <ThemedText
                              type="smallBold"
                              style={styles.photoText}
                            >
                              Add photo
                            </ThemedText>
                          </Pressable>
                        </ScrollView>
                      )}
                    />
                  </View>
                </Animated.View>
              )}

              {stepIndex === 1 && (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(120)}
                  style={styles.stepBody}
                >
                  <View style={styles.twoColumn}>
                    <ControlledInput
                      control={control}
                      label="Date"
                      name="date"
                      placeholder="Fri, Jul 12"
                    />
                    <ControlledInput
                      control={control}
                      label="Time"
                      name="time"
                      placeholder="19:00"
                    />
                  </View>
                  <View style={styles.mapPreview}>
                    <WebView
                      key={`${values.locationLatitude}-${values.locationLongitude}`}
                      originWhitelist={["*"]}
                      source={{
                        html: createLocationMapHtml(
                          values.locationLatitude ?? defaultValues.locationLatitude,
                          values.locationLongitude ?? defaultValues.locationLongitude,
                        ),
                        baseUrl: "https://basemaps.cartocdn.com",
                      }}
                      javaScriptEnabled
                      domStorageEnabled
                      mixedContentMode="always"
                      onMessage={handleLocationMapMessage}
                      scrollEnabled={false}
                      style={styles.locationMap}
                    />
                    <View style={styles.mapSearchPanel}>
                      <View style={styles.mapSearchTopRow}>
                        <View style={styles.mapSearchInputWrap}>
                          <SymbolView
                            name={{
                              ios: "magnifyingglass",
                              android: "search",
                              web: "search",
                            }}
                            size={17}
                            tintColor={MutedText}
                            weight="bold"
                          />
                          <TextInput
                            onChangeText={(text) => {
                              setLocationSearch(text);

                              if (!text.trim()) {
                                setLocationSuggestions([]);
                              }
                            }}
                            onSubmitEditing={() =>
                              void searchLocation(locationSearch, {
                                showAlert: true,
                              })
                            }
                            placeholder="Search bars, places, address"
                            placeholderTextColor="#A69D98"
                            returnKeyType="search"
                            style={styles.mapSearchInput}
                            value={locationSearch}
                          />
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          disabled={locationSearching}
                          onPress={() =>
                            void searchLocation(locationSearch, {
                              showAlert: true,
                            })
                          }
                          style={({ pressed }) => [
                            styles.mapSearchButton,
                            locationSearching && styles.buttonDisabled,
                            pressed && styles.pressed,
                          ]}
                        >
                          {locationSearching ? (
                            <ThemedText
                              type="smallBold"
                              style={styles.mapSearchButtonLoadingText}
                            >
                              ...
                            </ThemedText>
                          ) : (
                            <SymbolView
                              name={{
                                ios: "arrow.right",
                                android: "arrow_forward",
                                web: "arrow_forward",
                              }}
                              size={17}
                              tintColor={WarmSurface}
                              weight="bold"
                            />
                          )}
                        </Pressable>
                      </View>
                      {locationSearching ? (
                        <View style={styles.locationSearchingRow}>
                          <View style={styles.locationSearchingDot} />
                          <ThemedText
                            type="smallBold"
                            style={styles.locationSearchingText}
                          >
                            Searching places
                          </ThemedText>
                        </View>
                      ) : null}
                      {locationSuggestions.length > 0 ? (
                        <View style={styles.locationSuggestions}>
                          {locationSuggestions.map((suggestion) => (
                            <Pressable
                              key={`${suggestion.latitude}-${suggestion.longitude}-${suggestion.name}`}
                              accessibilityRole="button"
                              onPress={() => void applyLocation(suggestion)}
                              style={({ pressed }) => [
                                styles.locationSuggestion,
                                pressed && styles.pressed,
                              ]}
                            >
                              <View style={styles.locationSuggestionIcon}>
                                <SymbolView
                                  name={{
                                    ios: "mappin",
                                    android: "location_on",
                                    web: "location_on",
                                  }}
                                  size={15}
                                  tintColor={Grapefruit}
                                  weight="bold"
                                />
                              </View>
                              <View style={styles.locationSuggestionCopy}>
                                <ThemedText
                                  type="smallBold"
                                  numberOfLines={1}
                                  style={styles.locationSuggestionTitle}
                                >
                                  {suggestion.name}
                                </ThemedText>
                                <ThemedText
                                  type="small"
                                  numberOfLines={1}
                                  style={styles.locationSuggestionMeta}
                                >
                                  {suggestion.category
                                    ? `${suggestion.category} · ${suggestion.address}`
                                    : suggestion.address}
                                </ThemedText>
                              </View>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.mapHintPill}>
                      <ThemedText type="smallBold" style={styles.mapHintText}>
                        Tap map to move pin
                      </ThemedText>
                    </View>
                  </View>
                  <ControlledInput
                    control={control}
                    label="Place name"
                    name="locationName"
                    placeholder="Sky Park"
                  />
                  <ControlledInput
                    control={control}
                    label="Address"
                    name="locationAddress"
                    placeholder="Bratislava, Slovakia"
                  />
                </Animated.View>
              )}

              {stepIndex === 2 && (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(120)}
                  style={styles.stepBody}
                >
                  <View style={styles.twoColumn}>
                    <ControlledInput
                      control={control}
                      keyboardType="number-pad"
                      label="People needed"
                      name="peopleNeeded"
                      placeholder="8"
                    />
                    <ControlledInput
                      control={control}
                      keyboardType="number-pad"
                      label="Already there"
                      name="peopleAlreadyThere"
                      placeholder="1"
                    />
                  </View>
                  <View style={styles.fieldGroup}>
                    <FieldLabel label="Price" />
                    <Controller
                      control={control}
                      name="priceType"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.segmented}>
                          {(["free", "paid"] as const).map((type) => {
                            const selected = value === type;
                            const label = type === "free" ? "Free" : "Paid";

                            return (
                              <Pressable
                                key={type}
                                accessibilityRole="button"
                                onPress={() => onChange(type)}
                                style={({ pressed }) => [
                                  styles.segment,
                                  selected && styles.segmentSelected,
                                  pressed && styles.pressed,
                                ]}
                              >
                                <ThemedText
                                  type="smallBold"
                                  style={[
                                    styles.segmentText,
                                    selected && styles.segmentTextSelected,
                                  ]}
                                >
                                  {label}
                                </ThemedText>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    />
                  </View>
                  {values.priceType === "paid" && (
                    <ControlledInput
                      control={control}
                      keyboardType="decimal-pad"
                      label="Price amount"
                      name="priceAmount"
                      placeholder="10 EUR"
                    />
                  )}
                  <ControlledInput
                    control={control}
                    label="Money to bring"
                    name="moneyToBring"
                    placeholder="Optional, e.g. 20 EUR for food"
                  />
                  <ControlledInput
                    control={control}
                    label="What to bring"
                    name="bringItems"
                    placeholder="Optional, e.g. blanket, water, ID"
                  />
                  <View style={styles.agePanel}>
                    <View style={styles.ageHeader}>
                      <View>
                        <FieldLabel label="Age range" optional />
                        <ThemedText type="small" style={styles.fieldHint}>
                          Enable only when the event needs a specific age range.
                        </ThemedText>
                      </View>
                      <Controller
                        control={control}
                        name="hasAgeLimit"
                        render={({ field: { onChange, value } }) => (
                          <Switch
                            onValueChange={onChange}
                            value={value}
                            trackColor={{
                              false: WarmBorder,
                              true: GrapefruitSoft,
                            }}
                            thumbColor={value ? Grapefruit : WarmSurface}
                          />
                        )}
                      />
                    </View>
                    {values.hasAgeLimit && (
                      <View style={styles.agePresetGrid}>
                        {agePresets.map((preset) => {
                          const selected =
                            values.minAge === preset.minAge &&
                            values.maxAge === preset.maxAge;

                          return (
                            <Pressable
                              key={preset.label}
                              accessibilityRole="button"
                              onPress={() => {
                                setValue("minAge", preset.minAge);
                                setValue("maxAge", preset.maxAge);
                              }}
                              style={({ pressed }) => [
                                styles.agePreset,
                                selected && styles.agePresetSelected,
                                pressed && styles.pressed,
                              ]}
                            >
                              <ThemedText
                                type="smallBold"
                                style={[
                                  styles.agePresetText,
                                  selected && styles.agePresetTextSelected,
                                ]}
                              >
                                {preset.label}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                        <View style={styles.ageRangeBar}>
                          <View style={styles.ageRangeFill} />
                          <View style={[styles.ageThumb, { left: "22%" }]} />
                          <View style={[styles.ageThumb, { left: "72%" }]} />
                        </View>
                        <ThemedText
                          type="smallBold"
                          style={styles.ageRangeText}
                        >
                          {values.minAge}-{values.maxAge} years
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </Animated.View>
              )}

              {stepIndex === 3 && (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(120)}
                  style={styles.stepBody}
                >
                  <View style={styles.previewHero}>
                    <View style={styles.previewBadge}>
                      <ThemedText
                        type="smallBold"
                        style={styles.previewBadgeText}
                      >
                        {values.categories?.[0] ?? "Event"}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="subtitle"
                      style={styles.previewTitle}
                      numberOfLines={2}
                    >
                      {values.title || "Untitled event"}
                    </ThemedText>
                    <ThemedText type="small" style={styles.previewMeta}>
                      {values.date || "Date"} · {values.time || "Time"} ·{" "}
                      {values.locationName || "Location"}
                    </ThemedText>
                  </View>
                  <PreviewRow
                    icon={{
                      ios: "text.alignleft",
                      android: "subject",
                      web: "subject",
                    }}
                    label="Description"
                    value={values.description || "No description yet"}
                  />
                  <PreviewRow
                    icon={{
                      ios: "person.2.fill",
                      android: "groups",
                      web: "groups",
                    }}
                    label="People"
                    value={`${values.peopleAlreadyThere || 0}/${values.peopleNeeded || 0} already planned`}
                  />
                  <PreviewRow
                    icon={{
                      ios: "creditcard.fill",
                      android: "payments",
                      web: "payments",
                    }}
                    label="Price"
                    value={
                      values.priceType === "free"
                        ? "Free"
                        : values.priceAmount || "Paid"
                    }
                  />
                  <PreviewRow
                    icon={{
                      ios: "bag.fill",
                      android: "backpack",
                      web: "backpack",
                    }}
                    label="Bring"
                    value={
                      values.bringItems ||
                      values.moneyToBring ||
                      "Nothing special"
                    }
                  />
                  <PreviewRow
                    icon={{
                      ios: "person.crop.circle.badge.checkmark",
                      android: "verified_user",
                      web: "verified_user",
                    }}
                    label="Age"
                    value={
                      values.hasAgeLimit
                        ? `${values.minAge}-${values.maxAge} years`
                        : "No age limit"
                    }
                  />
                </Animated.View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        <View
          pointerEvents="box-none"
          style={[
            styles.fixedActions,
            { bottom: BottomNavigationInset + Spacing.four },
          ]}
        >
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={stepIndex === 0}
              onPress={goBack}
              style={({ pressed }) => [
                styles.secondaryButton,
                stepIndex === 0 && styles.buttonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "chevron.left",
                  android: "arrow_back",
                  web: "arrow_back",
                }}
                size={18}
                tintColor={stepIndex === 0 ? WarmBorder : Charcoal}
                weight="bold"
              />
              <ThemedText
                type="smallBold"
                style={[
                  styles.secondaryButtonText,
                  stepIndex === 0 && styles.secondaryButtonTextDisabled,
                ]}
              >
                Back
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={isLastStep ? onSubmit : goNext}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                {isLastStep ? "Create event" : "Continue"}
              </ThemedText>
              <SymbolView
                name={
                  isLastStep
                    ? { ios: "checkmark", android: "check", web: "check" }
                    : {
                        ios: "chevron.right",
                        android: "arrow_forward",
                        web: "arrow_forward",
                      }
                }
                size={18}
                tintColor={WarmSurface}
                weight="bold"
              />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
      <BottomNavigation />
    </ThemedView>
  );
}

type ControlledInputProps = {
  control: ReturnType<typeof useForm<EventFormValues>>["control"];
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  label: string;
  multiline?: boolean;
  name: keyof EventFormValues;
  placeholder: string;
};

function ControlledInput({
  control,
  keyboardType = "default",
  label,
  multiline,
  name,
  placeholder,
}: ControlledInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <FieldLabel label={label} />
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            keyboardType={keyboardType}
            multiline={multiline}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor="#A69D98"
            style={[styles.input, multiline && styles.textArea]}
            value={String(value ?? "")}
          />
        )}
      />
    </View>
  );
}

function FieldLabel({
  label,
  optional,
}: {
  label: string;
  optional?: boolean;
}) {
  return (
    <View style={styles.labelRow}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      {optional ? (
        <ThemedText type="small" style={styles.optionalText}>
          Optional
        </ThemedText>
      ) : null}
    </View>
  );
}

function PreviewRow({
  icon,
  label,
  value,
}: {
  icon: SymbolViewProps["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.previewRow}>
      <View style={styles.previewIcon}>
        <SymbolView
          name={icon}
          size={18}
          tintColor={Grapefruit}
          weight="bold"
        />
      </View>
      <View style={styles.previewCopy}>
        <ThemedText type="small" style={styles.previewLabel}>
          {label}
        </ThemedText>
        <ThemedText type="default" style={styles.previewValue}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: WarmSurface,
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  eyebrow: {
    color: Grapefruit,
    textTransform: "uppercase",
  },
  title: {
    color: Charcoal,
    fontSize: 34,
    lineHeight: 39,
  },
  progressPanel: {
    position: "absolute",
    alignSelf: "center",
    width: 232,
    gap: Spacing.one,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    backgroundColor: WarmSurface,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    zIndex: 30,
    elevation: 10,
  },
  progressTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.one,
  },
  stepItem: {
    width: 46,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIcon: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: WarmGray,
  },
  stepIconActive: {
    backgroundColor: Grapefruit,
  },
  progressTrack: {
    height: 3,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: WarmGray,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Grapefruit,
  },
  stepPanel: {
    gap: Spacing.three,
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    backgroundColor: WarmSurface,
    padding: Spacing.three,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  stepHeaderIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: GrapefruitSoft,
  },
  stepEyebrow: {
    color: MutedText,
  },
  stepHeaderCopy: {
    minHeight: 52,
    justifyContent: "center",
  },
  stepBody: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  label: {
    color: Charcoal,
  },
  optionalText: {
    color: MutedText,
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    backgroundColor: WarmGray,
    color: Charcoal,
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  textArea: {
    minHeight: 116,
    textAlignVertical: "top",
  },
  categorySelect: {
    gap: Spacing.two,
  },
  selectedCategoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.two,
  },
  categoryPill: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: 19,
    backgroundColor: GrapefruitSoft,
    paddingHorizontal: Spacing.three,
  },
  categoryPillText: {
    color: Grapefruit,
  },
  categoryEmptyText: {
    minHeight: 38,
    color: MutedText,
    lineHeight: 38,
  },
  categoryAddButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Grapefruit,
    backgroundColor: WarmSurface,
  },
  categoryAddButtonOpen: {
    borderColor: Grapefruit,
    backgroundColor: Grapefruit,
  },
  categoryOptionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    borderRadius: 20,
    backgroundColor: WarmGray,
    padding: Spacing.two,
  },
  chip: {
    minHeight: 42,
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    backgroundColor: WarmGray,
    paddingHorizontal: Spacing.three,
  },
  chipSelected: {
    borderColor: Grapefruit,
    backgroundColor: Grapefruit,
  },
  chipText: {
    color: MutedText,
  },
  chipTextSelected: {
    color: WarmSurface,
  },
  photoRow: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  photoAddSlot: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    backgroundColor: WarmGray,
  },
  photoAddIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: GrapefruitSoft,
  },
  photoPreview: {
    width: 112,
    height: 112,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: WarmGray,
  },
  photoPreviewImage: {
    width: "100%",
    height: "100%",
  },
  photoRemoveButton: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "rgba(32, 26, 26, 0.72)",
  },
  photoText: {
    color: MutedText,
  },
  twoColumn: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  mapPreview: {
    height: 360,
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: WarmGray,
  },
  locationMap: {
    flex: 1,
    backgroundColor: WarmGray,
  },
  mapSearchPanel: {
    position: "absolute",
    left: Spacing.two,
    right: Spacing.two,
    top: Spacing.two,
    gap: Spacing.two,
    borderRadius: 24,
    backgroundColor: WarmSurface,
    padding: Spacing.one,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  mapSearchTopRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  mapSearchInputWrap: {
    flex: 1,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  mapSearchInput: {
    flex: 1,
    color: Charcoal,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: Spacing.two,
  },
  mapSearchButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: Grapefruit,
  },
  mapSearchButtonLoadingText: {
    color: WarmSurface,
    lineHeight: 18,
  },
  locationSearchingRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
  },
  locationSearchingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Grapefruit,
  },
  locationSearchingText: {
    color: MutedText,
    fontSize: 12,
    lineHeight: 15,
  },
  locationSuggestions: {
    overflow: "hidden",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: WarmBorder,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  locationSuggestion: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  locationSuggestionIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: GrapefruitSoft,
  },
  locationSuggestionCopy: {
    flex: 1,
    minWidth: 0,
  },
  locationSuggestionTitle: {
    color: Charcoal,
    fontSize: 13,
    lineHeight: 17,
  },
  locationSuggestionMeta: {
    color: MutedText,
    fontSize: 12,
    lineHeight: 16,
  },
  mapHintPill: {
    position: "absolute",
    left: Spacing.two,
    bottom: Spacing.two,
    minHeight: 32,
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: WarmSurface,
    paddingHorizontal: Spacing.two,
  },
  mapHintText: {
    color: Grapefruit,
    fontSize: 12,
    lineHeight: 15,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 24,
    backgroundColor: WarmGray,
    padding: Spacing.one,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  segmentSelected: {
    backgroundColor: Grapefruit,
  },
  segmentText: {
    color: MutedText,
  },
  segmentTextSelected: {
    color: WarmSurface,
  },
  agePanel: {
    gap: Spacing.three,
    borderRadius: 24,
    backgroundColor: WarmGray,
    padding: Spacing.three,
  },
  ageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  fieldHint: {
    maxWidth: 260,
    color: MutedText,
  },
  agePresetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.two,
  },
  agePreset: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: WarmSurface,
    paddingHorizontal: Spacing.three,
  },
  agePresetSelected: {
    backgroundColor: Charcoal,
  },
  agePresetText: {
    color: MutedText,
  },
  agePresetTextSelected: {
    color: WarmSurface,
  },
  ageRangeBar: {
    width: "100%",
    height: 8,
    marginTop: Spacing.two,
    borderRadius: 999,
    backgroundColor: WarmSurface,
  },
  ageRangeFill: {
    position: "absolute",
    left: "22%",
    right: "28%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: Grapefruit,
  },
  ageThumb: {
    position: "absolute",
    top: -6,
    width: 20,
    height: 20,
    marginLeft: -10,
    borderRadius: 10,
    backgroundColor: WarmSurface,
    borderWidth: 5,
    borderColor: Grapefruit,
  },
  ageRangeText: {
    width: "100%",
    color: Charcoal,
  },
  previewHero: {
    minHeight: 190,
    justifyContent: "flex-end",
    gap: Spacing.two,
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: Grapefruit,
    padding: Spacing.three,
  },
  previewBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: WarmSurface,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  previewBadgeText: {
    color: Grapefruit,
  },
  previewTitle: {
    color: WarmSurface,
    fontSize: 30,
    lineHeight: 35,
  },
  previewMeta: {
    color: GrapefruitSoft,
  },
  previewRow: {
    flexDirection: "row",
    gap: Spacing.three,
    borderRadius: 20,
    backgroundColor: WarmGray,
    padding: Spacing.three,
  },
  previewIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: GrapefruitSoft,
  },
  previewCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  previewLabel: {
    color: MutedText,
  },
  previewValue: {
    color: Charcoal,
    fontWeight: "700",
  },
  fixedActions: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 25,
    elevation: 25,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two,
    borderRadius: 32,
    backgroundColor: WarmSurface,
    padding: Spacing.one,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 28,
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderRadius: 26,
    backgroundColor: Grapefruit,
    paddingHorizontal: Spacing.three,
  },
  primaryButtonText: {
    color: WarmSurface,
  },
  secondaryButton: {
    minWidth: 106,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    backgroundColor: WarmSurface,
    paddingHorizontal: Spacing.three,
  },
  secondaryButtonText: {
    color: Charcoal,
  },
  secondaryButtonTextDisabled: {
    color: WarmBorder,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  donePanel: {
    flex: 1,
    minHeight: 520,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    borderRadius: 32,
    backgroundColor: WarmGray,
    padding: Spacing.four,
  },
  doneIcon: {
    width: 74,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 37,
    backgroundColor: Green,
  },
  doneEyebrow: {
    color: Green,
    textTransform: "uppercase",
  },
  doneTitle: {
    color: Charcoal,
    textAlign: "center",
  },
  doneBody: {
    maxWidth: 420,
    color: MutedText,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.68,
  },
});
