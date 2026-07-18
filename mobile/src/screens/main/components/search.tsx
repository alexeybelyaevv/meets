import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import {
  Charcoal,
  Grapefruit,
  GrapefruitSoft,
  MutedText,
  WarmBorder,
  WarmSurface,
} from "../styles";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  activeFilterCount: number;
  filterSummary: string;
  openFilters: () => void;
}

export const Search = ({
  activeFilterCount,
  filterSummary,
  openFilters,
}: Props) => {
  const insets = useSafeAreaInsets();
  const hasActiveFilters = activeFilterCount > 0;
  const topOverlayOffset = Math.max(insets.top + Spacing.two);

  return (
    <View
      style={[
        styles.topOverlay,
        { top: topOverlayOffset, pointerEvents: "box-none" },
      ]}
    >
      <Pressable
        accessibilityLabel={`Open filters. ${filterSummary}`}
        accessibilityRole="button"
        onPress={openFilters}
        style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}
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
          <ThemedText
            numberOfLines={1}
            type="small"
            style={[
              styles.searchSubtitle,
              hasActiveFilters && styles.searchSubtitleActive,
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
};

const styles = StyleSheet.create({
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
  topOverlay: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 18,
    elevation: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
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
  searchSubtitleActive: {
    color: Grapefruit,
  },
  searchTuneWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GrapefruitSoft,
  },
  searchTuneWrapActive: {
    width: 48,
    flexDirection: "row",
    gap: Spacing.one,
    backgroundColor: Grapefruit,
  },
  searchTuneCountText: {
    color: WarmSurface,
    fontSize: 11,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.72,
  },
});
