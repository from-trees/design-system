import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { color } from "./tokens.stylex";
import { useParameterControl } from "./ParameterContext";

export type SliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(value: number): void;
  disabled?: boolean;
  "aria-label"?: string;
  formatValue?: (value: number) => string;
};
const s = stylex.create({
  root: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
    width: "100%",
  },
  input: {
    minWidth: 60,
    width: "100%",
    minHeight: 44,
    margin: 0,
    accentColor: color.accent,
    cursor: { default: "pointer", ":disabled": "default" },
    outlineOffset: 3,
    flexGrow: 1,
  },
  output: {
    minWidth: 60,
    textAlign: "end",
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
    color: color.ink,
  },
});
/** Controlled native range control. Applications own units, bounds and pricing. */
export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  disabled,
  "aria-label": label,
  formatValue,
}: SliderProps) {
  const parameter = useParameterControl();
  const fallback = useId();
  const id = parameter?.id ?? fallback;
  const formatted = formatValue?.(value) ?? String(value);
  return (
    <div {...stylex.props(s.root)} data-ft-ui="slider">
      <input
        {...parameter}
        id={id}
        aria-label={label}
        aria-labelledby={label ? undefined : parameter?.["aria-labelledby"]}
        aria-valuetext={formatted}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        {...stylex.props(s.input)}
      />
      <output htmlFor={id} {...stylex.props(s.output)}>
        {formatted}
      </output>
    </div>
  );
}
