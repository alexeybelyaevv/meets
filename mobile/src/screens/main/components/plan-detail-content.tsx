import { Image } from "expo-image";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import type { FeaturedPlan } from "../types";
import { Charcoal, Grapefruit, styles } from "../styles";

type PlanDetailHeaderProps = {
  closeLabel?: string;
  onClose: () => void;
  plan: FeaturedPlan;
};

export function PlanDetailHeader({
  closeLabel = "Close plan details",
  onClose,
  plan,
}: PlanDetailHeaderProps) {
  return (
    <View style={styles.detailHeaderFixed}>
      <View style={styles.detailHeaderTitleBlock}>
        <ThemedText type="smallBold" style={styles.planTag}>
          {plan.timeLabel}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.detailTitle} numberOfLines={2}>
          {plan.title}
        </ThemedText>
        <ThemedText type="small" style={styles.detailMeta} numberOfLines={1}>
          {plan.venue}
        </ThemedText>
      </View>
      <Pressable
        accessibilityLabel={closeLabel}
        accessibilityRole="button"
        hitSlop={10}
        onPress={onClose}
        style={({ pressed }) => [
          styles.detailCloseButton,
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          name={{
            ios: "xmark",
            android: "close",
            web: "close",
          }}
          size={18}
          tintColor={Charcoal}
          weight="bold"
        />
      </Pressable>
    </View>
  );
}

export function PlanDetailBody({
  imageSource,
  plan,
}: {
  imageSource: number;
  plan: FeaturedPlan;
}) {
  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(40)
          .duration(380)
          .easing(Easing.bezier(0.2, 0.82, 0.2, 1))}
        style={styles.detailPhoto}
      >
        <Image
          contentFit="cover"
          source={imageSource}
          style={styles.detailPhotoImage}
          transition={260}
        />
        <View style={styles.detailPhotoShade} />
        <View style={styles.detailPhotoBadges}>
          <View style={styles.detailPhotoBadge}>
            <ThemedText type="smallBold" style={styles.detailPhotoBadgeText}>
              {plan.tag}
            </ThemedText>
          </View>
          <View style={styles.detailPriceBadge}>
            <ThemedText type="smallBold" style={styles.detailPriceBadgeText}>
              {plan.price}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100)
          .duration(380)
          .easing(Easing.bezier(0.2, 0.82, 0.2, 1))}
        style={styles.detailBodyStack}
      >
        <ThemedText type="default" style={styles.detailDescription}>
          {plan.description}
        </ThemedText>

        <View style={styles.detailStatsRow}>
          <DetailStat
            icon={{ ios: "person.2.fill", android: "groups", web: "groups" }}
            label="people going"
            value={`${plan.attendeeCount}/${plan.capacity}`}
          />
          <DetailStat
            icon={{ ios: "clock.fill", android: "schedule", web: "schedule" }}
            label="starts"
            value={plan.timeLabel}
          />
        </View>

        <View style={styles.hostPanel}>
          <View style={styles.hostAvatar}>
            <ThemedText type="smallBold" style={styles.hostAvatarText}>
              {plan.hostInitials}
            </ThemedText>
          </View>
          <View style={styles.hostTextBlock}>
            <ThemedText type="small" style={styles.hostEyebrow}>
              Hosted by
            </ThemedText>
            <ThemedText type="default" style={styles.hostName}>
              {plan.host}
            </ThemedText>
            <ThemedText type="small" style={styles.hostRole}>
              {plan.hostRole}
            </ThemedText>
          </View>
          <View style={styles.hostRatingPill}>
            <ThemedText type="smallBold" style={styles.hostRatingText}>
              4.9
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailActions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryAction,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold" style={styles.primaryActionText}>
              Join plan
            </ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={{
                ios: "heart",
                android: "favorite_border",
                web: "favorite_border",
              }}
              size={20}
              tintColor={Grapefruit}
              weight="bold"
            />
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: SymbolViewProps["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailStat}>
      <SymbolView name={icon} size={18} tintColor={Grapefruit} weight="bold" />
      <View style={styles.detailStatTextBlock}>
        <ThemedText type="smallBold" style={styles.detailStatValue}>
          {value}
        </ThemedText>
        <ThemedText type="small" style={styles.detailStatLabel}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
}
