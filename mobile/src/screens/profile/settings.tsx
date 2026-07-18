import * as Haptics from "expo-haptics";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  useLocalization,
  type AppLocale,
} from "@/features/localization/localization";
import {
  Charcoal,
  Grapefruit,
  MutedText,
  WarmSurface,
} from "@/screens/main/styles";
import { profile } from "./data";
import { profileSettingsStyles as styles } from "./settings-styles";

const languageOptions = [
  { id: "en", label: "English", short: "EN" },
  { id: "sk", label: "Slovenčina", short: "SK" },
  { id: "uk", label: "Українська", short: "UA" },
  { id: "ru", label: "Русский", short: "RU" },
] as const;

export function ProfileSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { locale, setLocale, t } = useLocalization();
  const [form, setForm] = useState({
    bio: profile.bio,
    instagram: profile.socials.find((social) => social.type === "instagram")
      ?.handle ?? "",
    location: profile.location,
    name: profile.name,
    telegram: profile.socials.find((social) => social.type === "telegram")
      ?.handle ?? "",
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const goBack = () => {
    Keyboard.dismiss();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/profile");
  };

  const saveProfile = () => {
    Keyboard.dismiss();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/profile");
  };

  const selectLanguage = (language: AppLocale) => {
    Keyboard.dismiss();
    void Haptics.selectionAsync();
    void setLocale(language);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel={t("settings.backA11y")}
            accessibilityRole="button"
            onPress={goBack}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={{
                ios: "chevron.left",
                android: "arrow_back",
                web: "arrow_back",
              }}
              size={19}
              tintColor={Charcoal}
              weight="bold"
            />
          </Pressable>
          <View style={styles.headerCopy}>
            <ThemedText type="default" style={styles.headerTitle}>
              {t("settings.title")}
            </ThemedText>
            <ThemedText type="small" style={styles.headerSubtitle}>
              {t("settings.subtitle")}
            </ThemedText>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SettingsGroupHeader
              delay={0}
              subtitle={t("settings.profileGroup.subtitle")}
              title={t("settings.profileGroup.title")}
            />
            <Animated.View
              entering={FadeInDown.delay(30)
                .duration(340)
                .easing(Easing.out(Easing.cubic))}
              style={styles.profilePreview}
            >
              <View style={styles.previewAvatar}>
                <ThemedText type="smallBold" style={styles.previewAvatarText}>
                  {profile.initials}
                </ThemedText>
              </View>
              <View style={styles.previewCopy}>
                <ThemedText type="subtitle" style={styles.previewName}>
                  {form.name}
                </ThemedText>
                <ThemedText type="smallBold" style={styles.previewRole}>
                  {form.instagram}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={styles.previewLocation}
                  numberOfLines={1}
                >
                  {form.location}
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  Keyboard.dismiss();
                  void Haptics.impactAsync(
                    Haptics.ImpactFeedbackStyle.Soft,
                  );
                }}
                style={({ pressed }) => [
                  styles.photoButton,
                  pressed && styles.previewPressed,
                ]}
              >
                <SymbolView
                  name={{
                    ios: "camera.fill",
                    android: "photo_camera",
                    web: "photo_camera",
                  }}
                  size={14}
                  tintColor={Grapefruit}
                  weight="bold"
                />
              </Pressable>
            </Animated.View>

            <SettingsSection
              delay={70}
              icon={{
                ios: "person.crop.circle.fill",
                android: "account_circle",
                web: "account_circle",
              }}
              subtitle={t("settings.basics.subtitle")}
              title={t("settings.basics.title")}
            >
              <SettingsInput
                label={t("settings.field.name")}
                onChangeText={(value) => updateField("name", value)}
                value={form.name}
              />
              <SettingsInput
                label={t("settings.field.city")}
                onChangeText={(value) => updateField("location", value)}
                value={form.location}
              />
              <SettingsInput
                label={t("settings.field.about")}
                multiline
                onChangeText={(value) => updateField("bio", value)}
                value={form.bio}
              />
            </SettingsSection>

            <SettingsSection
              delay={110}
              icon={{
                ios: "bubble.left.and.bubble.right.fill",
                android: "forum",
                web: "forum",
              }}
              subtitle={t("settings.socials.subtitle")}
              title={t("settings.socials.title")}
            >
              <SettingsInput
                label={t("settings.field.instagram")}
                onChangeText={(value) => updateField("instagram", value)}
                value={form.instagram}
              />
              <SettingsInput
                label={t("settings.field.telegram")}
                onChangeText={(value) => updateField("telegram", value)}
                value={form.telegram}
              />
            </SettingsSection>

            <SettingsGroupHeader
              delay={150}
              subtitle={t("settings.generalGroup.subtitle")}
              title={t("settings.generalGroup.title")}
            />

            <SettingsSection
              delay={180}
              icon={{
                ios: "character.bubble.fill",
                android: "translate",
                web: "translate",
              }}
              subtitle={t("settings.language.subtitle")}
              title={t("settings.language.title")}
            >
              <View style={styles.languageGrid}>
                {languageOptions.map((language) => {
                  const selected = locale === language.id;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={language.id}
                      onPress={() => selectLanguage(language.id)}
                      style={({ pressed }) => [
                        styles.language,
                        selected && styles.languageSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.languageCode,
                          selected && styles.languageCodeSelected,
                        ]}
                      >
                        <ThemedText
                          type="smallBold"
                          style={[
                            styles.languageCodeText,
                            selected && styles.languageTextSelected,
                          ]}
                        >
                          {language.short}
                        </ThemedText>
                      </View>
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.languageText,
                          selected && styles.languageTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {language.label}
                      </ThemedText>
                      {selected ? (
                        <SymbolView
                          name={{
                            ios: "checkmark",
                            android: "check",
                            web: "check",
                          }}
                          size={12}
                          tintColor={WarmSurface}
                          weight="bold"
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </SettingsSection>

          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={saveProfile}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
              ]}
            >
              <ThemedText type="smallBold" style={styles.saveButtonText}>
                {t("settings.save")}
              </ThemedText>
              <SymbolView
                name={{
                  ios: "checkmark",
                  android: "check",
                  web: "check",
                }}
                size={16}
                tintColor={WarmSurface}
                weight="bold"
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SettingsGroupHeader({
  delay,
  subtitle,
  title,
}: {
  delay: number;
  subtitle: string;
  title: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay)
        .duration(300)
        .easing(Easing.out(Easing.cubic))}
      style={styles.groupHeader}
    >
      <ThemedText type="subtitle" style={styles.groupTitle}>
        {title}
      </ThemedText>
      <ThemedText type="small" style={styles.groupSubtitle}>
        {subtitle}
      </ThemedText>
    </Animated.View>
  );
}

function SettingsSection({
  children,
  delay,
  icon,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  delay: number;
  icon: SymbolViewProps["name"];
  subtitle: string;
  title: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(340)
        .delay(delay)
        .easing(Easing.out(Easing.cubic))}
      style={styles.section}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <SymbolView
            name={icon}
            size={17}
            tintColor={Grapefruit}
            weight="bold"
          />
        </View>
        <View style={styles.sectionCopy}>
          <ThemedText type="default" style={styles.sectionTitle}>
            {title}
          </ThemedText>
          <ThemedText type="small" style={styles.sectionSubtitle}>
            {subtitle}
          </ThemedText>
        </View>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </Animated.View>
  );
}

function SettingsInput({
  label,
  multiline,
  onChangeText,
  value,
}: {
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  value: string;
}) {
  const [focused, setFocused] = useState(false);
  const focusProgress = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      ["#F5F1EF", "#FFFCFB"],
    ),
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      ["rgba(255, 90, 95, 0)", Grapefruit],
    ),
  }));

  const setInputFocused = (nextFocused: boolean) => {
    setFocused(nextFocused);
    focusProgress.set(
      withTiming(nextFocused ? 1 : 0, {
        duration: nextFocused ? 180 : 130,
      }),
    );
  };

  return (
    <Animated.View
      style={[
        styles.inputShell,
        multiline && styles.inputShellMultiline,
        animatedStyle,
      ]}
    >
      <ThemedText
        type="smallBold"
        style={[styles.inputLabel, focused && styles.inputLabelFocused]}
      >
        {label}
      </ThemedText>
      <TextInput
        multiline={multiline}
        onBlur={() => setInputFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setInputFocused(true)}
        placeholderTextColor={MutedText}
        selectionColor={Grapefruit}
        style={[styles.input, multiline && styles.textArea]}
        value={value}
      />
    </Animated.View>
  );
}
