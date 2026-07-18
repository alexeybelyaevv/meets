import { Controller, type Control, type FieldPath } from "react-hook-form";
import * as Haptics from "expo-haptics";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  SlideInDown,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { EventFormValues } from "../types";

const Grapefruit = "#FF5A5F";
const GrapefruitSoft = "#FFE6E3";
const Charcoal = "#201A1A";
const MutedText = "#766F6B";

type ControlledInputProps = {
  compact?: boolean;
  control: Control<EventFormValues>;
  icon: SymbolViewProps["name"];
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  label: string;
  multiline?: boolean;
  name: FieldPath<EventFormValues>;
  placeholder: string;
};

type ControlledNumberPickerProps = {
  control: Control<EventFormValues>;
  label: string;
  max: number;
  min: number;
  name: FieldPath<EventFormValues>;
};

const WheelItemHeight = 48;
const WheelHeight = 240;
const WheelVerticalInset = (WheelHeight - WheelItemHeight) / 2;

export function ControlledInput({
  compact,
  control,
  icon,
  keyboardType = "default",
  label,
  multiline,
  name,
  placeholder,
}: ControlledInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const focusProgress = useSharedValue(0);
  const inputShellAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      ["#F7F3F1", "#FFFCFB"],
    ),
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      ["rgba(255, 90, 95, 0)", Grapefruit],
    ),
    transform: [
      {
        scale: interpolate(
          focusProgress.value,
          [0, 1],
          [1, 1.004],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const inputIconAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      ["#FFFCFB", GrapefruitSoft],
    ),
  }));

  const updateFocus = (nextFocused: boolean) => {
    setFocused(nextFocused);
    focusProgress.set(
      withTiming(nextFocused ? 1 : 0, {
        duration: nextFocused ? 180 : 140,
      }),
    );
  };

  return (
    <View style={styles.fieldGroup}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => (
          <Animated.View
            onTouchStart={() => inputRef.current?.focus()}
            style={[
              styles.inputShell,
              compact && styles.inputShellCompact,
              multiline && styles.inputShellMultiline,
              focused && styles.inputShellFocused,
              inputShellAnimatedStyle,
            ]}
          >
            <Animated.View
              style={[
                styles.inputIcon,
                compact && styles.inputIconCompact,
                multiline && styles.inputIconMultiline,
                inputIconAnimatedStyle,
              ]}
            >
              <SymbolView
                name={icon}
                size={compact ? 15 : 17}
                tintColor={focused ? Grapefruit : MutedText}
                weight="bold"
              />
            </Animated.View>
            <View style={styles.inputContent}>
              <ThemedText
                type="smallBold"
                style={[
                  styles.inputLabel,
                  focused && styles.inputLabelFocused,
                ]}
              >
                {label}
              </ThemedText>
              <TextInput
                ref={inputRef}
                accessibilityLabel={label}
                keyboardType={keyboardType}
                multiline={multiline}
                onBlur={() => {
                  updateFocus(false);
                  onBlur();
                }}
                onChangeText={onChange}
                onFocus={() => updateFocus(true)}
                placeholder={placeholder}
                placeholderTextColor="#A69D98"
                selectionColor={Grapefruit}
                style={[styles.input, multiline && styles.textArea]}
                value={String(value ?? "")}
              />
            </View>
          </Animated.View>
        )}
      />
    </View>
  );
}

export function ControlledNumberPicker({
  control,
  label,
  max,
  min,
  name,
}: ControlledNumberPickerProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const wheelRef = useRef<ScrollView>(null);
  const wheelOffset = useSharedValue(0);
  const wheelScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      wheelOffset.value = event.contentOffset.y;
    },
  });
  const values = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, index) => min + index),
    [max, min],
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value } }) => {
        const parsedValue = Number(value);
        const selectedValue = Number.isFinite(parsedValue)
          ? Math.min(Math.max(parsedValue, min), max)
          : min;
        const selectedIndex = selectedValue - min;

        const closePicker = () => {
          setOpen(false);
          onBlur();
        };

        const selectFromOffset = (offsetY: number) => {
          const nextIndex = Math.min(
            Math.max(Math.round(offsetY / WheelItemHeight), 0),
            values.length - 1,
          );
          const nextValue = values[nextIndex];

          if (nextValue !== selectedValue) {
            onChange(String(nextValue));
            void Haptics.selectionAsync();
          }
        };

        return (
          <>
            <Pressable
              accessibilityLabel={`Choose ${label.toLowerCase()}`}
              accessibilityRole="button"
              onPress={() => {
                Keyboard.dismiss();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                setOpen(true);
              }}
              style={({ pressed }) => [
                styles.numberPickerField,
                pressed && styles.fieldPressed,
              ]}
            >
              <View style={styles.numberPickerCopy}>
                <ThemedText type="smallBold" style={styles.inputLabel}>
                  {label}
                </ThemedText>
                <ThemedText type="default" style={styles.numberPickerValue}>
                  {selectedValue}
                </ThemedText>
              </View>
              <View style={styles.numberPickerAction}>
                <SymbolView
                  name={{
                    ios: "chevron.up.chevron.down",
                    android: "unfold_more",
                    web: "unfold_more",
                  }}
                  size={16}
                  tintColor={Grapefruit}
                  weight="bold"
                />
              </View>
            </Pressable>

            <Modal
              animationType="none"
              onRequestClose={closePicker}
              presentationStyle="overFullScreen"
              transparent
              visible={open}
            >
              <View style={styles.wheelModal}>
                <View style={styles.wheelBackdrop}>
                  <Pressable
                    accessibilityLabel="Close number picker"
                    accessibilityRole="button"
                    onPress={closePicker}
                    style={styles.wheelBackdropPressable}
                  />
                </View>
                <Animated.View
                  entering={SlideInDown.duration(240).easing(
                    Easing.out(Easing.cubic),
                  )}
                  style={[
                    styles.wheelSheet,
                    { paddingBottom: Math.max(insets.bottom, Spacing.three) },
                  ]}
                >
                  <View style={styles.wheelGrabber} />
                  <View style={styles.wheelHeader}>
                    <View style={styles.wheelHeaderCopy}>
                      <ThemedText type="subtitle" style={styles.wheelTitle}>
                        {label}
                      </ThemedText>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        void Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Soft,
                        );
                        closePicker();
                      }}
                      style={({ pressed }) => [
                        styles.wheelDoneButton,
                        pressed && styles.fieldPressed,
                      ]}
                    >
                      <ThemedText
                        type="smallBold"
                        style={styles.wheelDoneText}
                      >
                        Done
                      </ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.wheelViewport}>
                    <View pointerEvents="none" style={styles.wheelSelection} />
                    <Animated.ScrollView
                      key={`${name}-${open ? "open" : "closed"}`}
                      ref={wheelRef}
                      style={styles.wheelScroll}
                      contentContainerStyle={{
                        paddingVertical: WheelVerticalInset,
                      }}
                      contentOffset={{
                        x: 0,
                        y: selectedIndex * WheelItemHeight,
                      }}
                      decelerationRate="fast"
                      disableIntervalMomentum
                      onContentSizeChange={() => {
                        wheelOffset.set(selectedIndex * WheelItemHeight);
                        wheelRef.current?.scrollTo({
                          animated: false,
                          y: selectedIndex * WheelItemHeight,
                        });
                      }}
                      onMomentumScrollEnd={(event) =>
                        selectFromOffset(event.nativeEvent.contentOffset.y)
                      }
                      onScroll={wheelScrollHandler}
                      onScrollEndDrag={(event) =>
                        selectFromOffset(event.nativeEvent.contentOffset.y)
                      }
                      scrollEventThrottle={16}
                      showsVerticalScrollIndicator={false}
                      snapToAlignment="start"
                      snapToInterval={WheelItemHeight}
                    >
                      {values.map((item, index) => (
                        <WheelNumberItem
                          index={index}
                          key={item}
                          scrollOffset={wheelOffset}
                          value={item}
                        />
                      ))}
                    </Animated.ScrollView>
                  </View>
                </Animated.View>
              </View>
            </Modal>
          </>
        );
      }}
    />
  );
}

function WheelNumberItem({
  index,
  scrollOffset,
  value,
}: {
  index: number;
  scrollOffset: SharedValue<number>;
  value: number;
}) {
  const animatedTextStyle = useAnimatedStyle(() => {
    const distance =
      (index * WheelItemHeight - scrollOffset.value) / WheelItemHeight;
    const clampedDistance = Math.max(-1, Math.min(distance, 1));

    return {
      color: interpolateColor(
        clampedDistance,
        [-1, 0, 1],
        ["#B2AAA6", Grapefruit, "#B2AAA6"],
      ),
      opacity: interpolate(
        distance,
        [-2.5, 0, 2.5],
        [0.22, 1, 0.22],
        Extrapolation.CLAMP,
      ),
      transform: [
        { perspective: 600 },
        {
          rotateX: `${interpolate(
            distance,
            [-2, 0, 2],
            [42, 0, -42],
            Extrapolation.CLAMP,
          )}deg`,
        },
        {
          scale: interpolate(
            distance,
            [-2, 0, 2],
            [0.84, 1.1, 0.84],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.wheelItem}>
      <Animated.Text style={[styles.wheelItemText, animatedTextStyle]}>
        {value}
      </Animated.Text>
    </View>
  );
}

export function FieldLabel({
  label,
  optional,
}: {
  label: string;
  optional?: boolean;
}) {
  return (
    <View style={styles.labelRow}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      {optional ? (
        <ThemedText type="small" style={styles.optionalText}>
          Optional
        </ThemedText>
      ) : null}
    </View>
  );
}

export function PreviewRow({
  icon,
  label,
  value,
}: {
  icon: SymbolViewProps["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.previewRow}>
      <View style={styles.previewIcon}>
        <SymbolView
          name={icon}
          size={18}
          tintColor={Grapefruit}
          weight="bold"
        />
      </View>
      <View style={styles.previewCopy}>
        <ThemedText type="small" style={styles.previewLabel}>
          {label}
        </ThemedText>
        <ThemedText type="default" style={styles.previewValue}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  label: {
    color: Charcoal,
  },
  optionalText: {
    color: MutedText,
  },
  inputShell: {
    width: "100%",
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "#F7F3F1",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  inputShellFocused: {
    shadowColor: Grapefruit,
    shadowOpacity: 0.11,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  inputShellCompact: {
    gap: 8,
    paddingHorizontal: 10,
  },
  inputShellMultiline: {
    minHeight: 142,
    alignItems: "flex-start",
  },
  inputIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FFFCFB",
  },
  inputIconCompact: {
    width: 32,
    height: 32,
    borderRadius: 12,
  },
  inputIconMultiline: {
    marginTop: 4,
  },
  inputContent: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  inputLabel: {
    color: MutedText,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.2,
  },
  inputLabelFocused: {
    color: Grapefruit,
  },
  input: {
    width: "100%",
    minWidth: 0,
    minHeight: 24,
    color: Charcoal,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    padding: 0,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  numberPickerField: {
    width: "100%",
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: 22,
    backgroundColor: "#F7F3F1",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  numberPickerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  numberPickerValue: {
    color: Charcoal,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
  },
  numberPickerAction: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#FFFCFB",
  },
  fieldPressed: {
    opacity: 0.68,
  },
  wheelModal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  wheelBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(20, 15, 15, 0.38)",
  },
  wheelBackdropPressable: {
    flex: 1,
  },
  wheelSheet: {
    overflow: "hidden",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: "#FFFCFB",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  wheelGrabber: {
    width: 38,
    height: 4,
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: "#D6CFCC",
  },
  wheelHeader: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  wheelHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  wheelTitle: {
    color: Charcoal,
  },
  wheelDoneButton: {
    minWidth: 68,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: Grapefruit,
    paddingHorizontal: Spacing.three,
  },
  wheelDoneText: {
    color: "#FFFCFB",
  },
  wheelViewport: {
    height: WheelHeight,
    overflow: "hidden",
  },
  wheelSelection: {
    position: "absolute",
    top: WheelVerticalInset,
    left: 0,
    right: 0,
    zIndex: 1,
    height: WheelItemHeight,
    borderRadius: 18,
    backgroundColor: GrapefruitSoft,
  },
  wheelScroll: {
    zIndex: 2,
  },
  wheelItem: {
    height: WheelItemHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelItemText: {
    color: "#B2AAA6",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderRadius: 22,
    backgroundColor: "#F7F3F1",
    padding: Spacing.three,
  },
  previewIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: GrapefruitSoft,
  },
  previewCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  previewLabel: {
    color: MutedText,
  },
  previewValue: {
    color: Charcoal,
    fontWeight: "700",
  },
});
