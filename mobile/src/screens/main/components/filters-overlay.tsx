import { SymbolView } from "expo-symbols";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Charcoal, Grapefruit, WarmSurface, styles } from "../styles";

type FiltersOverlayProps = {
  closeFilters: () => void;
  filtersContentProgress: SharedValue<number>;
  filtersExpandedHeight: number;
  filtersProgress: SharedValue<number>;
  searchBarWidth: number;
  topOverlayOffset: number;
};

export function FiltersOverlay({
  closeFilters,
  filtersContentProgress,
  filtersExpandedHeight,
  filtersProgress,
  searchBarWidth,
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
  const filtersHeroAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.06,
  );
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
  const sizeSectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.4,
  );
  const moreSectionAnimatedStyle = useStaggeredFilterStyle(
    filtersContentProgress,
    0.48,
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
          <SearchGhost />
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
          <FilterHero animatedStyle={filtersHeroAnimatedStyle} />
          <FilterChipsSection
            animatedStyle={whenSectionAnimatedStyle}
            labels={["Today", "Tomorrow", "This weekend", "Any time"]}
            selectedIndexes={[0]}
            title="When"
          />
          <FilterChipsSection
            animatedStyle={categorySectionAnimatedStyle}
            labels={[
              "Outdoor",
              "Networking",
              "Culture",
              "Social",
              "Food",
              "Wellness",
            ]}
            selectedIndexes={[0, 1]}
            title="Category"
          />
          <Animated.View
            style={[styles.filterSection, priceSectionAnimatedStyle]}
          >
            <View style={styles.filterSectionHeader}>
              <ThemedText type="default" style={styles.filterSectionTitle}>
                Price
              </ThemedText>
              <ThemedText type="smallBold" style={styles.filterValueText}>
                Free - €10
              </ThemedText>
            </View>
            <View style={styles.fakeRangeTrack}>
              <View style={styles.fakeRangeFill} />
              <View style={[styles.fakeRangeThumb, { left: "16%" }]} />
              <View style={[styles.fakeRangeThumb, { left: "72%" }]} />
            </View>
          </Animated.View>
          <Animated.View
            style={[styles.filterSection, sizeSectionAnimatedStyle]}
          >
            <ThemedText type="default" style={styles.filterSectionTitle}>
              Group size
            </ThemedText>
            <View style={styles.filterSegmented}>
              {["Small", "Medium", "Big"].map((label, index) => (
                <View
                  key={label}
                  style={[
                    styles.filterSegment,
                    index === 1 && styles.filterSegmentSelected,
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.filterSegmentText,
                      index === 1 && styles.filterSegmentTextSelected,
                    ]}
                  >
                    {label}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Animated.View>
          <Animated.View
            style={[styles.filterSection, moreSectionAnimatedStyle]}
          >
            <ThemedText type="default" style={styles.filterSectionTitle}>
              More options
            </ThemedText>
            {[
              ["Friends of friends", "Show plans with mutuals"],
              ["Beginner friendly", "Low pressure and easy to join"],
              ["Near me", "Within 3 km"],
            ].map(([title, description], index) => (
              <View key={title} style={styles.filterOptionRow}>
                <View>
                  <ThemedText type="smallBold" style={styles.filterOptionTitle}>
                    {title}
                  </ThemedText>
                  <ThemedText type="small" style={styles.filterOptionMeta}>
                    {description}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.filterToggle,
                    index !== 1 && styles.filterToggleOn,
                  ]}
                >
                  <View
                    style={[
                      styles.filterToggleThumb,
                      index !== 1 && styles.filterToggleThumbOn,
                    ]}
                  />
                </View>
              </View>
            ))}
          </Animated.View>
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
              Show 24 plans
            </ThemedText>
          </Pressable>
          <View style={{ height: 18 }} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

function SearchGhost() {
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
    </>
  );
}

function FilterHero({ animatedStyle }: { animatedStyle: object }) {
  return (
    <Animated.View style={[styles.filterHeroPanel, animatedStyle]}>
      <View style={styles.filterHeroTop}>
        <View style={styles.filterHeroIcon}>
          <SymbolView
            name={{
              ios: "location.fill",
              android: "location_on",
              web: "location_on",
            }}
            size={22}
            tintColor={WarmSurface}
            weight="bold"
          />
        </View>
        <View style={styles.filterHeroCopy}>
          <ThemedText type="smallBold" style={styles.filterEyebrow}>
            Explore nearby
          </ThemedText>
          <ThemedText type="subtitle" style={styles.filterSearchTitle}>
            Bratislava
          </ThemedText>
        </View>
      </View>
      <ThemedText type="small" style={styles.filterSearchMeta}>
        Handpicked plans around Old Town, the Danube, and Sky Park.
      </ThemedText>
      <View style={styles.filterHeroPills}>
        {["Tonight", "Under €10", "Social"].map((label) => (
          <View key={label} style={styles.filterHeroPill}>
            <ThemedText type="smallBold" style={styles.filterHeroPillText}>
              {label}
            </ThemedText>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

function FilterChipsSection({
  animatedStyle,
  labels,
  selectedIndexes,
  title,
}: {
  animatedStyle: object;
  labels: string[];
  selectedIndexes: number[];
  title: string;
}) {
  return (
    <Animated.View style={[styles.filterSection, animatedStyle]}>
      <ThemedText type="default" style={styles.filterSectionTitle}>
        {title}
      </ThemedText>
      <View style={styles.filterChipGrid}>
        {labels.map((label, index) => {
          const selected = selectedIndexes.includes(index);

          return (
            <View
              key={label}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
            >
              <ThemedText
                type="smallBold"
                style={[
                  styles.filterChipText,
                  selected && styles.filterChipTextSelected,
                ]}
              >
                {label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

function useStaggeredFilterStyle(progress: SharedValue<number>, start: number) {
  const end = start + 0.28;

  return useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, start, end, 1], [0, 0, 1, 1]),
  }));
}
