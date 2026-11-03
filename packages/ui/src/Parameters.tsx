import { useEffect, useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { Icon, type IconName } from "./Icon";
import { InfoTooltip } from "./InfoTooltip";
import { parseMeasurement } from "./measurement";
export type Parameter = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: IconName;
  reference?: string;
  help?: string;
  min?: number;
  max?: number;
  readOnly?: boolean;
  disabled?: boolean;
  unit?: string;
};
export type ParameterGroup = {
  id: string;
  label: string;
  parameters: readonly Parameter[];
};
export type ParametersProps = {
  groups: readonly ParameterGroup[];
  unit?: string;
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
  labelGroup: { display: "flex", alignItems: "center", gap: 4, minWidth: 0 },
  hiddenHelp: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  disabled: { opacity: 0.5 },
});
function ParameterField({
  parameter,
  unit,
}: {
  parameter: Parameter;
  unit?: string;
}) {
  const [draft, setDraft] = useState(String(parameter.value));
  const [error, setError] = useState("");
  const id = useId();
  const label = parameter.label;
  const displayUnit = parameter.unit ?? unit;
  const detail = [parameter.reference, parameter.help]
    .filter(Boolean)
    .join("\n\n");
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
        <div {...stylex.props(styles.labelGroup)}>
          <label htmlFor={id} {...stylex.props(styles.label)}>
            {parameter.icon && <Icon name={parameter.icon} size={15} />}
            {label}
          </label>
          {detail && <InfoTooltip label={label}>{detail}</InfoTooltip>}
        </div>
        <div {...stylex.props(styles.inputWrap, !!error && styles.invalid)}>
          <input
            id={id}
            type="text"
            inputMode="text"
            value={draft}
            readOnly={parameter.readOnly}
            disabled={parameter.disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={
              [
                displayUnit ? `${id}-unit` : null,
                detail ? `${id}-help` : null,
                error ? `${id}-error` : null,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
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
          {displayUnit && (
            <span id={`${id}-unit`} {...stylex.props(styles.unit)}>
              {displayUnit}
            </span>
          )}
        </div>
      </div>
      {detail && (
        <span id={`${id}-help`} {...stylex.props(styles.hiddenHelp)}>
          {detail}
        </span>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" {...stylex.props(styles.error)}>
          {error}
        </p>
      )}
    </div>
  );
}
/** Render app-defined groups and fields in their supplied order; never infer a schema. */
export function Parameters({ groups, unit }: ParametersProps) {
  return (
    <div {...stylex.props(styles.root)}>
      {groups
        .filter((group) => group.parameters.length > 0)
        .map((group) => (
          <fieldset key={group.id} {...stylex.props(styles.group)}>
            <legend {...stylex.props(styles.legend)}>{group.label}</legend>
            <div {...stylex.props(styles.fields)}>
              {group.parameters.map((parameter) => (
                <ParameterField
                  key={parameter.id}
                  parameter={parameter}
                  unit={unit}
                />
              ))}
            </div>
          </fieldset>
        ))}
    </div>
  );
}
