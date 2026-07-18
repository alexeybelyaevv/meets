import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import { Controller, type Control } from "react-hook-form";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import {
  APP_INTL_LOCALES,
  useLocalization,
} from "@/features/localization/localization";
import {
  formatEventDate,
  formatEventTime,
  parseEventDateTimeValue,
  startOfToday,
  toEventDateTimeValue,
  type EventDateTimeMode,
} from "../lib/date-time";
import type { EventFormValues } from "../types";

const Grapefruit = "#FF5A5F";
const Charcoal = "#201A1A";
const MutedText = "#766F6B";
const PickerCloseDuration = 180;

type ControlledDateTimePickerProps = {
  control: Control<EventFormValues>;
  icon: SymbolViewProps["name"];
  label: string;
  mode: EventDateTimeMode;
  name: "date" | "time";
};

export function ControlledDateTimePicker({
  control,
  icon,
  label,
  mode,
  name,
}: ControlledDateTimePickerProps) {
  const { locale, t } = useLocalization();
  const intlLocale = APP_INTL_LOCALES[locale];
  const [open, setOpen] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [draftValue, setDraftValue] = useState(() =>
    parseEventDateTimeValue("", mode),
  );
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value } }) => {
        const stringValue = String(value ?? "");
        const formattedValue =
          mode === "date"
            ? formatEventDate(
                stringValue,
                intlLocale,
                t("create.chooseDate"),
              )
            : formatEventTime(
                stringValue,
                intlLocale,
                t("create.chooseTime"),
              );

        const closePicker = () => {
          setSheetVisible(false);

          if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
          }

          closeTimerRef.current = setTimeout(() => {
            setOpen(false);
            onBlur();
            closeTimerRef.current = null;
          }, PickerCloseDuration + 32);
        };

        const commitValue = (nextValue: Date) => {
          onChange(toEventDateTimeValue(nextValue, mode));
          void Haptics.selectionAsync();
        };

        const finishAndroidSelection = (nextValue: Date) => {
          commitValue(nextValue);
          onBlur();
        };

        const openPicker = () => {
          Keyboard.dismiss();
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

          const initialValue = parseEventDateTimeValue(stringValue, mode);

          if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
              display: "default",
              is24Hour: true,
              minimumDate: mode === "date" ? startOfToday() : undefined,
              mode,
              onDismiss: onBlur,
              onValueChange: (_, nextValue) =>
                finishAndroidSelection(nextValue),
              title: label,
              value: initialValue,
            });
            return;
          }

          setDraftValue(initialValue);
          setOpen(true);
          setSheetVisible(true);
        };

        return (
          <>
            <Pressable
              accessibilityLabel={`${label}: ${formattedValue}`}
              accessibilityRole="button"
              onPress={openPicker}
              style={({ pressed }) => [
                styles.field,
                pressed && styles.fieldPressed,
              ]}
            >
              <View style={styles.fieldIcon}>
                <SymbolView
                  name={icon}
                  size={16}
                  tintColor={Grapefruit}
                  weight="bold"
                />
              </View>
              <View style={styles.fieldCopy}>
                <ThemedText type="smallBold" style={styles.fieldLabel}>
                  {label}
                </ThemedText>
                <ThemedText
                  numberOfLines={1}
                  type="default"
                  style={[
                    styles.fieldValue,
                    !stringValue && styles.fieldPlaceholder,
                  ]}
                >
                  {formattedValue}
                </ThemedText>
              </View>
              <SymbolView
                name={{
                  ios: "chevron.up.chevron.down",
                  android: "unfold_more",
                  web: "unfold_more",
                }}
                size={14}
                tintColor={Grapefruit}
                weight="bold"
              />
            </Pressable>

            {Platform.OS === "ios" ? (
              <Modal
                animationType="none"
                onRequestClose={closePicker}
                presentationStyle="overFullScreen"
                transparent
                visible={open}
              >
                <View style={styles.modal}>
                  <View style={styles.backdrop}>
                    <Pressable
                      accessibilityLabel={t("picker.closeA11y", {
                        field: label.toLocaleLowerCase(intlLocale),
                      })}
                      accessibilityRole="button"
                      onPress={closePicker}
                      style={styles.backdropPressable}
                    />
                  </View>
                  {sheetVisible ? (
                    <Animated.View
                      entering={SlideInDown.duration(240).easing(
                        Easing.out(Easing.cubic),
                      )}
                      exiting={SlideOutDown.duration(
                        PickerCloseDuration,
                      ).easing(Easing.in(Easing.cubic))}
                      style={[
                        styles.sheet,
                        {
                          paddingBottom: Math.max(insets.bottom, Spacing.three),
                        },
                      ]}
                    >
                      <View style={styles.grabber} />
                      <View style={styles.sheetHeader}>
                        <ThemedText type="default" style={styles.sheetTitle}>
                          {label}
                        </ThemedText>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => {
                            commitValue(draftValue);
                            closePicker();
                          }}
                          style={({ pressed }) => [
                            styles.doneButton,
                            pressed && styles.fieldPressed,
                          ]}
                        >
                          <ThemedText
                            type="smallBold"
                            style={styles.doneButtonText}
                          >
                            {t("common.done")}
                          </ThemedText>
                        </Pressable>
                      </View>
                      <View style={styles.sheetDivider} />
                      <View style={styles.nativePickerWrap}>
                        <DateTimePicker
                          accentColor={Grapefruit}
                          display="spinner"
                          locale={intlLocale}
                          minimumDate={
                            mode === "date" ? startOfToday() : undefined
                          }
                          minuteInterval={5}
                          mode={mode}
                          onValueChange={(_, nextValue) =>
                            setDraftValue(nextValue)
                          }
                          style={styles.nativePicker}
                          themeVariant="light"
                          value={draftValue}
                        />
                      </View>
                    </Animated.View>
                  ) : null}
                </View>
              </Modal>
            ) : null}
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    width: "100%",
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 22,
    backgroundColor: "#F7F3F1",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  fieldPressed: {
    opacity: 0.68,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFCFB",
  },
  fieldCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  fieldLabel: {
    color: MutedText,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.2,
  },
  fieldValue: {
    color: Charcoal,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  fieldPlaceholder: {
    color: "#A69D98",
    fontWeight: "600",
  },
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(20, 15, 15, 0.28)",
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    overflow: "hidden",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#FCFAF9",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grabber: {
    width: 36,
    height: 4,
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: "#DED9D6",
  },
  sheetHeader: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  sheetTitle: {
    flex: 1,
    color: Charcoal,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  doneButton: {
    minWidth: 52,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
  },
  doneButtonText: {
    color: Grapefruit,
    fontSize: 15,
    lineHeight: 20,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(32, 26, 26, 0.1)",
  },
  nativePickerWrap: {
    minHeight: 216,
    justifyContent: "center",
    backgroundColor: "#FCFAF9",
  },
  nativePicker: {
    height: 216,
  },
});
