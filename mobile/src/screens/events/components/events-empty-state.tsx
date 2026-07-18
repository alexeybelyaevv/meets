import { SymbolView } from "expo-symbols";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Grapefruit } from "@/screens/main/styles";
import { useLocalization } from "@/features/localization/localization";
import { eventsStyles as styles } from "../styles";

export function EventsEmptyState() {
  const { t } = useLocalization();

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
        {t("events.emptyTitle")}
      </ThemedText>
      <ThemedText type="small" style={styles.emptyText}>
        {t("events.emptyBody")}
      </ThemedText>
    </View>
  );
}
