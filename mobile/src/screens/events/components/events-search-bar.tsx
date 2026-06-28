import { SymbolView } from "expo-symbols";
import { Pressable, TextInput, View } from "react-native";
import { Grapefruit, MutedText, WarmSurface } from "@/screens/main/styles";
import { eventsStyles as styles } from "../styles";

type EventsSearchBarProps = {
  onChangeQuery: (query: string) => void;
  onClearQuery: () => void;
  onOpenFilters: () => void;
  query: string;
  top: number;
};

export function EventsSearchBar({
  onChangeQuery,
  onClearQuery,
  onOpenFilters,
  query,
  top,
}: EventsSearchBarProps) {
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
          accessibilityLabel="Open filters"
          accessibilityRole="button"
          onPress={onOpenFilters}
          style={({ pressed }) => [
            styles.searchTuneWrap,
            pressed && styles.pressed,
          ]}
        >
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
        </Pressable>
      </View>
    </View>
  );
}
