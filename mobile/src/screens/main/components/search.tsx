import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
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
  openFilters: () => void;
}

export const Search = ({ openFilters }: Props) => {
  const insets = useSafeAreaInsets();

  const topOverlayOffset = Math.max(insets.top + Spacing.two);

  return (
    <View
      style={[
        styles.topOverlay,
        { top: topOverlayOffset, pointerEvents: "box-none" },
      ]}
    >
      <Pressable
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
  searchTuneWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GrapefruitSoft,
  },
  pressed: {
    opacity: 0.72,
  },
});
