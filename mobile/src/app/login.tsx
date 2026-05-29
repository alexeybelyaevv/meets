import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle">Sign in</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Use a social account to create or access your Meets account.
          </ThemedText>
          <SocialLoginButtons />
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
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
});

