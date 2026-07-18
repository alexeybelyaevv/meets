import { SymbolView } from "expo-symbols";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Grapefruit } from "@/screens/main/styles";
import { eventsStyles as styles } from "../styles";

export function EventsEmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <SymbolView
          name={{
            ios: "sparkles",
            android: "explore",
            web: "explore",
          }}
          size={22}
          tintColor={Grapefruit}
          weight="bold"
        />
      </View>
      <ThemedText type="default" style={styles.emptyTitle}>
        Nothing here yet
      </ThemedText>
      <ThemedText type="small" style={styles.emptyText}>
        Fresh plans will show up here soon.
      </ThemedText>
    </View>
  );
}
