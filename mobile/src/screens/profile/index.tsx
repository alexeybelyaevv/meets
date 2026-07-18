import * as Haptics from "expo-haptics";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomNavigation,
  BottomNavigationInset,
} from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  useLocalization,
  type TranslationKey,
} from "@/features/localization/localization";
import {
  Charcoal,
  Grapefruit,
  MutedText,
  WarmSurface,
} from "@/screens/main/styles";
import { profile, type ProfileSocial } from "./data";
import { profileStyles as styles } from "./styles";

const activityItems: {
  descriptionKey: TranslationKey;
  icon: SymbolViewProps["name"];
  titleKey: TranslationKey;
}[] = [
  {
    descriptionKey: "profile.activity.hosted",
    icon: {
      ios: "sparkles",
      android: "auto_awesome",
      web: "auto_awesome",
    },
    titleKey: "profile.stats.hosted",
  },
  {
    descriptionKey: "profile.activity.joined",
    icon: {
      ios: "person.2.fill",
      android: "groups",
      web: "groups",
    },
    titleKey: "profile.stats.joined",
  },
  {
    descriptionKey: "profile.activity.saved",
    icon: {
      ios: "heart.fill",
      android: "favorite",
      web: "favorite",
    },
    titleKey: "saved.eyebrow",
  },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <ScrollView
          contentContainerStyle={[
            styles.profileContent,
            { paddingBottom: BottomNavigationInset + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Reveal delay={0}>
            <ProfileIntro />
          </Reveal>
          <Reveal delay={80}>
            <ActivitySection />
          </Reveal>
        </ScrollView>
      </SafeAreaView>
      <BottomNavigation />
    </ThemedView>
  );
}

function ProfileIntro() {
  const router = useRouter();
  const { t } = useLocalization();

  const openSettings = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    router.push("/profile/settings");
  };

  return (
    <View style={styles.profileIntro}>
      <View style={styles.profileTopBar}>
        <ThemedText type="default" style={styles.profileScreenTitle}>
          {t("profile.title")}
        </ThemedText>
        <Pressable
          accessibilityLabel={t("profile.openSettingsA11y")}
          accessibilityRole="button"
          onPress={openSettings}
          style={({ pressed }) => [
            styles.profileSettingsButton,
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{
              ios: "slider.horizontal.3",
              android: "tune",
              web: "tune",
            }}
            size={18}
            tintColor={Charcoal}
            weight="bold"
          />
        </Pressable>
      </View>

      <View style={styles.profileIdentity}>
        <View style={styles.profileIdentityCopy}>
          <ThemedText type="title" style={styles.profileName}>
            {profile.name}
          </ThemedText>
          <View style={styles.profileLocationRow}>
            <SymbolView
              name={{
                ios: "location.fill",
                android: "location_on",
                web: "location_on",
              }}
              size={13}
              tintColor={MutedText}
              weight="bold"
            />
            <ThemedText
              type="small"
              style={styles.profileLocation}
              numberOfLines={1}
            >
              {profile.location}
            </ThemedText>
          </View>
        </View>

        <Pressable
          accessibilityLabel={t("profile.changePhotoA11y")}
          accessibilityRole="button"
          onPress={openSettings}
          style={({ pressed }) => [
            styles.profileAvatar,
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="smallBold" style={styles.profileAvatarText}>
            {profile.initials}
          </ThemedText>
          <View style={styles.profileAvatarAction}>
            <SymbolView
              name={{
                ios: "camera.fill",
                android: "photo_camera",
                web: "photo_camera",
              }}
              size={12}
              tintColor={WarmSurface}
              weight="bold"
            />
          </View>
        </Pressable>
      </View>

      <View style={styles.profileStatement}>
        <View style={styles.profileStatementLine} />
        <ThemedText type="default" style={styles.profileBio}>
          {profile.bio}
        </ThemedText>
      </View>

      <View style={styles.profileIntroFooter}>
        <View style={styles.profileSocials}>
          {profile.socials.map((social) => (
            <SocialItem key={social.type} social={social} />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={openSettings}
          style={({ pressed }) => [
            styles.profileEditButton,
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="smallBold" style={styles.profileEditButtonText}>
            {t("profile.edit")}
          </ThemedText>
          <SymbolView
            name={{
              ios: "arrow.up.right",
              android: "north_east",
              web: "north_east",
            }}
            size={14}
            tintColor={WarmSurface}
            weight="bold"
          />
        </Pressable>
      </View>
    </View>
  );
}

function SocialItem({ social }: { social: ProfileSocial }) {
  return (
    <View style={styles.profileSocial}>
      <SymbolView
        name={getSocialIcon(social.type)}
        size={14}
        tintColor={Grapefruit}
        weight="bold"
      />
      <View style={styles.profileSocialCopy}>
        <ThemedText type="small" style={styles.profileSocialLabel}>
          {social.label}
        </ThemedText>
        <ThemedText
          numberOfLines={1}
          type="smallBold"
          style={styles.profileSocialHandle}
        >
          {social.handle}
        </ThemedText>
      </View>
    </View>
  );
}

function ActivitySection() {
  const { t } = useLocalization();

  return (
    <View style={styles.profileSection}>
      <View style={styles.profileSectionHeader}>
        <ThemedText type="subtitle" style={styles.profileSectionTitle}>
          {t("profile.activity.title")}
        </ThemedText>
        <ThemedText type="small" style={styles.profileSectionSubtitle}>
          {t("profile.activity.subtitle")}
        </ThemedText>
      </View>
      <View style={styles.profileActivityList}>
        {activityItems.map((item, index) => (
          <View key={item.titleKey} style={styles.profileActivityRow}>
            <View style={styles.profileActivityIcon}>
              <SymbolView
                name={item.icon}
                size={17}
                tintColor={Grapefruit}
                weight="bold"
              />
            </View>
            <View style={styles.profileActivityCopy}>
              <ThemedText
                type="default"
                style={styles.profileActivityTitle}
              >
                {t(item.titleKey)}
              </ThemedText>
              <ThemedText
                type="small"
                style={styles.profileActivityDescription}
              >
                {t(item.descriptionKey)}
              </ThemedText>
            </View>
            {index < activityItems.length - 1 ? (
              <View style={styles.profileActivityDivider} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function Reveal({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(340)
        .delay(delay)
        .easing(Easing.out(Easing.cubic))}
    >
      {children}
    </Animated.View>
  );
}

function getSocialIcon(type: ProfileSocial["type"]): SymbolViewProps["name"] {
  if (type === "instagram") {
    return { ios: "camera.aperture", android: "camera", web: "camera" };
  }

  return { ios: "paperplane.fill", android: "send", web: "send" };
}
