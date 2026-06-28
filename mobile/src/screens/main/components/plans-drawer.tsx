import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { BottomNavigationInset } from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { FeaturedPlan } from "../types";
import { PlanDetailBody, PlanDetailHeader } from "./plan-detail-content";
import { WarmBorder, WarmSurface, styles } from "../styles";

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
      <PlanDetailHeader onClose={onClose} plan={plan} />

      <BottomSheetScrollView
        contentContainerStyle={[
          styles.detailContent,
          {
            paddingBottom: BottomNavigationInset + bottomInset + Spacing.four,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PlanDetailBody plan={plan} />
      </BottomSheetScrollView>
    </>
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
