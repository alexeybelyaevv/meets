import { Pressable, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import type { FeaturedPlan } from "@/screens/main/types";
import { eventsStyles as styles } from "../styles";

type EventCardProps = {
  onPress: () => void;
  plan: FeaturedPlan;
};

export function EventCard({ onPress, plan }: EventCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.image}>
        <ThemedText type="smallBold" style={styles.imageText}>
          {plan.tag.slice(0, 1)}
        </ThemedText>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTopLine}>
          <ThemedText type="smallBold" style={styles.tag}>
            {plan.tag}
          </ThemedText>
          <ThemedText type="smallBold" style={styles.price}>
            {plan.price}
          </ThemedText>
        </View>
        <ThemedText type="default" style={styles.cardTitle} numberOfLines={2}>
          {plan.title}
        </ThemedText>
        <ThemedText type="small" style={styles.meta} numberOfLines={1}>
          {plan.venue} · {plan.meta}
        </ThemedText>
        <View style={styles.cardFooter}>
          <View style={styles.attendeesPill}>
            <ThemedText type="smallBold" style={styles.attendeesText}>
              {plan.attendeeCount}/{plan.capacity} going
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.timeText}>
            {plan.timeLabel}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}
