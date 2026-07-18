import { SymbolView } from "expo-symbols";
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
import { EVENT_CATEGORY_OPTIONS } from "@/features/events/data/event-categories";
import {
  APP_INTL_LOCALES,
  useLocalization,
  type AppLocale,
  type Translate,
  type TranslationKey,
} from "@/features/localization/localization";
import {
  Charcoal,
  Grapefruit,
  GrapefruitSoft,
  MutedText,
  WarmSurface,
  styles,
} from "../styles";

export type WhenPreset =
  | "anytime"
  | "today"
  | "tomorrow"
  | "weekend"
  | "custom";

export type PriceMode = "all" | "free" | "pay-on-site" | "host-fee";
export type RadiusKm = 2 | 5 | 25 | 50;
export const DEFAULT_RADIUS_KM: RadiusKm = 50;

export type FilterState = {
  availability: {
    instantJoinOnly: boolean;
    openSpotsOnly: boolean;
  };
  categoryIds: string[];
  priceMode: PriceMode;
  radiusKm: RadiusKm;
  when: {
    end: Date | null;
    preset: WhenPreset;
    start: Date;
  };
};

type FiltersOverlayProps = {
  closeFilters: () => void;
  filters: FilterState;
  filtersContentProgress: SharedValue<number>;
  filtersExpandedHeight: number;
  filtersProgress: SharedValue<number>;
  onApplyFilters: (filters: FilterState) => void;
  searchSubtitle?: string;
  searchTitle?: string;
  searchBarWidth: number;
  showRadiusFilter?: boolean;
  topOverlayOffset: number;
};

export function FiltersOverlay({
  closeFilters,
  filters,
  filtersContentProgress,
  filtersExpandedHeight,
  filtersProgress,
  onApplyFilters,
  searchSubtitle,
  searchTitle,
  searchBarWidth,
  showRadiusFilter = false,
  topOverlayOffset,
}: FiltersOverlayProps) {
  const { t } = useLocalization();
  const localizedSearchSubtitle =
    searchSubtitle ?? t("filters.defaultSubtitle");
  const localizedSearchTitle = searchTitle ?? t("filters.searchPlans");
  const [draftFilters, setDraftFilters] = useState<FilterState>(() =>
    cloneFilterState(filters),
  );
  const [resetVersion, setResetVersion] = useState(0);
  const appliedFilterCount = getActiveFilterCount(filters);
  const draftFilterCount = getActiveFilterCount(draftFilters);
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
    0.32,
  );
  const priceSectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.4,
  );
  const radiusSectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.24,
  );
  const availabilitySectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.48,
  );
  const commitAndClose = () => {
    onApplyFilters(normalizeFilterState(draftFilters));
    closeFilters();
  };
  const resetFilters = () => {
    const resetState = createDefaultFilterState();

    setDraftFilters(resetState);
    onApplyFilters(cloneFilterState(resetState));
    setResetVersion((version) => version + 1);
  };

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
          <SearchGhost
            activeFilterCount={appliedFilterCount}
            title={localizedSearchTitle}
            subtitle={localizedSearchSubtitle}
          />
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
            accessibilityLabel={t("filters.doneA11y")}
            accessibilityRole="button"
            hitSlop={10}
            onPress={commitAndClose}
            style={({ pressed }) => [
              styles.filtersCloseButton,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={{
                ios: "checkmark",
                android: "check",
                web: "check",
              }}
              size={18}
              tintColor={Grapefruit}
              weight="bold"
            />
          </Pressable>
          <ThemedText type="default" style={styles.filtersHeaderTitle}>
            {t("filters.title")}
          </ThemedText>
          <FiltersResetButton
            disabled={draftFilterCount === 0}
            onPress={resetFilters}
          />
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
            key={`when-${resetVersion}`}
            onChange={(when) =>
              setDraftFilters((current) => ({ ...current, when }))
            }
            value={draftFilters.when}
          />
          {showRadiusFilter && (
            <RadiusFilterSection
              animatedStyle={radiusSectionAnimatedStyle}
              onChange={(radiusKm) =>
                setDraftFilters((current) => ({ ...current, radiusKm }))
              }
              value={draftFilters.radiusKm}
            />
          )}
          <CategoryFilterSection
            animatedStyle={categorySectionAnimatedStyle}
            onChange={(categoryIds) =>
              setDraftFilters((current) => ({ ...current, categoryIds }))
            }
            value={draftFilters.categoryIds}
          />
          <PriceFilterSection
            animatedStyle={priceSectionAnimatedStyle}
            onChange={(priceMode) =>
              setDraftFilters((current) => ({ ...current, priceMode }))
            }
            value={draftFilters.priceMode}
          />
          <AvailabilityFilterSection
            animatedStyle={availabilitySectionAnimatedStyle}
            onChange={(availability) =>
              setDraftFilters((current) => ({ ...current, availability }))
            }
            value={draftFilters.availability}
          />
        </ScrollView>

        <Animated.View
          style={[styles.filtersSubmitWrap, filtersSubmitAnimatedStyle]}
        >
          <Pressable
            accessibilityRole="button"
            onPress={commitAndClose}
            style={({ pressed }) => [
              styles.filtersSubmitButton,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={{
                ios: "checkmark",
                android: "check",
                web: "check",
              }}
              size={18}
              tintColor={WarmSurface}
              weight="bold"
            />
            <ThemedText type="smallBold" style={styles.filtersSubmitText}>
              {t("filters.apply")}
            </ThemedText>
          </Pressable>
          <View style={styles.filtersSubmitBottomSpacer} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

function FiltersResetButton({
  disabled,
  onPress,
}: {
  disabled: boolean;
  onPress: () => void;
}) {
  const { t } = useLocalization();
  const activeProgress = useSharedValue(disabled ? 0 : 1);

  useEffect(() => {
    activeProgress.value = withTiming(disabled ? 0 : 1, {
      duration: 160,
    });
  }, [activeProgress, disabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      ["rgba(255, 90, 95, 0)", GrapefruitSoft],
    ),
    opacity: interpolate(activeProgress.value, [0, 1], [0.35, 1]),
    transform: [
      {
        scale: interpolate(activeProgress.value, [0, 1], [0.92, 1]),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.filtersResetButton, animatedStyle]}>
      <Pressable
        accessibilityLabel={t("filters.resetA11y")}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.filtersResetButtonPressable,
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          name={{
            ios: "arrow.counterclockwise",
            android: "restart_alt",
            web: "restart_alt",
          }}
          size={17}
          tintColor={disabled ? MutedText : Grapefruit}
          weight="bold"
        />
      </Pressable>
    </Animated.View>
  );
}

function WhenFilterSection({
  animatedStyle,
  onChange,
  value,
}: {
  animatedStyle: object;
  onChange: (value: FilterState["when"]) => void;
  value: FilterState["when"];
}) {
  const { locale, t } = useLocalization();
  const intlLocale = APP_INTL_LOCALES[locale];
  const weekStartsOnMonday = locale !== "en";
  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const weekendStart = useMemo(() => getWeekendStart(today), [today]);
  const weekendEnd = useMemo(() => addDays(weekendStart, 1), [weekendStart]);
  const selectedPreset = value.preset;
  const rangeStart = value.start;
  const rangeEnd = value.end;
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(today));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarDays = useMemo(
    () => createCalendarDays(visibleMonth, weekStartsOnMonday),
    [visibleMonth, weekStartsOnMonday],
  );
  const calendarWeekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        new Intl.DateTimeFormat(intlLocale, { weekday: "narrow" }).format(
          new Date(2024, 0, (weekStartsOnMonday ? 8 : 7) + index),
        ),
      ),
    [intlLocale, weekStartsOnMonday],
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
      label: t("filters.anytime"),
    },
    {
      end: today,
      key: "today",
      label: t("filters.today"),
      start: today,
    },
    {
      end: tomorrow,
      key: "tomorrow",
      label: t("filters.tomorrow"),
      start: tomorrow,
    },
    {
      end: weekendEnd,
      key: "weekend",
      label: t("filters.weekend"),
      start: weekendStart,
    },
  ];

  const selectPreset = (
    preset: Exclude<WhenPreset, "custom">,
    start?: Date,
    end?: Date,
  ) => {
    if (start && end) {
      onChange({ end, preset, start });
    } else {
      onChange({ ...value, preset });
    }
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
      onChange({ end: null, preset: "custom", start: date });
      return;
    }

    if (date.getTime() < rangeStart.getTime()) {
      onChange({ ...value, start: date });
      return;
    }

    onChange({ ...value, end: date });
  };

  const resetCalendarRange = () => {
    onChange({ end: today, preset: "anytime", start: today });
    setVisibleMonth(startOfMonth(today));
  };

  return (
    <Animated.View
      layout={LinearTransition.duration(180)}
      style={[styles.filterSection, styles.whenSection, animatedStyle]}
    >
      <View style={styles.whenSectionHeader}>
        <ThemedText type="default" style={styles.filterSectionTitle}>
          {t("filters.when")}
        </ThemedText>
        <Pressable
          accessibilityLabel={
            selectedPreset === "custom"
              ? rangeEnd
                ? t("filters.selectedRangeA11y", {
                    end: formatLongDate(rangeEnd, intlLocale),
                    start: formatLongDate(rangeStart, intlLocale),
                  })
                : t("filters.startDateA11y", {
                    start: formatLongDate(rangeStart, intlLocale),
                  })
              : t("filters.chooseRangeA11y")
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
              {formatRange(rangeStart, rangeEnd, intlLocale)}
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
              accessibilityLabel={t("filters.previousMonth")}
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
              {formatMonth(visibleMonth, intlLocale)}
            </ThemedText>
            <Pressable
              accessibilityLabel={t("filters.nextMonth")}
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
              {calendarWeekdays.map((day, index) => (
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
                  hasRangeFill &&
                  (isRangeStart ||
                    date.getDay() === (weekStartsOnMonday ? 1 : 0));
                const endsRangeSegment =
                  hasRangeFill &&
                  (isRangeEnd ||
                    date.getDay() === (weekStartsOnMonday ? 0 : 6));
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
                      accessibilityLabel={formatLongDate(date, intlLocale)}
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
                {t("common.reset")}
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
                {t("common.done")}
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

const RADIUS_OPTIONS: { label: string; value: RadiusKm }[] = [
  { label: "2", value: 2 },
  { label: "5", value: 5 },
  { label: "25", value: 25 },
  { label: "50+", value: 50 },
];

function RadiusFilterSection({
  animatedStyle,
  onChange,
  value,
}: {
  animatedStyle: object;
  onChange: (value: RadiusKm) => void;
  value: RadiusKm;
}) {
  const { t } = useLocalization();

  return (
    <Animated.View
      style={[styles.filterSection, styles.radiusSection, animatedStyle]}
    >
      <View style={styles.radiusHeader}>
        <ThemedText type="default" style={styles.filterSectionTitle}>
          {t("filters.radius")}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.radiusValue}>
          {value === 50 ? "50+ km" : `${value} km`}
        </ThemedText>
      </View>
      <View style={styles.whenPresetGrid}>
        {RADIUS_OPTIONS.map((option) => (
          <FilterSegmentOption
            accessibilityLabel={t("filters.withinKmA11y", {
              distance: option.label,
            })}
            key={option.value}
            label={option.label}
            onPress={() => onChange(option.value)}
            selected={value === option.value}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const PRICE_OPTIONS: {
  accessibilityLabelKey?: TranslationKey;
  key: PriceMode;
  labelKey: TranslationKey;
}[] = [
  { key: "all", labelKey: "common.all" },
  { key: "free", labelKey: "common.free" },
  {
    accessibilityLabelKey: "filters.payOnSiteA11y",
    key: "pay-on-site",
    labelKey: "common.payOnSite",
  },
  {
    accessibilityLabelKey: "filters.hostFeeA11y",
    key: "host-fee",
    labelKey: "common.hostFee",
  },
];

function PriceFilterSection({
  animatedStyle,
  onChange,
  value,
}: {
  animatedStyle: object;
  onChange: (value: PriceMode) => void;
  value: PriceMode;
}) {
  const { t } = useLocalization();

  return (
    <Animated.View
      style={[styles.filterSection, styles.priceSection, animatedStyle]}
    >
      <ThemedText type="default" style={styles.filterSectionTitle}>
        {t("common.price")}
      </ThemedText>
      <View style={styles.whenPresetGrid}>
        {PRICE_OPTIONS.map((option) => (
          <FilterSegmentOption
            accessibilityLabel={
              option.accessibilityLabelKey
                ? t(option.accessibilityLabelKey)
                : undefined
            }
            key={option.key}
            label={t(option.labelKey)}
            onPress={() => onChange(option.key)}
            selected={value === option.key}
          />
        ))}
      </View>
    </Animated.View>
  );
}

type AvailabilityOptionId = "open-spots" | "instant-join";

const AVAILABILITY_OPTIONS: {
  id: AvailabilityOptionId;
  labelKey: TranslationKey;
}[] = [
  { id: "open-spots", labelKey: "filters.openSpotsOnly" },
  { id: "instant-join", labelKey: "filters.instantJoinOnly" },
];

function AvailabilityFilterSection({
  animatedStyle,
  onChange,
  value,
}: {
  animatedStyle: object;
  onChange: (value: FilterState["availability"]) => void;
  value: FilterState["availability"];
}) {
  const { t } = useLocalization();

  const toggleOption = (optionId: AvailabilityOptionId) => {
    if (optionId === "open-spots") {
      onChange({ ...value, openSpotsOnly: !value.openSpotsOnly });
      return;
    }

    onChange({ ...value, instantJoinOnly: !value.instantJoinOnly });
  };

  return (
    <Animated.View
      style={[styles.filterSection, styles.availabilitySection, animatedStyle]}
    >
      <ThemedText type="default" style={styles.filterSectionTitle}>
        {t("filters.availability")}
      </ThemedText>
      <View style={styles.availabilityList}>
        {AVAILABILITY_OPTIONS.map((option, index) => (
          <AvailabilityCheckboxRow
            key={option.id}
            label={t(option.labelKey)}
            onPress={() => toggleOption(option.id)}
            selected={
              option.id === "open-spots"
                ? value.openSpotsOnly
                : value.instantJoinOnly
            }
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

function SearchGhost({
  activeFilterCount,
  subtitle,
  title,
}: {
  activeFilterCount: number;
  subtitle: string;
  title: string;
}) {
  const hasActiveFilters = activeFilterCount > 0;

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
      <View
        style={[
          styles.searchTuneWrap,
          hasActiveFilters && styles.searchTuneWrapActive,
        ]}
      >
        <SymbolView
          name={{
            ios: "slider.horizontal.3",
            android: "tune",
            web: "tune",
          }}
          size={hasActiveFilters ? 16 : 18}
          tintColor={hasActiveFilters ? WarmSurface : Grapefruit}
          weight="bold"
        />
        {hasActiveFilters && (
          <ThemedText type="smallBold" style={styles.searchTuneCountText}>
            {activeFilterCount}
          </ThemedText>
        )}
      </View>
    </>
  );
}

function CategoryFilterSection({
  animatedStyle,
  onChange,
  value,
}: {
  animatedStyle: object;
  onChange: (value: string[]) => void;
  value: string[];
}) {
  const { t } = useLocalization();
  const countVisibility = useSharedValue(0);

  useEffect(() => {
    countVisibility.value = withTiming(value.length > 0 ? 1 : 0, {
      duration: 140,
    });
  }, [countVisibility, value.length]);

  const countAnimatedStyle = useAnimatedStyle(() => ({
    opacity: countVisibility.value,
    transform: [
      {
        scale: interpolate(countVisibility.value, [0, 1], [0.92, 1]),
      },
    ],
  }));

  const toggleCategory = (categoryId: string) => {
    const next = new Set(value);

    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }

    onChange([...next]);
  };

  return (
    <Animated.View
      style={[styles.filterSection, styles.categorySection, animatedStyle]}
    >
      <View style={styles.categoryHeader}>
        <ThemedText type="default" style={styles.filterSectionTitle}>
          {t("common.categories")}
        </ThemedText>
        <Animated.View
          accessibilityElementsHidden={value.length === 0}
          importantForAccessibility={
            value.length === 0 ? "no-hide-descendants" : "auto"
          }
          pointerEvents="none"
          style={[styles.categoryCount, countAnimatedStyle]}
        >
          <ThemedText type="smallBold" style={styles.categoryCountText}>
            {value.length || ""}
          </ThemedText>
        </Animated.View>
      </View>
      <View style={styles.categoryGrid}>
        {EVENT_CATEGORY_OPTIONS.map((category) => (
          <CategoryOption
            category={category}
            key={category.id}
            onPress={() => toggleCategory(category.id)}
            selected={value.includes(category.id)}
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
  category: (typeof EVENT_CATEGORY_OPTIONS)[number];
  onPress: () => void;
  selected: boolean;
}) {
  const { t } = useLocalization();
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
          {t(category.labelKey)}
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

function createCalendarDays(month: Date, weekStartsOnMonday: boolean) {
  const leadingEmptyDays = weekStartsOnMonday
    ? (month.getDay() + 6) % 7
    : month.getDay();
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

function formatPresetDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatRange(start: Date, end: Date | null, locale: string) {
  if (!end) {
    return `${formatPresetDate(start, locale)} →`;
  }

  if (isSameCalendarDay(start, end)) {
    return formatPresetDate(start, locale);
  }

  return `${formatPresetDate(start, locale)} → ${formatPresetDate(end, locale)}`;
}

function formatMonth(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatLongDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

export function createDefaultFilterState(): FilterState {
  const today = startOfDay(new Date());

  return {
    availability: {
      instantJoinOnly: false,
      openSpotsOnly: false,
    },
    categoryIds: [],
    priceMode: "all",
    radiusKm: DEFAULT_RADIUS_KM,
    when: {
      end: today,
      preset: "anytime",
      start: today,
    },
  };
}

export function getActiveFilterCount(filters: FilterState) {
  return (
    Number(filters.when.preset !== "anytime") +
    Number(filters.categoryIds.length > 0) +
    Number(filters.priceMode !== "all") +
    Number(filters.radiusKm !== DEFAULT_RADIUS_KM) +
    Number(filters.availability.openSpotsOnly) +
    Number(filters.availability.instantJoinOnly)
  );
}

export function getFilterSummary(
  filters: FilterState,
  options: {
    includeRadius?: boolean;
    locale: AppLocale;
    t: Translate;
  },
) {
  const { locale, t } = options;
  const parts: string[] = [];

  if (options.includeRadius) {
    parts.push(
      t("filters.withinKm", {
        distance: filters.radiusKm === 50 ? "50+" : filters.radiusKm,
      }),
    );
  }

  if (filters.when.preset !== "anytime") {
    parts.push(getWhenFilterLabel(filters.when, t, APP_INTL_LOCALES[locale]));
  }

  if (filters.categoryIds.length === 1) {
    const category = EVENT_CATEGORY_OPTIONS.find(
      (option) => option.id === filters.categoryIds[0],
    );

    parts.push(category ? t(category.labelKey) : t("filters.oneCategory"));
  } else if (filters.categoryIds.length > 1) {
    parts.push(
      t("filters.categoryCount", { count: filters.categoryIds.length }),
    );
  }

  if (filters.priceMode !== "all") {
    const priceOption = PRICE_OPTIONS.find(
      (option) => option.key === filters.priceMode,
    );

    parts.push(
      priceOption ? t(priceOption.labelKey) : t("common.price"),
    );
  }

  if (filters.availability.openSpotsOnly) {
    parts.push(t("filters.openSpots"));
  }

  if (filters.availability.instantJoinOnly) {
    parts.push(t("filters.instantJoin"));
  }

  if (parts.length === 0) {
    return t("filters.defaultSummary");
  }

  const visibleParts = parts.slice(0, 2);
  const remainingCount = parts.length - visibleParts.length;

  return [
    ...visibleParts,
    ...(remainingCount > 0 ? [`+${remainingCount}`] : []),
  ].join(" · ");
}

function cloneFilterState(filters: FilterState): FilterState {
  return {
    availability: { ...filters.availability },
    categoryIds: [...filters.categoryIds],
    priceMode: filters.priceMode,
    radiusKm: filters.radiusKm,
    when: {
      end: filters.when.end ? new Date(filters.when.end) : null,
      preset: filters.when.preset,
      start: new Date(filters.when.start),
    },
  };
}

function normalizeFilterState(filters: FilterState): FilterState {
  const normalized = cloneFilterState(filters);

  if (normalized.when.preset === "custom" && normalized.when.end === null) {
    normalized.when.end = new Date(normalized.when.start);
  }

  return normalized;
}

function getWhenFilterLabel(
  when: FilterState["when"],
  t: Translate,
  locale: string,
) {
  switch (when.preset) {
    case "today":
      return t("filters.today");
    case "tomorrow":
      return t("filters.tomorrow");
    case "weekend":
      return t("filters.weekend");
    case "custom":
      return formatRange(when.start, when.end, locale);
    default:
      return t("filters.anytime");
  }
}
