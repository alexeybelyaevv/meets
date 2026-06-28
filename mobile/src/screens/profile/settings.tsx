import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
  Charcoal,
  Grapefruit,
  MutedText,
} from "@/screens/main/styles";
import { profile } from "./data";
import { profileStyles as styles } from "./styles";

const interestOptions = [
  "Coffee walks",
  "Startups",
  "Gallery nights",
  "Board games",
  "Local food",
  "Danube sunsets",
  "Wellness",
  "Networking",
];

export function ProfileSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    bio: profile.bio,
    groupVibe: profile.details[2]?.value ?? "",
    instagram: profile.socials.find((social) => social.type === "instagram")
      ?.handle ?? "",
    languages: profile.details[1]?.value ?? "",
    location: profile.location,
    name: profile.name,
    neighborhood: profile.details[0]?.value ?? "",
    role: profile.role,
    telegram: profile.socials.find((social) => social.type === "telegram")
      ?.handle ?? "",
  });
  const [selectedInterests, setSelectedInterests] = useState(profile.interests);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.settingsHeader}>
          <Pressable
            accessibilityLabel="Back to profile"
            accessibilityRole="button"
            onPress={() => router.replace("/profile")}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={{
                ios: "chevron.left",
                android: "arrow_back",
                web: "arrow_back",
              }}
              size={20}
              tintColor={Charcoal}
              weight="bold"
            />
          </Pressable>
          <View style={styles.settingsTitleBlock}>
            <ThemedText type="subtitle" style={styles.settingsTitle}>
              Profile settings
            </ThemedText>
            <ThemedText type="small" style={styles.settingsSubtitle}>
              Edit public profile details
            </ThemedText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.settingsContent,
            { paddingBottom: insets.bottom + Spacing.four },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <View style={styles.settingsPhotoRow}>
              <View style={styles.settingsAvatar}>
                <ThemedText type="smallBold" style={styles.settingsAvatarText}>
                  {profile.initials}
                </ThemedText>
              </View>
              <View style={styles.photoCopy}>
                <ThemedText type="default" style={styles.sectionTitle}>
                  Profile photo
                </ThemedText>
                <ThemedText type="small" style={styles.location}>
                  Use a clear face photo so people recognize you at events.
                </ThemedText>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.photoAction,
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText type="smallBold" style={styles.photoActionText}>
                    Change photo
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>

          <SettingsSection title="Public info">
            <SettingsInput
              label="Name"
              onChangeText={(value) => updateField("name", value)}
              value={form.name}
            />
            <SettingsInput
              label="Role"
              onChangeText={(value) => updateField("role", value)}
              value={form.role}
            />
            <SettingsInput
              label="City / area"
              onChangeText={(value) => updateField("location", value)}
              value={form.location}
            />
            <SettingsInput
              label="About me"
              multiline
              onChangeText={(value) => updateField("bio", value)}
              value={form.bio}
            />
          </SettingsSection>

          <SettingsSection title="Socials">
            <SettingsInput
              label="Instagram"
              onChangeText={(value) => updateField("instagram", value)}
              value={form.instagram}
            />
            <SettingsInput
              label="Telegram"
              onChangeText={(value) => updateField("telegram", value)}
              value={form.telegram}
            />
          </SettingsSection>

          <SettingsSection title="Meetup preferences">
            <SettingsInput
              label="Neighborhood"
              onChangeText={(value) => updateField("neighborhood", value)}
              value={form.neighborhood}
            />
            <SettingsInput
              label="Languages"
              onChangeText={(value) => updateField("languages", value)}
              value={form.languages}
            />
            <SettingsInput
              label="Group vibe"
              onChangeText={(value) => updateField("groupVibe", value)}
              value={form.groupVibe}
            />
          </SettingsSection>

          <SettingsSection title="Interests">
            <View style={styles.chips}>
              {interestOptions.map((interest) => {
                const selected = selectedInterests.includes(interest);

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.selectedChip,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={[
                        styles.chipText,
                        selected && styles.selectedChipText,
                      ]}
                    >
                      {interest}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </SettingsSection>

          <View style={styles.settingsNote}>
            <SymbolView
              name={{ ios: "lock.fill", android: "lock", web: "lock" }}
              size={18}
              tintColor={Grapefruit}
              weight="bold"
            />
            <ThemedText type="small" style={styles.settingsNoteText}>
              Past events are part of profile history and cannot be edited here.
            </ThemedText>
          </View>

          <View style={styles.saveBar}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold" style={styles.saveButtonText}>
                Save changes
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SettingsSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.formSection}>
      <ThemedText type="default" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
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
  return (
    <View style={styles.fieldGroup}>
      <ThemedText type="smallBold" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholderTextColor={MutedText}
        style={[styles.input, multiline && styles.textArea]}
        value={value}
      />
    </View>
  );
}
