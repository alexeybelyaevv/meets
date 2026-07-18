import { SymbolView } from "expo-symbols";
import { Pressable, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { Grapefruit, WarmSurface } from "@/screens/main/styles";
import { eventsStyles as styles } from "../styles";
import { useLocalization } from "@/features/localization/localization";

type EventsFilterBarProps = {
  activeFilterCount: number;
  filterSummary: string;
  onOpenFilters: () => void;
  top: number;
};

export function EventsFilterBar({
  activeFilterCount,
  filterSummary,
  onOpenFilters,
  top,
}: EventsFilterBarProps) {
  const { t } = useLocalization();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <View style={[styles.searchRow, { top }]}>
      <Pressable
        accessibilityLabel={t("filters.openA11y", { summary: filterSummary })}
        accessibilityRole="button"
        onPress={onOpenFilters}
        style={({ pressed }) => [
          styles.searchBar,
          pressed && styles.pressed,
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
            {t("filters.eventsNearby")}
          </ThemedText>
          <ThemedText
            numberOfLines={1}
            type="small"
            style={[
              styles.searchFilterSummary,
              hasActiveFilters && styles.searchFilterSummaryActive,
            ]}
          >
            {filterSummary}
          </ThemedText>
        </View>
        <Animated.View
          layout={LinearTransition.duration(160)}
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
        </Animated.View>
      </Pressable>
    </View>
  );
}
