import { type Control } from "react-hook-form";
import { type SymbolViewProps } from "expo-symbols";
import { ControlledInput } from "./form-controls";
import { type EventDateTimeMode } from "../lib/date-time";
import type { EventFormValues } from "../types";

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
  return (
    <ControlledInput
      compact
      control={control}
      icon={icon}
      label={label}
      name={name}
      placeholder={mode === "date" ? "YYYY-MM-DD" : "HH:mm"}
    />
  );
}
