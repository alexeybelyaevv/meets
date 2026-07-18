import { Controller, useForm, useWatch } from "react-hook-form";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  ZoomIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  EVENT_CATEGORY_OPTIONS,
  type EventCategoryOption,
} from "@/features/events/data/event-categories";
import { getTestEventImage } from "@/screens/main/data/event-images";
import {
  Charcoal,
  Grapefruit,
  MutedText,
  WarmBorder,
  WarmSurface,
  styles,
} from "./styles";
import { createEvent } from "@/features/events/api/events-api";
import {
  ControlledInput,
  ControlledNumberPicker,
  FieldLabel,
  PreviewRow,
} from "./components/form-controls";
import { ControlledDateTimePicker } from "./components/date-time-field";
import { defaultValues, steps } from "./data/form-options";
import { formatEventDate, formatEventTime } from "./lib/date-time";
import { toCreateEventDto } from "./lib/event-payload";
import { createLocationMapHtml } from "./lib/location-map-html";
import {
  escapeOverpassRegex,
  formatOsmAddress,
  getOsmAmenityValues,
} from "./lib/osm";
import type { EventFormValues, LocationSuggestion } from "./types";

const stepCopy: Record<
  (typeof steps)[number]["id"],
  { description: string; title: string }
> = {
  basics: {
    description: "Give people a reason to stop scrolling and join.",
    title: "Make it irresistible",
  },
  place: {
    description: "Choose when it happens and pin the exact meeting spot.",
    title: "Set the moment",
  },
  people: {
    description: "Shape the group, price, and expectations.",
    title: "Make it feel right",
  },
  review: {
    description: "One final look before your event goes live.",
    title: "Ready to publish",
  },
};

const priceOptions = [
  {
    accessibilityLabel: "The event is free",
    label: "Free",
    value: "free",
  },
  {
    accessibilityLabel: "Everyone pays separately at the venue",
    label: "Pay on site",
    value: "pay-on-site",
  },
  {
    accessibilityLabel: "Guests pay a fee to the organizer",
    label: "Host fee",
    value: "host-fee",
  },
] as const;

function CreateCategoryOption({
  category,
  onPress,
  selected,
}: {
  category: EventCategoryOption;
  onPress: () => void;
  selected: boolean;
}) {
  const selectionProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectionProgress.set(
      withTiming(selected ? 1 : 0, {
        duration: 160,
      }),
    );
  }, [selected, selectionProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      ["#F8F6F5", Grapefruit],
    ),
    borderColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      ["#E8E2DF", Grapefruit],
    ),
  }));

  return (
    <Animated.View style={[styles.categoryTile, animatedStyle]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.categoryTilePressable,
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          name={category.icon}
          size={17}
          tintColor={selected ? WarmSurface : Charcoal}
          weight="bold"
        />
        <ThemedText
          numberOfLines={2}
          type="smallBold"
          style={[
            styles.categoryTileText,
            selected && styles.categoryTileTextSelected,
          ]}
        >
          {category.label}
        </ThemedText>
        {selected ? (
          <Animated.View entering={FadeIn.duration(120)}>
            <SymbolView
              name={{
                ios: "checkmark",
                android: "check",
                web: "check",
              }}
              size={14}
              tintColor={WarmSurface}
              weight="bold"
            />
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export default function CreateScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [composerHeaderHeight, setComposerHeaderHeight] = useState(184);
  const [created, setCreated] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSearching, setLocationSearching] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const insets = useSafeAreaInsets();
  const primaryButtonScale = useSharedValue(1);
  const secondaryButtonScale = useSharedValue(1);
  const primaryButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: primaryButtonScale.value }],
  }));
  const secondaryButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryButtonScale.value }],
  }));
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
    setValue,
  } = useForm<EventFormValues>({ defaultValues });
  const values = useWatch({ control });
  const activeStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const bottomPadding = BottomNavigationInset + 76;
  const activeStepCopy = stepCopy[activeStep.id];
  const previewImageSource = values.photos?.[0]
    ? { uri: values.photos[0] }
    : getTestEventImage(3);
  const previewCategoryLabel =
    EVENT_CATEGORY_OPTIONS.find(
      (category) => category.id === values.categories?.[0],
    )?.label ?? "Event";
  const primaryActionLabel = isLastStep
    ? isSubmitting
      ? "Publishing..."
      : "Publish event"
    : stepIndex === steps.length - 2
      ? "Review event"
      : `Next: ${steps[stepIndex + 1].title}`;

  const goToStep = (nextIndex: number) => {
    if (nextIndex === stepIndex) {
      return;
    }

    Keyboard.dismiss();
    setStepIndex(nextIndex);
  };

  const goNext = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    goToStep(Math.min(stepIndex + 1, steps.length - 1));
  };

  const goBack = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
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
    void Haptics.selectionAsync();
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
        void Haptics.selectionAsync();
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
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  };

  const onSubmit = handleSubmit(async (formValues) => {
    const payload = toCreateEventDto(formValues);

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createEvent(payload);

      setCreated(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (Platform.OS === "web") {
        console.log("Created event", payload);
      }
    } catch (error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Could not create event",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  });

  if (created) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              styles.doneContent,
              {
                paddingTop: insets.top + Spacing.three,
                paddingBottom: bottomPadding,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              entering={FadeInDown.duration(420).easing(
                Easing.out(Easing.cubic),
              )}
              style={styles.donePanel}
            >
              <Animated.View
                entering={ZoomIn.delay(120).springify().damping(16)}
                style={styles.doneIconHalo}
              >
                <View style={styles.doneIcon}>
                  <SymbolView
                    name={{ ios: "checkmark", android: "check", web: "check" }}
                    size={34}
                    tintColor={WarmSurface}
                    weight="bold"
                  />
                </View>
              </Animated.View>
              <Animated.View
                entering={FadeInDown.delay(180).duration(320)}
                style={styles.doneCopy}
              >
                <ThemedText type="smallBold" style={styles.doneEyebrow}>
                  Published
                </ThemedText>
                <ThemedText type="subtitle" style={styles.doneTitle}>
                  Your plan is live
                </ThemedText>
                <ThemedText type="default" style={styles.doneBody}>
                  People nearby can now discover it, join in, and make it
                  happen with you.
                </ThemedText>
              </Animated.View>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void Haptics.impactAsync(
                    Haptics.ImpactFeedbackStyle.Soft,
                  );
                  reset(defaultValues);
                  setLocationSearch("");
                  setLocationSuggestions([]);
                  setCreated(false);
                  goToStep(0);
                }}
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.doneAction,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  Create another
                </ThemedText>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
        <BottomNavigation />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
        <View
          style={[
            styles.composerDock,
            { paddingTop: insets.top + Spacing.two },
          ]}
        >
          <View
            onLayout={(event) => {
              const nextHeight = Math.ceil(event.nativeEvent.layout.height);

              setComposerHeaderHeight((currentHeight) =>
                currentHeight === nextHeight ? currentHeight : nextHeight,
              );
            }}
            style={styles.composerHeader}
          >
            <View style={styles.composerMeta}>
              <View style={styles.composerBadge}>
                <View style={styles.composerBadgeDot} />
                <ThemedText type="smallBold" style={styles.composerBadgeText}>
                  New event
                </ThemedText>
              </View>
              <ThemedText type="smallBold" style={styles.composerCount}>
                {String(stepIndex + 1).padStart(2, "0")} /{" "}
                {String(steps.length).padStart(2, "0")}
              </ThemedText>
            </View>

            <View style={styles.composerProgress}>
              {steps.map((step, index) => {
                const reached = index <= stepIndex;
                const current = index === stepIndex;

                return (
                  <Pressable
                    key={step.id}
                    accessibilityLabel={`Go to ${step.title}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: current }}
                    disabled={index > stepIndex}
                    hitSlop={8}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      goToStep(index);
                    }}
                    style={[
                      styles.composerSegment,
                      current && styles.composerSegmentCurrent,
                    ]}
                  >
                    {reached ? (
                      <Animated.View
                        entering={FadeIn.duration(180)}
                        style={styles.composerSegmentFill}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Animated.View
              key={activeStep.id}
              entering={FadeInDown.duration(240).easing(
                Easing.out(Easing.cubic),
              )}
              style={styles.composerCopy}
            >
              <ThemedText type="smallBold" style={styles.composerKicker}>
                {activeStep.title}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.composerTitle}>
                {activeStepCopy.title}
              </ThemedText>
              <ThemedText type="default" style={styles.composerDescription}>
                {activeStepCopy.description}
              </ThemedText>
            </Animated.View>
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
                paddingTop:
                  insets.top +
                  Spacing.two +
                  composerHeaderHeight +
                  Spacing.three,
                paddingBottom: bottomPadding,
              },
            ]}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              key={activeStep.id}
              entering={FadeInDown.duration(320)
                .delay(40)
                .easing(Easing.out(Easing.cubic))}
              exiting={FadeOut.duration(150).easing(
                Easing.in(Easing.cubic),
              )}
              style={styles.stepPanel}
            >
              {stepIndex === 0 && (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(120)}
                  style={styles.stepBody}
                >
                  <ControlledInput
                    control={control}
                    icon={{
                      ios: "pencil",
                      android: "edit",
                      web: "edit",
                    }}
                    label="Event name"
                    name="title"
                    placeholder="Rooftop board games"
                  />
                  <ControlledInput
                    control={control}
                    icon={{
                      ios: "text.alignleft",
                      android: "subject",
                      web: "subject",
                    }}
                    label="Description"
                    multiline
                    name="description"
                    placeholder="What will happen, who should join, and what is the vibe?"
                  />
                  <View style={styles.fieldGroup}>
                    <Controller
                      control={control}
                      name="categories"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.categorySelect}>
                          <View style={styles.categoryHeader}>
                            <FieldLabel label="Categories" />
                            {value.length > 0 ? (
                              <Animated.View
                                key={value.length}
                                entering={FadeIn.duration(140)}
                                style={styles.categoryCount}
                              >
                                <ThemedText
                                  type="smallBold"
                                  style={styles.categoryCountText}
                                >
                                  {value.length}
                                </ThemedText>
                              </Animated.View>
                            ) : null}
                          </View>
                          <View style={styles.categoryGrid}>
                            {EVENT_CATEGORY_OPTIONS.map((category) => {
                              const selected = value.includes(category.id);

                              return (
                                <CreateCategoryOption
                                  category={category}
                                  key={category.id}
                                  onPress={() => {
                                    Keyboard.dismiss();
                                    void Haptics.selectionAsync();
                                    onChange(
                                      selected
                                        ? value.filter(
                                            (item) => item !== category.id,
                                          )
                                        : [...value, category.id],
                                    );
                                  }}
                                  selected={selected}
                                />
                              );
                            })}
                          </View>
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
                            <Animated.View
                              key={uri}
                              entering={FadeInDown.duration(220)}
                              style={styles.photoPreview}
                            >
                              <Image
                                source={{ uri }}
                                style={styles.photoPreviewImage}
                              />
                              <Pressable
                                accessibilityRole="button"
                                onPress={() => {
                                  Keyboard.dismiss();
                                  void Haptics.selectionAsync();
                                  onChange(
                                    value.filter((item) => item !== uri),
                                  );
                                }}
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
                            </Animated.View>
                          ))}
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                              Keyboard.dismiss();
                              void pickPhotos(value);
                            }}
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
                  <View style={styles.dateTimeStack}>
                    <ControlledDateTimePicker
                      control={control}
                      icon={{
                        ios: "calendar",
                        android: "calendar_month",
                        web: "calendar_month",
                      }}
                      label="Date"
                      mode="date"
                      name="date"
                    />
                    <ControlledDateTimePicker
                      control={control}
                      icon={{
                        ios: "clock",
                        android: "schedule",
                        web: "schedule",
                      }}
                      label="Time"
                      mode="time"
                      name="time"
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
                    icon={{
                      ios: "mappin",
                      android: "location_on",
                      web: "location_on",
                    }}
                    label="Place name"
                    name="locationName"
                    placeholder="Sky Park"
                  />
                  <ControlledInput
                    control={control}
                    icon={{
                      ios: "map",
                      android: "map",
                      web: "map",
                    }}
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
                    <View style={styles.column}>
                      <ControlledNumberPicker
                        control={control}
                        label="Capacity"
                        max={50}
                        min={2}
                        name="capacity"
                      />
                    </View>
                    <View style={styles.column}>
                      <ControlledNumberPicker
                        control={control}
                        label="Already joined"
                        max={50}
                        min={0}
                        name="peopleAlreadyThere"
                      />
                    </View>
                  </View>
                  <View style={styles.fieldGroup}>
                    <FieldLabel label="Price" />
                    <Controller
                      control={control}
                      name="priceType"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.priceOptions}>
                          {priceOptions.map((option) => {
                            const selected = value === option.value;
                            return (
                              <Pressable
                                key={option.value}
                                accessibilityLabel={option.accessibilityLabel}
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                                onPress={() => {
                                  Keyboard.dismiss();
                                  void Haptics.selectionAsync();
                                  onChange(option.value);
                                }}
                                style={({ pressed }) => [
                                  styles.priceOption,
                                  selected && styles.priceOptionSelected,
                                  pressed && styles.pressed,
                                ]}
                              >
                                <ThemedText
                                  type="smallBold"
                                  style={[
                                    styles.priceOptionText,
                                    selected &&
                                      styles.priceOptionTextSelected,
                                  ]}
                                >
                                  {option.label}
                                </ThemedText>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    />
                  </View>
                  {values.priceType === "host-fee" && (
                    <Animated.View entering={FadeInDown.duration(220)}>
                      <ControlledInput
                        control={control}
                        icon={{
                          ios: "creditcard.fill",
                          android: "payments",
                          web: "payments",
                        }}
                        keyboardType="decimal-pad"
                        label="Host fee · EUR"
                        name="priceAmount"
                        placeholder="10"
                      />
                    </Animated.View>
                  )}
                  <ControlledInput
                    control={control}
                    icon={{
                      ios: "bag.fill",
                      android: "backpack",
                      web: "backpack",
                    }}
                    label="What to bring"
                    name="bringItems"
                    placeholder="Optional, e.g. blanket, water, ID"
                  />
                </Animated.View>
              )}

              {stepIndex === 3 && (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(120)}
                  style={styles.stepBody}
                >
                  <View style={styles.previewHero}>
                    <Image
                      contentFit="cover"
                      source={previewImageSource}
                      style={styles.previewHeroImage}
                      transition={260}
                    />
                    <View style={styles.previewHeroShade} />
                    <View style={styles.previewTopLine}>
                      <View style={styles.previewBadge}>
                        <ThemedText
                          type="smallBold"
                          style={styles.previewBadgeText}
                        >
                          {previewCategoryLabel}
                        </ThemedText>
                      </View>
                      <View style={styles.previewStatus}>
                        <View style={styles.previewStatusDot} />
                        <ThemedText
                          type="smallBold"
                          style={styles.previewStatusText}
                        >
                          Preview
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.previewCopyBlock}>
                      <ThemedText
                        type="subtitle"
                        style={styles.previewTitle}
                        numberOfLines={2}
                      >
                        {values.title || "Untitled event"}
                      </ThemedText>
                      <ThemedText type="small" style={styles.previewMeta}>
                        {formatEventDate(values.date)} ·{" "}
                        {formatEventTime(values.time)} ·{" "}
                        {values.locationName || "Location"}
                      </ThemedText>
                    </View>
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
                        : values.priceType === "pay-on-site"
                          ? "Pay on site"
                          : values.priceAmount
                            ? `Host fee · €${values.priceAmount}`
                            : "Host fee"
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
          <Animated.View
            entering={FadeInUp.delay(120)
              .springify()
              .damping(20)
              .stiffness(190)}
            style={styles.actions}
          >
            <Animated.View
              style={[
                styles.secondaryActionWrap,
                secondaryButtonAnimatedStyle,
              ]}
            >
              <Pressable
                accessibilityRole="button"
                disabled={stepIndex === 0}
                onPress={goBack}
                onPressIn={() => {
                  secondaryButtonScale.set(
                    withSpring(0.96, {
                      damping: 18,
                      mass: 0.55,
                      stiffness: 320,
                    }),
                  );
                }}
                onPressOut={() => {
                  secondaryButtonScale.set(
                    withSpring(1, {
                      damping: 18,
                      mass: 0.55,
                      stiffness: 320,
                    }),
                  );
                }}
                style={[
                  styles.secondaryButton,
                  stepIndex === 0 && styles.buttonDisabled,
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
            </Animated.View>
            <Animated.View
              style={[styles.primaryActionWrap, primaryButtonAnimatedStyle]}
            >
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={isLastStep ? onSubmit : goNext}
                onPressIn={() => {
                  primaryButtonScale.set(
                    withSpring(0.97, {
                      damping: 18,
                      mass: 0.55,
                      stiffness: 320,
                    }),
                  );
                }}
                onPressOut={() => {
                  primaryButtonScale.set(
                    withSpring(1, {
                      damping: 18,
                      mass: 0.55,
                      stiffness: 320,
                    }),
                  );
                }}
                style={[
                  styles.primaryButton,
                  isSubmitting && styles.buttonDisabled,
                ]}
              >
                <Animated.View
                  key={primaryActionLabel}
                  entering={FadeInUp.duration(200)}
                  style={styles.primaryButtonContent}
                >
                  <ThemedText type="smallBold" style={styles.primaryButtonText}>
                    {primaryActionLabel}
                  </ThemedText>
                  {isSubmitting ? (
                    <ActivityIndicator color={WarmSurface} size="small" />
                  ) : (
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
                  )}
                </Animated.View>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>
      </SafeAreaView>
      <BottomNavigation />
    </ThemedView>
  );
}
