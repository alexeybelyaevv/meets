import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { BottomNavigationInset } from "@/components/bottom-navigation";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { getTestEventImage } from "../data/event-images";
import type { FeaturedPlan } from "../types";
import { PlanDetailBody, PlanDetailHeader } from "./plan-detail-content";
import {
  Charcoal,
  Grapefruit,
  MutedText,
  WarmBorder,
  WarmSurface,
  styles,
} from "../styles";

type PlansDrawerProps = {
  bottomInset: number;
  drawerTopInset: number;
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
          imageSource={getTestEventImage(
            plans.findIndex((plan) => plan.id === selectedPlan.id),
          )}
          onClose={onClearSelectedPlan}
          plan={selectedPlan}
        />
      ) : (
        <PlanList
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
  imageSource,
  onClose,
  plan,
}: {
  bottomInset: number;
  imageSource: number;
  onClose: () => void;
  plan: FeaturedPlan;
}) {
  return (
    <>
      <Animated.View entering={FadeIn.duration(220)}>
        <PlanDetailHeader onClose={onClose} plan={plan} />
      </Animated.View>

      <BottomSheetScrollView
        contentContainerStyle={[
          styles.detailContent,
          {
            paddingBottom: BottomNavigationInset + bottomInset + Spacing.four,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PlanDetailBody imageSource={imageSource} plan={plan} />
      </BottomSheetScrollView>
    </>
  );
}

function PlanList({
  onSelectPlan,
  planListStyle,
  plans,
}: {
  onSelectPlan: (planId: string) => void;
  planListStyle: StyleProp<ViewStyle>;
  plans: FeaturedPlan[];
}) {
  return (
    <BottomSheetScrollView
      contentContainerStyle={planListStyle}
      showsVerticalScrollIndicator={false}
    >
      {plans.map((plan, index) => (
        <PlanCard
          key={plan.id}
          imageSource={getTestEventImage(index)}
          index={index}
          onSelectPlan={onSelectPlan}
          plan={plan}
        />
      ))}
    </BottomSheetScrollView>
  );
}

function PlanCard({
  imageSource,
  index,
  onSelectPlan,
  plan,
}: {
  imageSource: number;
  index: number;
  onSelectPlan: (planId: string) => void;
  plan: FeaturedPlan;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const setPressed = (pressed: boolean) => {
    scale.set(
      withSpring(pressed ? 0.975 : 1, {
        damping: 18,
        mass: 0.5,
        stiffness: 260,
      }),
    );
  };

  const selectPlan = () => {
    void Haptics.selectionAsync();
    onSelectPlan(plan.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 55, 220))
        .duration(360)
        .easing(Easing.bezier(0.2, 0.82, 0.2, 1))}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityLabel={`Open ${plan.title}`}
          accessibilityRole="button"
          onPress={selectPlan}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={styles.planCard}
        >
          <View style={styles.planImage}>
            <Image
              contentFit="cover"
              source={imageSource}
              style={styles.planImageAsset}
              transition={220}
            />
            <View style={styles.planImageTag}>
              <ThemedText
                type="smallBold"
                numberOfLines={1}
                style={styles.planImageTagText}
              >
                {plan.tag}
              </ThemedText>
            </View>
          </View>

          <View style={styles.planContent}>
            <ThemedText
              type="smallBold"
              style={styles.planTime}
              numberOfLines={1}
            >
              {plan.timeLabel}
            </ThemedText>
            <ThemedText
              type="default"
              style={styles.planTitle}
              numberOfLines={2}
            >
              {plan.title}
            </ThemedText>

            <View style={styles.planLocationRow}>
              <SymbolView
                name={{
                  ios: "location.fill",
                  android: "location_on",
                  web: "location_on",
                }}
                size={13}
                tintColor={MutedText}
                weight="medium"
              />
              <ThemedText
                type="small"
                style={styles.planMeta}
                numberOfLines={1}
              >
                {plan.venue}
              </ThemedText>
            </View>

            <View style={styles.planFooter}>
              <View style={styles.planAttendance}>
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
                <ThemedText type="smallBold" style={styles.planAttendanceText}>
                  {plan.attendeeCount} going
                </ThemedText>
              </View>
              <View style={styles.planPricePill}>
                <ThemedText type="smallBold" style={styles.planPrice}>
                  {plan.price}
                </ThemedText>
              </View>
            </View>
          </View>

          <SymbolView
            name={{
              ios: "chevron.right",
              android: "chevron_right",
              web: "chevron_right",
            }}
            size={16}
            tintColor={Charcoal}
            weight="bold"
          />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
