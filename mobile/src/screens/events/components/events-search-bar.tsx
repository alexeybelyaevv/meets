import { SymbolView } from "expo-symbols";
import { Pressable, TextInput, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Grapefruit, MutedText, WarmSurface } from "@/screens/main/styles";
import { eventsStyles as styles } from "../styles";

type EventsSearchBarProps = {
  activeFilterCount: number;
  filterSummary: string;
  onChangeQuery: (query: string) => void;
  onClearQuery: () => void;
  onOpenFilters: () => void;
  query: string;
  top: number;
};

export function EventsSearchBar({
  activeFilterCount,
  filterSummary,
  onChangeQuery,
  onClearQuery,
  onOpenFilters,
  query,
  top,
}: EventsSearchBarProps) {
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <View style={[styles.searchRow, { top }]}>
      <View style={styles.searchBar}>
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
        <View style={styles.searchInputBlock}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChangeQuery}
            placeholder="Search events"
            placeholderTextColor={MutedText}
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
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
        {query ? (
          <Pressable
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClearQuery}
            style={({ pressed }) => [
              styles.clearSearchButton,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={{ ios: "xmark", android: "close", web: "close" }}
              size={16}
              tintColor={MutedText}
              weight="bold"
            />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel={`Open filters. ${filterSummary}`}
          accessibilityRole="button"
          onPress={onOpenFilters}
          style={({ pressed }) => [
            styles.searchTuneWrap,
            hasActiveFilters && styles.searchTuneWrapActive,
            pressed && styles.pressed,
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
        </Pressable>
      </View>
    </View>
  );
}
