import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function MainScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <View>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Meets
              </ThemedText>
              <ThemedText type="subtitle">Main page</ThemedText>
            </View>

            <Pressable onPress={() => router.replace('/login')} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.secondaryButton}>
                <ThemedText type="smallBold">Sign out</ThemedText>
              </ThemedView>
            </Pressable>
          </View>

          <ThemedView type="backgroundElement" style={styles.placeholder}>
            <View style={styles.emptyMark}>
              <ThemedText type="smallBold" style={styles.emptyMarkText}>
                M
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Events feed coming soon
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
              This is a temporary main screen while the real Meets experience is being built.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
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
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  secondaryButton: {
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  placeholder: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  emptyMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D6F5F',
  },
  emptyMarkText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyText: {
    maxWidth: 360,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
