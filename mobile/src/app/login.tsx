import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit() {
    router.replace('/main');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.content}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}>
                  <ThemedText type="smallBold" style={styles.brandLetter}>
                    M
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Meets
                </ThemedText>
              </View>

              <ThemedView type="backgroundElement" style={styles.panel}>
                <View style={styles.header}>
                  <ThemedText type="title" style={styles.title}>
                    Find your next plan.
                  </ThemedText>
                  <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
                    Sign in to discover local events, join friends, and keep your plans in one place.
                  </ThemedText>
                </View>

                <View style={styles.form}>
                  <View
                    style={[
                      styles.inputGroup,
                      { backgroundColor: theme.background, borderColor: theme.backgroundSelected },
                    ]}>
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      inputMode="email"
                      onChangeText={setEmail}
                      placeholder="Email"
                      placeholderTextColor={theme.textSecondary}
                      returnKeyType="next"
                      style={[styles.input, { color: theme.text }]}
                      textContentType="emailAddress"
                      value={email}
                    />
                    <View
                      style={[
                        styles.inputSeparator,
                        { backgroundColor: theme.backgroundSelected },
                      ]}
                    />
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="password"
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor={theme.textSecondary}
                      returnKeyType="done"
                      secureTextEntry
                      style={[styles.input, { color: theme.text }]}
                      textContentType="password"
                      value={password}
                      onSubmitEditing={handleSubmit}
                    />
                  </View>

                  <Pressable
                    onPress={handleSubmit}
                    style={({ pressed }) => [pressed && styles.pressed]}>
                    <View style={styles.primaryButton}>
                      <ThemedText type="smallBold" style={styles.primaryButtonText}>
                        Continue
                      </ThemedText>
                    </View>
                  </Pressable>
                </View>

                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.backgroundSelected }]} />
                  <ThemedText type="small" themeColor="textSecondary">
                    or
                  </ThemedText>
                  <View style={[styles.dividerLine, { backgroundColor: theme.backgroundSelected }]} />
                </View>

                <SocialLoginButtons />
              </ThemedView>

              <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
                Login is mocked for now. Continue opens the main page.
              </ThemedText>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D6F5F',
  },
  brandLetter: {
    color: '#FFFFFF',
  },
  panel: {
    alignSelf: 'stretch',
    gap: Spacing.four,
    borderRadius: 8,
    padding: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 44,
    lineHeight: 48,
  },
  subtitle: {
    maxWidth: 460,
  },
  form: {
    gap: Spacing.three,
  },
  inputGroup: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    overflow: 'hidden',
  },
  input: {
    minHeight: 54,
    paddingHorizontal: Spacing.three,
    fontSize: 17,
    fontWeight: '500',
  },
  inputSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.three,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D6F5F',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.72,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  legal: {
    textAlign: 'center',
  },
});
