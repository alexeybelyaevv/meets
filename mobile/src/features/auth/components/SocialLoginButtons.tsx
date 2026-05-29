import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSocialAuth } from '../hooks/useSocialAuth';

export function SocialLoginButtons() {
  const {
    authUser,
    error,
    loading,
    isAppleAvailable,
    isGoogleAvailable,
    signInWithApple,
    signInWithGoogle,
    startTelegramLogin,
    signOut,
  } = useSocialAuth();

  return (
    <View style={styles.container}>
      {isAppleAvailable && (
        <AuthButton
          label={loading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
          disabled={Boolean(loading)}
          onPress={signInWithApple}
        />
      )}

      <AuthButton
        label={
          isGoogleAvailable
            ? loading === 'google'
              ? 'Signing in...'
              : 'Continue with Google'
            : 'Google requires a development build'
        }
        disabled={Boolean(loading) || !isGoogleAvailable}
        onPress={signInWithGoogle}
      />

      <AuthButton
        label={loading === 'telegram' ? 'Opening Telegram...' : 'Continue with Telegram'}
        disabled={Boolean(loading)}
        onPress={startTelegramLogin}
      />

      {authUser && (
        <ThemedView type="backgroundElement" style={styles.status}>
          <ThemedText type="smallBold">{authUser.user.name ?? authUser.user.email ?? 'Signed in'}</ThemedText>
          <AuthButton label="Sign out" disabled={Boolean(loading)} onPress={signOut} secondary />
        </ThemedView>
      )}

      {error && (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

function AuthButton({
  label,
  disabled,
  secondary,
  onPress,
}: {
  label: string;
  disabled: boolean;
  secondary?: boolean;
  onPress: () => void | Promise<unknown>;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        void Promise.resolve(onPress()).catch(() => {});
      }}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <ThemedView
        type={secondary ? 'backgroundElement' : 'backgroundSelected'}
        style={[styles.button, disabled && styles.disabled]}>
        <ThemedText type="smallBold">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  button: {
    minHeight: 48,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.72,
  },
  status: {
    borderRadius: Spacing.two,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  error: {
    color: '#B00020',
  },
});
