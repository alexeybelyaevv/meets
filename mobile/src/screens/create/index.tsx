import { Controller, useForm, useWatch } from "react-hook-form";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { Spacing } from "@/constants/theme";
import {
  Charcoal,
  Grapefruit,
  GrapefruitSoft,
  MutedText,
  WarmBorder,
  WarmSurface,
  styles,
} from "./styles";
import { createEvent } from "@/features/events/api/events-api";
import {
  ControlledInput,
  FieldLabel,
  PreviewRow,
} from "./components/form-controls";
import {
  agePresets,
  categories,
  defaultValues,
  steps,
} from "./data/form-options";
import { toCreateEventDto } from "./lib/event-payload";
import { createLocationMapHtml } from "./lib/location-map-html";
import {
  escapeOverpassRegex,
  formatOsmAddress,
  getOsmAmenityValues,
} from "./lib/osm";
import type { EventFormValues, LocationSuggestion } from "./types";

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
            result.display_name ??
            `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
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
        Number(values.locationLatitude) ||
        Number(defaultValues.locationLatitude);
      const centerLongitude =
        Number(values.locationLongitude) ||
        Number(defaultValues.locationLongitude);
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
          Alert.alert(
            "Location not found",
            "Try a more specific place or address.",
          );
        }
        return;
      }

      setLocationSuggestions(suggestions);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      if (options?.showAlert) {
        Alert.alert(
          "Location search failed",
          "Check connection and try again.",
        );
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

      setValue(
        "locationName",
        result.name || address.split(",")[0] || "Map point",
      );
      setValue("locationAddress", address);
    } catch {
      setValue("locationName", "Map point");
      setValue(
        "locationAddress",
        `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      );
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

  const onSubmit = handleSubmit(async (formValues) => {
    const payload = toCreateEventDto(formValues);

    try {
      await createEvent(payload);

      setCreated(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (Platform.OS === "web") {
        console.log("Created event", payload);
      }
    } catch (error) {
      Alert.alert(
        "Could not create event",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
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
                                    onPress={() =>
                                      onChange([...value, category])
                                    }
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
                                  onChange(value.filter((item) => item !== uri))
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
                      placeholder="2026-07-12"
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
                          values.locationLatitude ??
                            defaultValues.locationLatitude,
                          values.locationLongitude ??
                            defaultValues.locationLongitude,
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
                      label="Capacity"
                      name="capacity"
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
                      placeholder="10"
                    />
                  )}
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
                    value={`${values.peopleAlreadyThere || 0}/${values.capacity || 0} already planned`}
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
                    value={values.bringItems || "Nothing special"}
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
