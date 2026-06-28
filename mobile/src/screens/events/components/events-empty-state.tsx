import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { eventsStyles as styles } from "../styles";

type EventsEmptyStateProps = {
  query: string;
};

export function EventsEmptyState({ query }: EventsEmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <ThemedText type="default" style={styles.emptyTitle}>
        No events found
      </ThemedText>
      <ThemedText type="small" style={styles.emptyText}>
        {query ? "Try another search term." : "Events will show up here soon."}
      </ThemedText>
    </View>
  );
}
