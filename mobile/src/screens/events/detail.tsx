import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
  PlanDetailBody,
  PlanDetailHeader,
} from "@/screens/main/components/plan-detail-content";
import { getTestEventImage } from "@/screens/main/data/event-images";
import { styles as mainStyles } from "@/screens/main/styles";
import { useEventPlans } from "./hooks/use-event-plans";
import { eventsStyles as styles } from "./styles";

export function EventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventId = Array.isArray(params.eventId)
    ? params.eventId[0]
    : params.eventId;
  const insets = useSafeAreaInsets();
  const { loading, plans } = useEventPlans();
  const plan = plans.find((item) => item.id === eventId) ?? null;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.detailScreen, { paddingTop: insets.top }]}>
        {plan ? (
          <>
            <PlanDetailHeader
              closeLabel="Back to events"
              onClose={() => router.replace("/events")}
              plan={plan}
            />
            <ScrollView
              contentContainerStyle={[
                mainStyles.detailContent,
                { paddingBottom: insets.bottom + Spacing.four },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <PlanDetailBody
                imageSource={getTestEventImage(
                  plans.findIndex((item) => item.id === plan.id),
                )}
                plan={plan}
              />
            </ScrollView>
          </>
        ) : (
          <View style={styles.detailFallback}>
            <ThemedText type="default" style={mainStyles.detailTitle}>
              {loading ? "Loading event" : "Event not found"}
            </ThemedText>
            <ThemedText type="small" style={styles.detailFallbackText}>
              {loading
                ? "Getting the latest event details."
                : "This event is no longer available."}
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}
