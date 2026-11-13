import { useEffect, useId, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { TextInput } from "./Field";
import { color } from "./tokens.stylex";
import { ParameterContext, useParameterControl } from "./ParameterContext";

export type SliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(value: number): void;
  disabled?: boolean;
  "aria-label"?: string;
  formatValue?: (value: number) => string;
  valueInput?: { label: string; suffix?: string };
  onValidityChange?: (invalid: boolean) => void;
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
    width: 0,
    flexBasis: 60,
    minHeight: 44,
    margin: 0,
    accentColor: color.accent,
    cursor: { default: "pointer", ":disabled": "default" },
    outlineOffset: 3,
    flexGrow: 1,
  },
  valueInput: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 4,
    width: 104,
    flexShrink: 0,
    minWidth: 104,
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
  valueInput,
  onValidityChange,
}: SliderProps) {
  const parameter = useParameterControl();
  const fallback = useId();
  const id = parameter?.id ?? fallback;
  const [raw, setRaw] = useState(String(value));
  const [invalid, setInvalid] = useState(false);
  const validity = useRef(onValidityChange);
  validity.current = onValidityChange;
  useEffect(() => {
    setRaw(String(value));
    setInvalid(false);
    validity.current?.(false);
  }, [value]);
  useEffect(() => () => validity.current?.(false), []);
  const commit = () => {
    const number = Number(raw);
    if (
      !/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(raw.trim()) ||
      !Number.isFinite(number) ||
      number < min ||
      number > max
    ) {
      setInvalid(true);
      validity.current?.(true);
      return;
    }
    const [coefficient, exponent] = String(step).split("e");
    const places = Math.min(
      100,
      Math.max(
        0,
        (coefficient.split(".")[1] ?? "").length - Number(exponent ?? 0),
      ),
    );
    const steps = (number - min) / step;
    const snapped = Math.round(
      steps + Number.EPSILON * Math.max(1, Math.abs(steps)),
    );
    const rounded = Math.min(
      max,
      Math.max(min, Number((min + snapped * step).toFixed(places))),
    );
    setRaw(String(rounded));
    setInvalid(false);
    validity.current?.(false);
    if (rounded !== value) onChange(rounded);
  };
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
      {valueInput ? (
        <div {...stylex.props(s.valueInput)}>
          <ParameterContext.Provider value={undefined}>
            <TextInput
              id={`${id}-value`}
              error={invalid ? `Enter ${min}–${max}.` : undefined}
              aria-label={valueInput.label}
              aria-describedby={parameter?.["aria-describedby"]}
              aria-invalid={invalid || undefined}
              type="text"
              inputMode="decimal"
              size={1}
              value={raw}
              disabled={disabled}
              onChange={(event) => {
                setRaw(event.target.value);
                validity.current?.(true);
              }}
              onBlur={commit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  setRaw(String(value));
                  setInvalid(false);
                  validity.current?.(false);
                }
              }}
            />
          </ParameterContext.Provider>
          {valueInput.suffix && (
            <span aria-hidden="true">{valueInput.suffix}</span>
          )}
        </div>
      ) : (
        <output htmlFor={id} {...stylex.props(s.output)}>
          {formatted}
        </output>
      )}
    </div>
  );
}
