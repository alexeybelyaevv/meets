import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation, BottomNavigationInset } from '@/components/bottom-navigation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PlaceholderTabScreenProps = {
  eyebrow: string;
  title: string;
  body: string;
  icon: SymbolViewProps['name'];
};

export function PlaceholderTabScreen({ eyebrow, title, body, icon }: PlaceholderTabScreenProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedView type="backgroundElement" style={styles.panel}>
            <View style={styles.iconWrap}>
              <SymbolView name={icon} size={30} tintColor="#FF385C" weight="bold" />
            </View>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {eyebrow}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
              {body}
            </ThemedText>
            <View style={[styles.line, { backgroundColor: theme.backgroundSelected }]} />
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
      <BottomNavigation />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomNavigationInset,
  },
  panel: {
    borderRadius: 24,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8EE',
  },
  title: {
    maxWidth: 320,
  },
  body: {
    maxWidth: 420,
  },
  line: {
    height: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
  },
});
