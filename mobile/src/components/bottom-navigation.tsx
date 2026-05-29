import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { usePathname, useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const Grapefruit = '#FF5A5F';
const GrapefruitSoft = '#FFE6E3';
const WarmSurface = '#FFFCFB';
const WarmBorder = '#E8E2DF';
const MutedText = '#766F6B';

type NavigationItem = {
  href: Href;
  label: string;
  match: string;
  icon: SymbolViewProps['name'];
};

const items: NavigationItem[] = [
  {
    href: '/main',
    label: 'Home',
    match: '/main',
    icon: { ios: 'house.fill', android: 'home', web: 'home' },
  },
  {
    href: '/trips',
    label: 'Trips',
    match: '/trips',
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  },
  {
    href: '/saved',
    label: 'Saved',
    match: '/saved',
    icon: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  },
  {
    href: '/profile',
    label: 'Profile',
    match: '/profile',
    icon: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
  },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: WarmSurface,
            borderColor: WarmBorder,
            paddingBottom: Math.max(insets.bottom, Spacing.two),
          },
        ]}>
        {items.map((item) => {
          const active = pathname === item.match;
          const tintColor = active ? Grapefruit : MutedText;
          const iconBackgroundColor = active ? GrapefruitSoft : 'transparent';

          return (
            <Pressable
              key={item.match}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (!active) {
                  router.replace(item.href);
                }
              }}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
              <View style={[styles.iconBubble, { backgroundColor: iconBackgroundColor }]}>
                <SymbolView name={item.icon} size={24} tintColor={tintColor} weight="bold" />
              </View>
              <ThemedText
                type="smallBold"
                style={[styles.label, { color: tintColor }]}
                numberOfLines={1}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const BottomNavigationInset = 92;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  bar: {
    width: '100%',
    maxWidth: MaxContentWidth,
    minHeight: 84,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.three,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  item: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  iconBubble: {
    width: 42,
    height: 32,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.64,
  },
});
