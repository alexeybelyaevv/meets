import { Controller, type Control, type FieldPath } from "react-hook-form";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { EventFormValues } from "../types";

const Grapefruit = "#FF5A5F";
const GrapefruitSoft = "#FFE6E3";
const WarmGray = "#F4F1EF";
const WarmBorder = "#E8E2DF";
const Charcoal = "#201A1A";
const MutedText = "#766F6B";

type ControlledInputProps = {
  control: Control<EventFormValues>;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  label: string;
  multiline?: boolean;
  name: FieldPath<EventFormValues>;
  placeholder: string;
};

export function ControlledInput({
  control,
  keyboardType = "default",
  label,
  multiline,
  name,
  placeholder,
}: ControlledInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <FieldLabel label={label} />
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            keyboardType={keyboardType}
            multiline={multiline}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor="#A69D98"
            style={[styles.input, multiline && styles.textArea]}
            value={String(value ?? "")}
          />
        )}
      />
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
    gap: Spacing.two,
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
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarmBorder,
    backgroundColor: WarmGray,
    color: Charcoal,
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  textArea: {
    minHeight: 116,
    textAlignVertical: "top",
  },
  previewRow: {
    flexDirection: "row",
    gap: Spacing.three,
    borderRadius: 20,
    backgroundColor: WarmGray,
    padding: Spacing.three,
  },
  previewIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: GrapefruitSoft,
  },
  previewCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  previewLabel: {
    color: MutedText,
  },
  previewValue: {
    color: Charcoal,
    fontWeight: "700",
  },
});
