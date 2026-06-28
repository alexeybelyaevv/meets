import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomNavigation,
  BottomNavigationInset,
} from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Grapefruit } from "@/screens/main/styles";
import { profile, type PastProfileEvent, type ProfileSocial } from "./data";
import { profileStyles as styles } from "./styles";

export function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: BottomNavigationInset + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHero />
          <DetailsSection />
          <SocialsSection />
          <InterestsSection />
          <TrustSection />
          <PastEventsSection />
        </ScrollView>
      </SafeAreaView>
      <BottomNavigation />
    </ThemedView>
  );
}

function ProfileHero() {
  const router = useRouter();

  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <ThemedText type="smallBold" style={styles.avatarText}>
              {profile.initials}
            </ThemedText>
          </View>
          <Pressable
            accessibilityLabel="Change profile photo"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.photoButton,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={{ ios: "camera.fill", android: "photo_camera", web: "photo_camera" }}
              size={16}
              tintColor={Grapefruit}
              weight="bold"
            />
          </Pressable>
        </View>

        <View style={styles.heroCopy}>
          <View style={styles.nameRow}>
            <ThemedText type="subtitle" style={styles.name} numberOfLines={1}>
              {profile.name}
            </ThemedText>
            <Pressable
              accessibilityLabel="Open profile settings"
              accessibilityRole="button"
              onPress={() => router.push("/profile/settings")}
              style={({ pressed }) => [
                styles.settingsButton,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "gearshape.fill",
                  android: "settings",
                  web: "settings",
                }}
                size={19}
                tintColor="#201A1A"
                weight="bold"
              />
            </Pressable>
          </View>
          <ThemedText type="smallBold" style={styles.role}>
            {profile.role}
          </ThemedText>
          <View style={styles.locationRow}>
            <SymbolView
              name={{
                ios: "location.fill",
                android: "location_on",
                web: "location_on",
              }}
              size={15}
              tintColor="#766F6B"
              weight="bold"
            />
            <ThemedText type="small" style={styles.location} numberOfLines={1}>
              {profile.location}
            </ThemedText>
          </View>
          <ThemedText type="small" style={styles.location}>
            {profile.memberSince}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="default" style={styles.bio}>
        {profile.bio}
      </ThemedText>

      <View style={styles.statsRow}>
        {profile.stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <ThemedText type="subtitle" style={styles.statValue}>
              {stat.value}
            </ThemedText>
            <ThemedText type="small" style={styles.statLabel}>
              {stat.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function DetailsSection() {
  return (
    <ProfileSection title="About">
      {profile.details.map((detail) => (
        <View key={detail.label} style={styles.detailRow}>
          <ThemedText type="small" style={styles.detailLabel}>
            {detail.label}
          </ThemedText>
          <ThemedText type="smallBold" style={styles.detailValue}>
            {detail.value}
          </ThemedText>
        </View>
      ))}
    </ProfileSection>
  );
}

function SocialsSection() {
  return (
    <ProfileSection title="Socials">
      <View style={styles.socialRow}>
        {profile.socials.map((social) => (
          <SocialButton key={social.type} social={social} />
        ))}
      </View>
    </ProfileSection>
  );
}

function SocialButton({ social }: { social: ProfileSocial }) {
  const icon = getSocialIcon(social.type);

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.socialButton, pressed && styles.pressed]}
    >
      <View style={styles.socialIcon}>
        <SymbolView name={icon} size={17} tintColor={Grapefruit} weight="bold" />
      </View>
      <View style={styles.socialTextBlock}>
        <ThemedText type="smallBold" style={styles.socialLabel} numberOfLines={1}>
          {social.label}
        </ThemedText>
        <ThemedText type="small" style={styles.socialHandle} numberOfLines={1}>
          {social.handle}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function InterestsSection() {
  return (
    <ProfileSection title="Interests">
      <View style={styles.chips}>
        {profile.interests.map((interest) => (
          <View key={interest} style={styles.chip}>
            <ThemedText type="smallBold" style={styles.chipText}>
              {interest}
            </ThemedText>
          </View>
        ))}
      </View>
    </ProfileSection>
  );
}

function TrustSection() {
  return (
    <ProfileSection title="Good to know">
      {profile.trust.map((item) => (
        <View key={item} style={styles.trustRow}>
          <View style={styles.trustIcon}>
            <SymbolView
              name={{ ios: "checkmark", android: "check", web: "check" }}
              size={15}
              tintColor={Grapefruit}
              weight="bold"
            />
          </View>
          <ThemedText type="small" style={styles.trustText}>
            {item}
          </ThemedText>
        </View>
      ))}
    </ProfileSection>
  );
}

function PastEventsSection() {
  return (
    <ProfileSection title="Past events">
      {profile.pastEvents.map((event) => (
        <PastEventCard key={event.id} event={event} />
      ))}
    </ProfileSection>
  );
}

function PastEventCard({ event }: { event: PastProfileEvent }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.eventCard, pressed && styles.pressed]}
    >
      <View style={styles.eventDate}>
        <ThemedText type="smallBold" style={styles.eventDateText}>
          {event.date}
        </ThemedText>
      </View>
      <View style={styles.eventCopy}>
        <ThemedText type="default" style={styles.eventTitle} numberOfLines={1}>
          {event.title}
        </ThemedText>
        <ThemedText type="small" style={styles.eventMeta} numberOfLines={1}>
          {event.venue} · {event.attendees} joined
        </ThemedText>
      </View>
      <SymbolView
        name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
        size={18}
        tintColor="#766F6B"
        weight="bold"
      />
    </Pressable>
  );
}

function ProfileSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="default" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function getSocialIcon(type: ProfileSocial["type"]): SymbolViewProps["name"] {
  if (type === "instagram") {
    return { ios: "camera.aperture", android: "camera", web: "camera" };
  }

  return { ios: "paperplane.fill", android: "send", web: "send" };
}
