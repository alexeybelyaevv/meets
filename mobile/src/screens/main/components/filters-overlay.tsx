import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  LinearTransition,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import {
  Charcoal,
  Grapefruit,
  WarmSurface,
  styles,
} from "../styles";

type FiltersOverlayProps = {
  closeFilters: () => void;
  filtersContentProgress: SharedValue<number>;
  filtersExpandedHeight: number;
  filtersProgress: SharedValue<number>;
  searchSubtitle?: string;
  searchTitle?: string;
  searchBarWidth: number;
  submitLabel?: string;
  topOverlayOffset: number;
};

export function FiltersOverlay({
  closeFilters,
  filtersContentProgress,
  filtersExpandedHeight,
  filtersProgress,
  searchSubtitle = "Anywhere · any time · filters",
  searchTitle = "Search plans",
  searchBarWidth,
  submitLabel = "Show 24 plans",
  topOverlayOffset,
}: FiltersOverlayProps) {
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
  const availabilitySectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.4,
  );

  return (
    <Animated.View style={styles.filtersOverlay}>
      <Animated.View
        pointerEvents="none"
        style={[styles.filtersMorphGlow, filtersGlowAnimatedStyle]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.filtersMorphSurface, filtersMorphSurfaceAnimatedStyle]}
      >
        <Animated.View
          style={[styles.filtersMorphBarGhost, filtersBarGhostAnimatedStyle]}
        >
          <SearchGhost title={searchTitle} subtitle={searchSubtitle} />
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
          <WhenFilterSection
            animatedStyle={whenSectionAnimatedStyle}
          />
          <CategoryFilterSection
            animatedStyle={categorySectionAnimatedStyle}
          />
          <PriceFilterSection animatedStyle={priceSectionAnimatedStyle} />
          <AvailabilityFilterSection
            animatedStyle={availabilitySectionAnimatedStyle}
          />
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
              {submitLabel}
            </ThemedText>
          </Pressable>
          <View style={{ height: 18 }} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

type WhenPreset = "anytime" | "today" | "tomorrow" | "weekend" | "custom";

function WhenFilterSection({ animatedStyle }: { animatedStyle: object }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const weekendStart = useMemo(() => getWeekendStart(today), [today]);
  const weekendEnd = useMemo(() => addDays(weekendStart, 1), [weekendStart]);
  const [selectedPreset, setSelectedPreset] =
    useState<WhenPreset>("anytime");
  const [rangeStart, setRangeStart] = useState(today);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(today);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(today));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarDays = useMemo(
    () => createCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const canShowPreviousMonth =
    compareMonths(visibleMonth, startOfMonth(today)) > 0;
  const presets: {
    end?: Date;
    key: Exclude<WhenPreset, "custom">;
    label: string;
    start?: Date;
  }[] = [
    {
      key: "anytime",
      label: "Any time",
    },
    {
      end: today,
      key: "today",
      label: "Today",
      start: today,
    },
    {
      end: tomorrow,
      key: "tomorrow",
      label: "Tomorrow",
      start: tomorrow,
    },
    {
      end: weekendEnd,
      key: "weekend",
      label: "Weekend",
      start: weekendStart,
    },
  ];

  const selectPreset = (
    preset: Exclude<WhenPreset, "custom">,
    start?: Date,
    end?: Date,
  ) => {
    if (start && end) {
      setRangeStart(start);
      setRangeEnd(end);
    }
    setSelectedPreset(preset);
    setCalendarOpen(false);
  };

  const toggleCalendar = () => {
    if (!calendarOpen) {
      setVisibleMonth(startOfMonth(rangeStart));
    }
    setCalendarOpen((open) => !open);
  };

  const selectCalendarDay = (date: Date) => {
    if (selectedPreset !== "custom" || rangeEnd) {
      setRangeStart(date);
      setRangeEnd(null);
      setSelectedPreset("custom");
      return;
    }

    if (date.getTime() < rangeStart.getTime()) {
      setRangeStart(date);
      return;
    }

    setRangeEnd(date);
  };

  const resetCalendarRange = () => {
    setSelectedPreset("anytime");
    setRangeStart(today);
    setRangeEnd(today);
    setVisibleMonth(startOfMonth(today));
  };

  return (
    <Animated.View
      layout={LinearTransition.duration(180)}
      style={[styles.filterSection, styles.whenSection, animatedStyle]}
    >
      <View style={styles.whenSectionHeader}>
        <ThemedText type="default" style={styles.filterSectionTitle}>
          When
        </ThemedText>
        <Pressable
          accessibilityLabel={
            selectedPreset === "custom"
              ? rangeEnd
                ? `Selected ${formatLongDate(rangeStart)} to ${formatLongDate(rangeEnd)}`
                : `Start date ${formatLongDate(rangeStart)}. Choose an end date`
              : "Choose a date range"
          }
          accessibilityRole="button"
          accessibilityState={{
            expanded: calendarOpen,
            selected: selectedPreset === "custom",
          }}
          hitSlop={6}
          onPress={toggleCalendar}
          style={({ pressed }) => [
            styles.whenCalendarTrigger,
            (calendarOpen || selectedPreset === "custom") &&
              styles.whenCalendarTriggerActive,
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{
              ios: "calendar",
              android: "calendar_today",
              web: "calendar_today",
            }}
            size={17}
            tintColor={
              calendarOpen || selectedPreset === "custom"
                ? WarmSurface
                : Grapefruit
            }
            weight="bold"
          />
          {selectedPreset === "custom" && (
            <ThemedText type="smallBold" style={styles.whenCalendarTriggerText}>
              {formatRange(rangeStart, rangeEnd)}
            </ThemedText>
          )}
        </Pressable>
      </View>

      <View style={styles.whenPresetGrid}>
        {presets.map((preset) => {
          const selected = selectedPreset === preset.key;

          return (
            <FilterSegmentOption
              key={preset.key}
              label={preset.label}
              onPress={() =>
                selectPreset(preset.key, preset.start, preset.end)
              }
              selected={selected}
            />
          );
        })}
      </View>

      {calendarOpen && (
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(110)}
          style={styles.calendar}
        >
          <View style={styles.calendarHeader}>
            <Pressable
              accessibilityLabel="Previous month"
              accessibilityRole="button"
              disabled={!canShowPreviousMonth}
              hitSlop={6}
              onPress={() =>
                setVisibleMonth((month) => addMonths(month, -1))
              }
              style={({ pressed }) => [
                styles.calendarArrow,
                !canShowPreviousMonth && styles.calendarArrowDisabled,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "chevron.left",
                  android: "chevron_left",
                  web: "chevron_left",
                }}
                size={17}
                tintColor={Charcoal}
                weight="bold"
              />
            </Pressable>
            <ThemedText type="smallBold" style={styles.calendarMonthLabel}>
              {formatMonth(visibleMonth)}
            </ThemedText>
            <Pressable
              accessibilityLabel="Next month"
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => setVisibleMonth((month) => addMonths(month, 1))}
              style={({ pressed }) => [
                styles.calendarArrow,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "chevron.right",
                  android: "chevron_right",
                  web: "chevron_right",
                }}
                size={17}
                tintColor={Charcoal}
                weight="bold"
              />
            </Pressable>
          </View>

          <Animated.View
            entering={FadeIn.duration(130)}
            exiting={FadeOut.duration(80)}
            key={`${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`}
          >
            <View style={styles.calendarWeekRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <ThemedText
                  key={`${day}-${index}`}
                  type="smallBold"
                  style={styles.calendarWeekday}
                >
                  {day}
                </ThemedText>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <View
                      key={`empty-${index}`}
                      style={styles.calendarDayCell}
                    />
                  );
                }

                const rangeActive = selectedPreset === "custom";
                const isRangeStart =
                  rangeActive && isSameCalendarDay(date, rangeStart);
                const isRangeEnd =
                  rangeActive &&
                  rangeEnd !== null &&
                  isSameCalendarDay(date, rangeEnd);
                const isInRange =
                  rangeActive &&
                  rangeEnd !== null &&
                  date.getTime() >= rangeStart.getTime() &&
                  date.getTime() <= rangeEnd.getTime();
                const hasRangeSpan =
                  rangeEnd !== null &&
                  !isSameCalendarDay(rangeStart, rangeEnd);
                const hasRangeFill = isInRange && hasRangeSpan;
                const startsRangeSegment =
                  hasRangeFill && (isRangeStart || date.getDay() === 0);
                const endsRangeSegment =
                  hasRangeFill && (isRangeEnd || date.getDay() === 6);
                const isRangeEndpoint = isRangeStart || isRangeEnd;
                const isToday = isSameCalendarDay(date, today);
                const disabled = date.getTime() < today.getTime();

                return (
                  <View
                    key={date.toISOString()}
                    style={[
                      styles.calendarDayCell,
                      hasRangeFill && styles.calendarDayCellInRange,
                      startsRangeSegment && styles.calendarDayCellRangeStart,
                      endsRangeSegment && styles.calendarDayCellRangeEnd,
                    ]}
                  >
                    <Pressable
                      accessibilityLabel={formatLongDate(date)}
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled,
                        selected: isInRange || isRangeEndpoint,
                      }}
                      disabled={disabled}
                      onPress={() => selectCalendarDay(date)}
                      style={({ pressed }) => [
                        styles.calendarDayButton,
                        isToday && styles.calendarToday,
                        isRangeEndpoint && styles.calendarDaySelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.calendarDayText,
                          disabled && styles.calendarDayTextDisabled,
                          isToday && styles.calendarTodayText,
                          isInRange && styles.calendarDayTextInRange,
                          isRangeEndpoint && styles.calendarDayTextSelected,
                        ]}
                      >
                        {date.getDate()}
                      </ThemedText>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </Animated.View>
          <View style={styles.calendarFooter}>
            <Pressable
              accessibilityRole="button"
              disabled={selectedPreset === "anytime"}
              onPress={resetCalendarRange}
              style={({ pressed }) => [
                styles.calendarResetButton,
                selectedPreset === "anytime" &&
                  styles.calendarActionDisabled,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold" style={styles.calendarResetText}>
                Reset
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={selectedPreset === "custom" && rangeEnd === null}
              onPress={() => setCalendarOpen(false)}
              style={({ pressed }) => [
                styles.calendarDoneButton,
                selectedPreset === "custom" &&
                  rangeEnd === null &&
                  styles.calendarActionDisabled,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold" style={styles.calendarDoneText}>
                Done
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function FilterSegmentOption({
  accessibilityLabel,
  label,
  onPress,
  selected,
}: {
  accessibilityLabel?: string;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const selectionProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectionProgress.value = withTiming(selected ? 1 : 0, {
      duration: 160,
    });
  }, [selected, selectionProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      ["rgba(255, 90, 95, 0)", Grapefruit],
    ),
  }));

  return (
    <Animated.View style={[styles.whenPreset, animatedStyle]}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.whenPresetPressable,
          pressed && styles.pressed,
        ]}
      >
        <ThemedText
          type="smallBold"
          style={[
            styles.whenPresetLabel,
            selected && styles.whenPresetLabelSelected,
          ]}
        >
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

type PriceMode = "all" | "free" | "pay-on-site" | "host-fee";

const PRICE_OPTIONS: {
  accessibilityLabel?: string;
  key: PriceMode;
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "free", label: "Free" },
  {
    accessibilityLabel: "Pay separately at the venue",
    key: "pay-on-site",
    label: "Pay on site",
  },
  {
    accessibilityLabel: "Pay a fee to the organizer",
    key: "host-fee",
    label: "Host fee",
  },
];

function PriceFilterSection({ animatedStyle }: { animatedStyle: object }) {
  const [selectedMode, setSelectedMode] = useState<PriceMode>("all");

  return (
    <Animated.View
      style={[styles.filterSection, styles.priceSection, animatedStyle]}
    >
      <ThemedText type="default" style={styles.filterSectionTitle}>
        Price
      </ThemedText>
      <View style={styles.whenPresetGrid}>
        {PRICE_OPTIONS.map((option) => (
          <FilterSegmentOption
            accessibilityLabel={option.accessibilityLabel}
            key={option.key}
            label={option.label}
            onPress={() => setSelectedMode(option.key)}
            selected={selectedMode === option.key}
          />
        ))}
      </View>
    </Animated.View>
  );
}

type AvailabilityOptionId = "open-spots" | "instant-join";

const AVAILABILITY_OPTIONS: {
  id: AvailabilityOptionId;
  label: string;
}[] = [
  { id: "open-spots", label: "Open spots only" },
  { id: "instant-join", label: "Instant join only" },
];

function AvailabilityFilterSection({
  animatedStyle,
}: {
  animatedStyle: object;
}) {
  const [selectedOptions, setSelectedOptions] = useState<
    Set<AvailabilityOptionId>
  >(() => new Set());

  const toggleOption = (optionId: AvailabilityOptionId) => {
    setSelectedOptions((current) => {
      const next = new Set(current);

      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }

      return next;
    });
  };

  return (
    <Animated.View
      style={[styles.filterSection, styles.availabilitySection, animatedStyle]}
    >
      <ThemedText type="default" style={styles.filterSectionTitle}>
        Availability
      </ThemedText>
      <View style={styles.availabilityList}>
        {AVAILABILITY_OPTIONS.map((option, index) => (
          <AvailabilityCheckboxRow
            key={option.id}
            label={option.label}
            onPress={() => toggleOption(option.id)}
            selected={selectedOptions.has(option.id)}
            showDivider={index > 0}
          />
        ))}
      </View>
    </Animated.View>
  );
}

function AvailabilityCheckboxRow({
  label,
  onPress,
  selected,
  showDivider,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
  showDivider: boolean;
}) {
  const selectionProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectionProgress.value = withTiming(selected ? 1 : 0, {
      duration: 140,
    });
  }, [selected, selectionProgress]);

  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      ["#FFFCFB", Grapefruit],
    ),
    borderColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      ["#D7D0CD", Grapefruit],
    ),
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.availabilityOption,
        showDivider && styles.availabilityOptionDivider,
        pressed && styles.pressed,
      ]}
    >
      <ThemedText type="smallBold" style={styles.availabilityOptionText}>
        {label}
      </ThemedText>
      <Animated.View
        pointerEvents="none"
        style={[styles.availabilityCheckbox, checkboxAnimatedStyle]}
      >
        {selected && (
          <Animated.View entering={FadeIn.duration(100)}>
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
        )}
      </Animated.View>
    </Pressable>
  );
}

function SearchGhost({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <>
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
          {title}
        </ThemedText>
        <ThemedText type="small" style={styles.searchSubtitle}>
          {subtitle}
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
    </>
  );
}

const CATEGORY_OPTIONS: {
  icon: SymbolViewProps["name"];
  id: string;
  label: string;
}[] = [
  {
    id: "coffee-chat",
    label: "Coffee & Chat",
    icon: {
      ios: "cup.and.saucer.fill",
      android: "local_cafe",
      web: "local_cafe",
    },
  },
  {
    id: "walk",
    label: "Walk",
    icon: {
      ios: "figure.walk",
      android: "directions_walk",
      web: "directions_walk",
    },
  },
  {
    id: "food",
    label: "Food",
    icon: { ios: "fork.knife", android: "restaurant", web: "restaurant" },
  },
  {
    id: "drinks",
    label: "Drinks",
    icon: { ios: "wineglass.fill", android: "local_bar", web: "local_bar" },
  },
  {
    id: "party-nightlife",
    label: "Party & Nightlife",
    icon: {
      ios: "party.popper.fill",
      android: "nightlife",
      web: "nightlife",
    },
  },
  {
    id: "sports",
    label: "Sports",
    icon: { ios: "figure.run", android: "sports_soccer", web: "sports_soccer" },
  },
  {
    id: "games",
    label: "Games",
    icon: {
      ios: "gamecontroller.fill",
      android: "sports_esports",
      web: "sports_esports",
    },
  },
  {
    id: "culture-events",
    label: "Culture & Events",
    icon: {
      ios: "ticket.fill",
      android: "local_activity",
      web: "local_activity",
    },
  },
  {
    id: "study-coworking",
    label: "Study & Coworking",
    icon: {
      ios: "laptopcomputer",
      android: "laptop",
      web: "laptop",
    },
  },
  {
    id: "outdoor",
    label: "Outdoor",
    icon: { ios: "leaf.fill", android: "forest", web: "forest" },
  },
  {
    id: "networking",
    label: "Networking",
    icon: {
      ios: "person.3.fill",
      android: "groups",
      web: "groups",
    },
  },
  {
    id: "other",
    label: "Other",
    icon: {
      ios: "square.grid.2x2.fill",
      android: "category",
      web: "category",
    },
  },
];

function CategoryFilterSection({ animatedStyle }: { animatedStyle: object }) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(),
  );
  const countVisibility = useSharedValue(0);

  useEffect(() => {
    countVisibility.value = withTiming(selectedCategories.size > 0 ? 1 : 0, {
      duration: 140,
    });
  }, [countVisibility, selectedCategories.size]);

  const countAnimatedStyle = useAnimatedStyle(() => ({
    opacity: countVisibility.value,
    transform: [
      {
        scale: interpolate(countVisibility.value, [0, 1], [0.92, 1]),
      },
    ],
  }));

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };

  return (
    <Animated.View
      style={[styles.filterSection, styles.categorySection, animatedStyle]}
    >
      <View style={styles.categoryHeader}>
        <ThemedText type="default" style={styles.filterSectionTitle}>
          Category
        </ThemedText>
        <Animated.View
          accessibilityElementsHidden={selectedCategories.size === 0}
          importantForAccessibility={
            selectedCategories.size === 0 ? "no-hide-descendants" : "auto"
          }
          pointerEvents="none"
          style={[styles.categoryCount, countAnimatedStyle]}
        >
          <ThemedText type="smallBold" style={styles.categoryCountText}>
            {selectedCategories.size || ""}
          </ThemedText>
        </Animated.View>
      </View>
      <View style={styles.categoryGrid}>
        {CATEGORY_OPTIONS.map((category) => (
          <CategoryOption
            category={category}
            key={category.id}
            onPress={() => toggleCategory(category.id)}
            selected={selectedCategories.has(category.id)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

function CategoryOption({
  category,
  onPress,
  selected,
}: {
  category: (typeof CATEGORY_OPTIONS)[number];
  onPress: () => void;
  selected: boolean;
}) {
  const selectionProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectionProgress.value = withTiming(selected ? 1 : 0, {
      duration: 150,
    });
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
    <Animated.View style={[styles.categoryOption, animatedStyle]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.categoryOptionPressable,
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
            styles.categoryOptionText,
            selected && styles.categoryOptionTextSelected,
          ]}
        >
          {category.label}
        </ThemedText>
        {selected && (
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
        )}
      </Pressable>
    </Animated.View>
  );
}

function useStaggeredFilterStyle(progress: SharedValue<number>, start: number) {
  const end = start + 0.28;

  return useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, start, end, 1], [0, 0, 1, 1]),
  }));
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function compareMonths(left: Date, right: Date) {
  return (
    left.getFullYear() * 12 +
    left.getMonth() -
    (right.getFullYear() * 12 + right.getMonth())
  );
}

function getWeekendStart(today: Date) {
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7;

  if (today.getDay() === 0) {
    return addDays(today, -1);
  }

  return addDays(today, daysUntilSaturday);
}

function createCalendarDays(month: Date) {
  const leadingEmptyDays = month.getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const days: (Date | null)[] = Array.from(
    { length: leadingEmptyDays },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  return days;
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatPresetDate(date: Date) {
  return `${SHORT_MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function formatRange(start: Date, end: Date | null) {
  if (!end) {
    return `${formatPresetDate(start)} →`;
  }

  if (isSameCalendarDay(start, end)) {
    return formatPresetDate(start);
  }

  if (start.getMonth() === end.getMonth()) {
    return `${SHORT_MONTH_NAMES[start.getMonth()]} ${start.getDate()} → ${end.getDate()}`;
  }

  return `${formatPresetDate(start)} → ${formatPresetDate(end)}`;
}

function formatMonth(date: Date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatLongDate(date: Date) {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}
