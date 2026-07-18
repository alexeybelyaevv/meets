import { SymbolView } from 'expo-symbols';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AuthButton, AuthColors, AuthSurfaceCard } from './auth-ui';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { useLocalization } from '@/features/localization/localization';

const googleLogo = require('@/assets/images/google-g.png');

export function SocialLoginButtons({ compact }: { compact?: boolean }) {
  const { t } = useLocalization();
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
      {compact ? (
        <View style={styles.compactRow}>
          {isAppleAvailable ? (
            <CompactSocialButton
              disabled={Boolean(loading)}
              label="Apple"
              onPress={signInWithApple}
              renderIcon={() => (
                <SymbolView
                  name={{ ios: 'apple.logo', android: 'smartphone', web: 'smartphone' }}
                  size={18}
                  tintColor="#111111"
                  weight="semibold"
                />
              )}
            />
          ) : null}
          <CompactSocialButton
            disabled={Boolean(loading) || !isGoogleAvailable}
            label="Google"
            onPress={signInWithGoogle}
            renderIcon={() => (
              <Image contentFit="contain" source={googleLogo} style={styles.googleImage} />
            )}
          />
          <CompactSocialButton
            disabled={Boolean(loading)}
            label="Telegram"
            onPress={startTelegramLogin}
            renderIcon={() => (
              <SymbolView
                name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
                size={18}
                tintColor="#229ED9"
                weight="semibold"
              />
            )}
          />
        </View>
      ) : (
        <>
          {isAppleAvailable && (
            <AuthButton
              label={loading === 'apple' ? t('auth.signingIn') : t('auth.continueApple')}
              disabled={Boolean(loading)}
              onPress={signInWithApple}
              icon={{ ios: 'apple.logo', android: 'smartphone', web: 'smartphone' }}
              secondary
            />
          )}

          <AuthButton
            label={
              isGoogleAvailable
                ? loading === 'google'
                  ? t('auth.signingIn')
                  : t('auth.continueGoogle')
                : t('auth.googleDevBuild')
            }
            disabled={Boolean(loading) || !isGoogleAvailable}
            onPress={signInWithGoogle}
            icon={{ ios: 'globe', android: 'language', web: 'language' }}
            secondary
          />

          <AuthButton
            label={loading === 'telegram' ? t('auth.openingTelegram') : t('auth.continueTelegram')}
            disabled={Boolean(loading)}
            onPress={startTelegramLogin}
            icon={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
            secondary
          />
        </>
      )}

      {authUser && (
        <AuthSurfaceCard style={styles.status}>
          <ThemedText type="smallBold">{authUser.user.name ?? authUser.user.email ?? t('auth.signedIn')}</ThemedText>
          <AuthButton label={t('auth.signOut')} disabled={Boolean(loading)} onPress={signOut} secondary />
        </AuthSurfaceCard>
      )}

      {error && (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

function CompactSocialButton({
  disabled,
  label,
  onPress,
  renderIcon,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void | Promise<unknown>;
  renderIcon: () => React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        void Promise.resolve(onPress()).catch(() => {});
      }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={[styles.compactButton, disabled && styles.disabled]}>
        <View style={styles.compactIcon}>{renderIcon()}</View>
        <ThemedText type="smallBold" style={styles.compactLabel}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  compactButton: {
    minWidth: 96,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: AuthColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  compactIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactLabel: {
    color: AuthColors.text,
  },
  googleImage: {
    width: 18,
    height: 18,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.8,
  },
  status: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 22,
  },
  error: {
    color: AuthColors.accent,
  },
});
