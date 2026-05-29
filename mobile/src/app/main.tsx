import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavigation, BottomNavigationInset } from '@/components/bottom-navigation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const Grapefruit = '#FF5A5F';
const GrapefruitSoft = '#FFE6E3';
const WarmSurface = '#FFFCFB';
const WarmGray = '#F4F1EF';
const WarmBorder = '#E8E2DF';
const Charcoal = '#201A1A';
const MutedText = '#766F6B';

const mapHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <style>
      html, body, #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #f4f1ef;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .leaflet-container {
        background: #f4f1ef;
      }

      .leaflet-control-attribution {
        font-size: 10px;
      }

    </style>
  </head>

  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map', {
        zoomControl: false,
        attributionControl: true,
        center: [48.1452, 17.1164],
        zoom: 14,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map);

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    </script>
  </body>
</html>`;

const featuredPlans = [
  {
    id: 'sunset',
    title: 'Sunset picnic by the Danube',
    meta: 'Today · 19:00 · 24 going',
    tag: 'Outdoor',
    price: 'Free',
  },
  {
    id: 'coffee',
    title: 'Founders coffee chat',
    meta: 'Tomorrow · 10:30 · 8 going',
    tag: 'Networking',
    price: '€4',
  },
  {
    id: 'gallery',
    title: 'Small gallery walk',
    meta: 'Friday · 18:00 · 16 going',
    tag: 'Culture',
    price: '€7',
  },
  {
    id: 'rooftop',
    title: 'Rooftop board games',
    meta: 'Saturday · 20:00 · 12 going',
    tag: 'Social',
    price: '€5',
  },
];

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => [220, '72%'], []);
  const topOverlayOffset = Math.max(insets.top + Spacing.two, 52);
  const planListStyle = useMemo(
    () => [styles.planList, { paddingBottom: BottomNavigationInset + insets.bottom + Spacing.five }],
    [insets.bottom],
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.screen}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml, baseUrl: 'https://basemaps.cartocdn.com' }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          mixedContentMode="always"
          allowsInlineMediaPlayback
          style={styles.map}
        />
        <View style={[styles.topOverlay, { top: topOverlayOffset, pointerEvents: 'box-none' }]}>
          <Pressable style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}>
            <View style={styles.searchIconWrap}>
              <SymbolView
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                size={18}
                tintColor={WarmSurface}
                weight="bold"
              />
            </View>
            <TextInput
              editable={false}
              placeholder="Search plans"
              placeholderTextColor={MutedText}
              pointerEvents="none"
              style={styles.searchInput}
            />
          </Pressable>

          <Pressable style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
              size={20}
              tintColor={Grapefruit}
              weight="bold"
            />
          </Pressable>
        </View>

        <BottomSheet
          index={0}
          snapPoints={snapPoints}
          topInset={Math.max(insets.top + 88, 104)}
          backgroundStyle={[
            styles.drawerBackground,
            {
              backgroundColor: WarmSurface,
              borderColor: WarmBorder,
            },
          ]}
          handleStyle={styles.drawerHandleArea}
          handleIndicatorStyle={styles.drawerHandle}
          style={styles.drawer}>
          <BottomSheetScrollView
            contentContainerStyle={planListStyle}
            showsVerticalScrollIndicator={false}>
            <View style={styles.drawerHeader}>
              <View>
                <ThemedText type="subtitle" style={styles.drawerTitle}>
                  Nearby plans
                </ThemedText>
                <ThemedText type="small" style={styles.drawerSubtitle}>
                  Fake listings for layout only
                </ThemedText>
              </View>
              <View style={styles.countPill}>
                <ThemedText type="smallBold" style={styles.countText}>
                  {featuredPlans.length} near
                </ThemedText>
              </View>
            </View>

            {featuredPlans.map((plan) => (
              <Pressable
                key={plan.id}
                style={({ pressed }) => [styles.planCard, pressed && styles.pressed]}>
                <View style={styles.planImage}>
                  <ThemedText type="smallBold" style={styles.planImageText}>
                    {plan.tag.slice(0, 1)}
                  </ThemedText>
                </View>
                <View style={styles.planContent}>
                  <View style={styles.planTopLine}>
                    <ThemedText type="smallBold" style={styles.planTag}>
                      {plan.tag}
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.planPrice}>
                      {plan.price}
                    </ThemedText>
                  </View>
                  <ThemedText type="default" style={styles.planTitle} numberOfLines={1}>
                    {plan.title}
                  </ThemedText>
                  <ThemedText type="small" style={styles.planMeta} numberOfLines={1}>
                    {plan.meta}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </BottomSheetScrollView>
        </BottomSheet>
        <BottomNavigation />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    backgroundColor: WarmGray,
  },
  topOverlay: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 18,
    elevation: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  searchBar: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    backgroundColor: WarmSurface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  searchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Grapefruit,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Charcoal,
    fontSize: 16,
    fontWeight: '600',
    padding: 0,
  },
  filterButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  drawer: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    zIndex: 16,
    elevation: 16,
  },
  drawerBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -16 },
  },
  drawerHandleArea: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  drawerHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#DDD5D1',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  drawerTitle: {
    color: Charcoal,
    fontSize: 25,
    lineHeight: 31,
  },
  drawerSubtitle: {
    color: MutedText,
  },
  countPill: {
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: GrapefruitSoft,
  },
  countText: {
    color: Grapefruit,
    fontSize: 12,
  },
  planList: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  planCard: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    backgroundColor: '#FBF8F7',
    padding: Spacing.two,
  },
  planImage: {
    width: 82,
    height: 82,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GrapefruitSoft,
  },
  planImageText: {
    color: Grapefruit,
    fontSize: 22,
  },
  planContent: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  planTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  planTag: {
    color: Grapefruit,
  },
  planPrice: {
    color: Charcoal,
  },
  planTitle: {
    color: Charcoal,
  },
  planMeta: {
    color: MutedText,
  },
  pressed: {
    opacity: 0.72,
  },
});
