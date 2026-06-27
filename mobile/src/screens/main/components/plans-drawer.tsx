import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { BottomNavigationInset } from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { FeaturedPlan } from "../types";
import {
  Charcoal,
  Grapefruit,
  WarmBorder,
  WarmSurface,
  styles,
} from "../styles";

type PlansDrawerProps = {
  bottomInset: number;
  drawerTopInset: number;
  eventsError: string | null;
  onClearSelectedPlan: () => void;
  onSelectPlan: (planId: string) => void;
  plans: FeaturedPlan[];
  selectedPlan: FeaturedPlan | null;
  selectedPlanId: string | null;
  snapPoints: number[];
};

export function PlansDrawer({
  bottomInset,
  drawerTopInset,
  eventsError,
  onClearSelectedPlan,
  onSelectPlan,
  plans,
  selectedPlan,
  selectedPlanId,
  snapPoints,
}: PlansDrawerProps) {
  const planListStyle: StyleProp<ViewStyle> = [
    styles.planList,
    { paddingBottom: BottomNavigationInset + bottomInset + Spacing.five },
  ];

  return (
    <BottomSheet
      key={selectedPlanId ? "plan-details" : "plan-list"}
      enablePanDownToClose={Boolean(selectedPlanId)}
      enableDynamicSizing={false}
      index={0}
      onAnimate={(_, toIndex) => {
        if (selectedPlanId && toIndex === -1) {
          onClearSelectedPlan();
        }
      }}
      onClose={() => {
        if (selectedPlanId) {
          onClearSelectedPlan();
        }
      }}
      snapPoints={snapPoints}
      topInset={drawerTopInset}
      backgroundStyle={[
        styles.drawerBackground,
        {
          backgroundColor: WarmSurface,
          borderColor: WarmBorder,
        },
      ]}
      handleStyle={styles.drawerHandleArea}
      handleIndicatorStyle={styles.drawerHandle}
      style={styles.drawer}
    >
      {selectedPlan ? (
        <PlanDetails
          bottomInset={bottomInset}
          onClose={onClearSelectedPlan}
          plan={selectedPlan}
        />
      ) : (
        <PlanList
          eventsError={eventsError}
          onSelectPlan={onSelectPlan}
          planListStyle={planListStyle}
          plans={plans}
        />
      )}
    </BottomSheet>
  );
}

function PlanDetails({
  bottomInset,
  onClose,
  plan,
}: {
  bottomInset: number;
  onClose: () => void;
  plan: FeaturedPlan;
}) {
  return (
    <>
      <View style={styles.detailHeaderFixed}>
        <View style={styles.detailHeaderTitleBlock}>
          <ThemedText type="smallBold" style={styles.planTag}>
            {plan.tag} · {plan.price}
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={styles.detailTitle}
            numberOfLines={2}
          >
            {plan.title}
          </ThemedText>
          <ThemedText type="small" style={styles.detailMeta} numberOfLines={1}>
            {plan.venue} · {plan.meta}
          </ThemedText>
        </View>
        <Pressable
          accessibilityLabel="Close plan details"
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

      <BottomSheetScrollView
        contentContainerStyle={[
          styles.detailContent,
          {
            paddingBottom: BottomNavigationInset + bottomInset + Spacing.four,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailPhoto}>
          <View style={styles.detailPhotoBadge}>
            <ThemedText type="smallBold" style={styles.detailPhotoBadgeText}>
              {plan.tag}
            </ThemedText>
          </View>
        </View>

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
          <Pressable style={styles.primaryAction}>
            <ThemedText type="smallBold" style={styles.primaryActionText}>
              Join plan
            </ThemedText>
          </Pressable>
          <Pressable style={styles.secondaryAction}>
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
      </BottomSheetScrollView>
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

function PlanList({
  eventsError,
  onSelectPlan,
  planListStyle,
  plans,
}: {
  eventsError: string | null;
  onSelectPlan: (planId: string) => void;
  planListStyle: StyleProp<ViewStyle>;
  plans: FeaturedPlan[];
}) {
  return (
    <>
      <View style={styles.drawerHeaderFixed}>
        <View>
          <ThemedText type="subtitle" style={styles.drawerTitle}>
            Nearby plans
          </ThemedText>
          <ThemedText type="small" style={styles.drawerSubtitle}>
            {eventsError ? "Showing local examples" : "Live event feed"}
          </ThemedText>
        </View>
        <View style={styles.countPill}>
          <ThemedText type="smallBold" style={styles.countText}>
            {plans.length} near
          </ThemedText>
        </View>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={planListStyle}
        showsVerticalScrollIndicator={false}
      >
        {plans.map((plan) => (
          <Pressable
            key={plan.id}
            onPress={() => onSelectPlan(plan.id)}
            style={({ pressed }) => [
              styles.planCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.planImage}>
              <ThemedText type="smallBold" style={styles.planImageText}>
                {plan.tag.slice(0, 1)}
              </ThemedText>
            </View>
            <View style={styles.planContent}>
              <View style={styles.planTopLine}>
                <ThemedText type="smallBold" style={styles.planTag}>
                  {plan.tag}
                </ThemedText>
                <ThemedText type="smallBold" style={styles.planPrice}>
                  {plan.price}
                </ThemedText>
              </View>
              <ThemedText
                type="default"
                style={styles.planTitle}
                numberOfLines={1}
              >
                {plan.title}
              </ThemedText>
              <ThemedText
                type="small"
                style={styles.planMeta}
                numberOfLines={1}
              >
                {plan.venue} · {plan.meta}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </BottomSheetScrollView>
    </>
  );
}
