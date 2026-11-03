import { useEffect, useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { Icon, type IconName } from "./Icon";
import {
  parameterOrder,
  parseMeasurement,
  type ParameterKey,
} from "./measurement";
export type Parameter = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  reference?: string;
  min?: number;
  max?: number;
  readOnly?: boolean;
  disabled?: boolean;
  unit?: string;
};
export type ParametersProps = {
  values: Partial<Record<ParameterKey, Parameter>>;
  unit?: string;
};
const definitions: Record<
  ParameterKey,
  { label: string; icon: IconName; group: string }
> = {
  width: { label: "Width", icon: "width", group: "Size" },
  height: { label: "Height", icon: "height", group: "Size" },
  depth: { label: "Depth", icon: "depth", group: "Size" },
  offset: { label: "Offset", icon: "offset", group: "Position" },
  heightFromFloor: {
    label: "Height from floor",
    icon: "ground",
    group: "Position",
  },
  setback: { label: "Setback", icon: "depth", group: "Position" },
  rotation: { label: "Rotation", icon: "rotation", group: "Orientation" },
};
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 18 },
  group: { margin: 0, padding: 0, borderWidth: 0, minWidth: 0 },
  legend: {
    fontSize: 11,
    fontWeight: 650,
    color: color.muted,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: 0,
    marginBottom: 10,
  },
  fields: { display: "flex", flexDirection: "column", gap: metrics.fieldGap },
  row: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(100px, 42%)",
    gap: 12,
    alignItems: "center",
  },
  label: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontSize: metrics.small,
    color: color.ink,
    minWidth: 0,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
    backgroundColor: color.surface,
    overflow: "hidden",
  },
  input: {
    boxSizing: "border-box",
    minWidth: 0,
    width: "100%",
    minHeight: metrics.control,
    borderWidth: 0,
    paddingBlock: 6,
    paddingInline: 9,
    backgroundColor: "transparent",
    color: color.ink,
    fontSize: metrics.font,
    fontFamily: "inherit",
    fontVariantNumeric: "tabular-nums",
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: -2,
  },
  unit: { fontSize: 11, color: color.muted, paddingRight: 9 },
  error: { color: color.danger, fontSize: 12, margin: 0 },
  invalid: { borderColor: color.danger },
  reference: { fontSize: 11, color: color.muted, margin: 0 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  disabled: { opacity: 0.5 },
});
function ParameterField({
  name,
  parameter,
  unit,
}: {
  name: ParameterKey;
  parameter: Parameter;
  unit: string;
}) {
  const [draft, setDraft] = useState(String(parameter.value));
  const [error, setError] = useState("");
  const id = useId();
  useEffect(() => {
    setDraft(String(parameter.value));
    setError("");
  }, [parameter.value]);
  const commit = () => {
    if (parameter.readOnly || parameter.disabled) return;
    const parsed = parseMeasurement(draft);
    if (parsed == null) {
      setError("Enter a number or fraction.");
      return;
    }
    if (
      (parameter.min != null && parsed < parameter.min) ||
      (parameter.max != null && parsed > parameter.max)
    ) {
      setError(`Enter ${parameter.min ?? "−∞"} to ${parameter.max ?? "∞"}.`);
      return;
    }
    setError("");
    setDraft(String(parsed));
    if (parsed !== parameter.value) parameter.onChange(parsed);
  };
  return (
    <div {...stylex.props(styles.field, parameter.disabled && styles.disabled)}>
      <div {...stylex.props(styles.row)}>
        <label htmlFor={id} {...stylex.props(styles.label)}>
          <Icon name={definitions[name].icon} size={15} />
          {parameter.label ?? definitions[name].label}
        </label>
        <div {...stylex.props(styles.inputWrap, !!error && styles.invalid)}>
          <input
            id={id}
            type="text"
            inputMode="text"
            value={draft}
            readOnly={parameter.readOnly}
            disabled={parameter.disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={`${id}-unit${error || parameter.reference ? ` ${id}-hint` : ""}`}
            onChange={(e) => {
              setDraft(e.currentTarget.value);
              setError("");
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setDraft(String(parameter.value));
                setError("");
              }
            }}
            {...stylex.props(styles.input)}
          />
          <span id={`${id}-unit`} {...stylex.props(styles.unit)}>
            {parameter.unit ?? (name === "rotation" ? "°" : unit)}
          </span>
        </div>
      </div>
      {(error || parameter.reference) && (
        <p
          id={`${id}-hint`}
          role={error ? "alert" : undefined}
          {...stylex.props(error ? styles.error : styles.reference)}
        >
          {error || parameter.reference}
        </p>
      )}
    </div>
  );
}
export function Parameters({ values, unit = "in" }: ParametersProps) {
  return (
    <div {...stylex.props(styles.root)}>
      {["Size", "Position", "Orientation"].map((group) => {
        const keys = parameterOrder.filter(
          (key) => values[key] && definitions[key].group === group,
        );
        return keys.length ? (
          <fieldset key={group} {...stylex.props(styles.group)}>
            <legend {...stylex.props(styles.legend)}>{group}</legend>
            <div {...stylex.props(styles.fields)}>
              {keys.map((key) => (
                <ParameterField
                  key={key}
                  name={key}
                  parameter={values[key]!}
                  unit={unit}
                />
              ))}
            </div>
          </fieldset>
        ) : null;
      })}
    </div>
  );
}
