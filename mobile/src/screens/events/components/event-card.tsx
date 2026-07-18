import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import {
  Charcoal,
  Grapefruit,
  MutedText,
  WarmSurface,
} from "@/screens/main/styles";
import type { FeaturedPlan } from "@/screens/main/types";
import { eventsStyles as styles } from "../styles";
import { useLocalization } from "@/features/localization/localization";
import {
  localizeEventCategory,
  localizeEventPrice,
  localizeEventTimeLabel,
} from "@/features/events/lib/event-display";

type EventCardProps = {
  imageSource: number;
  index: number;
  onPress: () => void;
  plan: FeaturedPlan;
};

export function EventCard({
  imageSource,
  index,
  onPress,
  plan,
}: EventCardProps) {
  const { t } = useLocalization();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const setPressed = (pressed: boolean) => {
    scale.set(
      withSpring(pressed ? 0.985 : 1, {
        damping: 19,
        mass: 0.52,
        stiffness: 250,
      }),
    );
  };

  const openEvent = () => {
    void Haptics.selectionAsync();
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 65, 260))
        .duration(380)
        .easing(Easing.bezier(0.2, 0.82, 0.2, 1))}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityLabel={t("events.openA11y", { title: plan.title })}
          accessibilityRole="button"
          onPress={openEvent}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={styles.card}
        >
          <View style={styles.image}>
            <Image
              contentFit="cover"
              source={imageSource}
              style={styles.imageAsset}
              transition={240}
            />
            <View style={styles.imageBadges}>
              <View style={styles.tagPill}>
                <ThemedText
                  type="smallBold"
                  style={styles.tag}
                  numberOfLines={1}
                >
                  {localizeEventCategory(plan.tag, t)}
                </ThemedText>
              </View>
              <View style={styles.timePill}>
                <SymbolView
                  name={{
                    ios: "clock.fill",
                    android: "schedule",
                    web: "schedule",
                  }}
                  size={12}
                  tintColor={WarmSurface}
                  weight="bold"
                />
                <ThemedText
                  type="smallBold"
                  style={styles.timeText}
                  numberOfLines={1}
                >
                  {localizeEventTimeLabel(plan.timeLabel, t)}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <ThemedText
                type="default"
                style={styles.cardTitle}
                numberOfLines={2}
              >
                {plan.title}
              </ThemedText>
              <View style={styles.cardArrow}>
                <SymbolView
                  name={{
                    ios: "arrow.up.right",
                    android: "north_east",
                    web: "north_east",
                  }}
                  size={14}
                  tintColor={Charcoal}
                  weight="bold"
                />
              </View>
            </View>

            <View style={styles.locationRow}>
              <SymbolView
                name={{
                  ios: "location.fill",
                  android: "location_on",
                  web: "location_on",
                }}
                size={14}
                tintColor={MutedText}
                weight="medium"
              />
              <ThemedText type="small" style={styles.meta} numberOfLines={1}>
                {plan.venue}
              </ThemedText>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.attendeesPill}>
                <SymbolView
                  name={{
                    ios: "person.2.fill",
                    android: "groups",
                    web: "groups",
                  }}
                  size={14}
                  tintColor={Grapefruit}
                  weight="medium"
                />
                <ThemedText type="smallBold" style={styles.attendeesText}>
                  {t("events.capacityGoing", {
                    capacity: plan.capacity,
                    count: plan.attendeeCount,
                  })}
                </ThemedText>
              </View>
              <View style={styles.pricePill}>
                <ThemedText type="smallBold" style={styles.price}>
                  {localizeEventPrice(plan.price, t)}
                </ThemedText>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
