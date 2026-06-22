import { SymbolView } from "expo-symbols";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type ViewProps,
} from "react-native";
import type { ComponentProps } from "react";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

export const AuthColors = {
  accent: "#FF5A5F",
  accentSoft: "#FFE6E3",
  surface: "#FFFCFB",
  mutedSurface: "#F4F1EF",
  border: "#E8E2DF",
  text: "#201A1A",
  mutedText: "#766F6B",
  success: "#1D6F5F",
  hero: "#201A1A",
} as const;

export function AuthSurfaceCard({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.surfaceCard, style]} {...props}>
      {children}
    </View>
  );
}

export function AuthPill({
  label,
  active,
  style,
}: {
  label: string;
  active?: boolean;
  style?: ViewProps["style"];
}) {
  return (
    <View
      style={[
        styles.pill,
        active ? styles.pillActive : styles.pillMuted,
        style,
      ]}
    >
      <ThemedText
        type="smallBold"
        style={active ? styles.pillActiveText : styles.pillMutedText}
      >
        {label}
      </ThemedText>
    </View>
  );
}

export function AuthSegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmentedControl}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segmentedOption,
              active && styles.segmentedOptionActive,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText
              type="smallBold"
              style={
                active
                  ? styles.segmentedOptionActiveText
                  : styles.segmentedOptionText
              }
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AuthTextField({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={AuthColors.mutedText}
      style={[styles.textField, style]}
      {...props}
    />
  );
}

export function AuthIconButton({
  icon,
  onPress,
  disabled,
}: {
  icon: ComponentProps<typeof SymbolView>["name"];
  onPress: NonNullable<PressableProps["onPress"]>;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={(event) => {
        void Promise.resolve(onPress(event)).catch(() => {});
      }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={[styles.iconButton, disabled && styles.buttonDisabled]}>
        <SymbolView
          name={icon}
          size={18}
          tintColor={AuthColors.text}
          weight="semibold"
        />
      </View>
    </Pressable>
  );
}

export function AuthButton({
  backgroundColorOverride,
  label,
  icon,
  iconTintOverride,
  secondary,
  styleOverride,
  textColorOverride,
  disabled,
  onPress,
}: {
  backgroundColorOverride?: string;
  label: string;
  icon?: ComponentProps<typeof SymbolView>["name"];
  iconTintOverride?: string;
  secondary?: boolean;
  styleOverride?: ViewProps["style"];
  textColorOverride?: string;
  disabled?: boolean;
  onPress: NonNullable<PressableProps["onPress"]>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={(event) => {
        void Promise.resolve(onPress(event)).catch(() => {});
      }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View
        style={[
          styles.button,
          secondary ? styles.buttonSecondary : styles.buttonPrimary,
          backgroundColorOverride ? { backgroundColor: backgroundColorOverride } : null,
          styleOverride,
          disabled && styles.buttonDisabled,
        ]}
      >
        {icon ? (
          <SymbolView
            name={icon}
            size={18}
            tintColor={
              iconTintOverride ?? (secondary ? AuthColors.accent : AuthColors.surface)
            }
            weight="semibold"
          />
        ) : null}
        <ThemedText
          type="smallBold"
          style={[
            secondary ? styles.buttonSecondaryText : styles.buttonPrimaryText,
            textColorOverride ? { color: textColorOverride } : null,
          ]}
        >
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: AuthColors.mutedSurface,
    overflow: "hidden",
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -70,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: AuthColors.accentSoft,
  },
  backgroundGlowBottom: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "#F7D9C5",
    opacity: 0.55,
  },
  backgroundGrid: {
    position: "absolute",
    inset: 0,
    opacity: 0.3,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 223, 0.35)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AuthColors.accent,
  },
  brandLetter: {
    color: AuthColors.surface,
  },
  brandName: {
    color: AuthColors.text,
  },
  brandCaption: {
    color: AuthColors.mutedText,
  },
  surfaceCard: {
    borderWidth: 1,
    borderColor: AuthColors.border,
    borderRadius: 28,
    backgroundColor: AuthColors.surface,
    shadowColor: "#4F3430",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  pill: {
    alignSelf: "flex-start",
    minHeight: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
  pillActive: {
    backgroundColor: AuthColors.accentSoft,
    borderWidth: 1,
    borderColor: AuthColors.border,
  },
  pillMuted: {
    backgroundColor: AuthColors.surface,
    borderWidth: 1,
    borderColor: AuthColors.border,
  },
  pillActiveText: {
    color: AuthColors.accent,
  },
  pillMutedText: {
    color: AuthColors.text,
  },
  segmentedControl: {
    flexDirection: "row",
    gap: Spacing.two,
    borderRadius: 999,
    backgroundColor: AuthColors.mutedSurface,
    padding: Spacing.one,
  },
  segmentedOption: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
  segmentedOptionActive: {
    backgroundColor: AuthColors.surface,
    borderWidth: 1,
    borderColor: AuthColors.border,
  },
  segmentedOptionText: {
    color: AuthColors.mutedText,
  },
  segmentedOptionActiveText: {
    color: AuthColors.text,
  },
  textField: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: AuthColors.border,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: "500",
    color: AuthColors.text,
  },
  button: {
    minHeight: 54,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  buttonPrimary: {
    backgroundColor: AuthColors.accent,
  },
  buttonSecondary: {
    backgroundColor: AuthColors.surface,
    borderWidth: 1,
    borderColor: AuthColors.border,
  },
  buttonPrimaryText: {
    color: AuthColors.surface,
  },
  buttonSecondaryText: {
    color: AuthColors.text,
  },
  buttonDisabled: {
    opacity: 0.58,
  },
  iconButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: AuthColors.border,
  },
  pressed: {
    opacity: 0.8,
  },
});
