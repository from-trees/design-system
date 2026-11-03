import {
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { Switch as AriaSwitch } from "react-aria-components";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { Icon } from "./Icon";
const styles = stylex.create({
  field: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  label: {
    margin: 0,
    fontFamily: "inherit",
    lineHeight: 1.4,
    fontSize: metrics.small,
    color: color.muted,
    fontWeight: 550,
  },
  input: {
    margin: 0,
    lineHeight: 1.4,
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    minHeight: metrics.control,
    paddingBlock: 7,
    paddingInline: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
    backgroundColor: color.surface,
    color: color.ink,
    fontFamily: "inherit",
    fontSize: metrics.font,
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 2,
  },
  error: { borderColor: color.danger },
  message: { fontSize: 12, color: color.muted },
  invalid: { color: color.danger },
  disabled: { opacity: 0.5, cursor: "not-allowed" },
  switch: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    cursor: "pointer",
    fontSize: metrics.font,
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 4,
    borderRadius: 4,
  },
  track: {
    display: "flex",
    alignItems: "center",
    width: 32,
    height: 20,
    padding: 3,
    borderRadius: 20,
    backgroundColor: color.border,
    boxSizing: "border-box",
    flexShrink: 0,
  },
  selected: { backgroundColor: color.accent },
  thumb: {
    width: 14,
    height: 14,
    backgroundColor: color.surface,
    borderRadius: "50%",
  },
  thumbSelected: { transform: "translateX(12px)" },
  select: { appearance: "none", paddingRight: 30 },
  selectWrap: { position: "relative" },
  chevron: {
    position: "absolute",
    right: 9,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
});
type FieldProps = { label: string; help?: string; error?: string };
export function TextInput({
  label,
  help,
  error,
  id: suppliedId,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  return (
    <div {...stylex.props(styles.field)}>
      <label htmlFor={id} {...stylex.props(styles.label)}>
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={help || error ? `${id}-message` : undefined}
        {...stylex.props(
          styles.input,
          !!error && styles.error,
          props.disabled && styles.disabled,
        )}
      />
      {(error || help) && (
        <span
          id={`${id}-message`}
          {...stylex.props(styles.message, !!error && styles.invalid)}
        >
          {error || help}
        </span>
      )}
    </div>
  );
}
export function Select({
  label,
  help,
  error,
  children,
  id: suppliedId,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  return (
    <div {...stylex.props(styles.field)}>
      <label htmlFor={id} {...stylex.props(styles.label)}>
        {label}
      </label>
      <div {...stylex.props(styles.selectWrap)}>
        <select
          {...props}
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={help || error ? `${id}-message` : undefined}
          {...stylex.props(
            styles.input,
            styles.select,
            !!error && styles.error,
            props.disabled && styles.disabled,
          )}
        >
          {children}
        </select>
        <span {...stylex.props(styles.chevron)}>
          <Icon name="chevronDown" size={14} />
        </span>
      </div>
      {(error || help) && (
        <span
          id={`${id}-message`}
          {...stylex.props(styles.message, !!error && styles.invalid)}
        >
          {error || help}
        </span>
      )}
    </div>
  );
}
export function Switch({
  label,
  selected,
  onChange,
  disabled,
}: {
  label: ReactNode;
  selected: boolean;
  onChange: (selected: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <AriaSwitch
      isSelected={selected}
      onChange={onChange}
      isDisabled={disabled}
      {...stylex.props(styles.switch, disabled && styles.disabled)}
    >
      <span
        aria-hidden="true"
        {...stylex.props(styles.track, selected && styles.selected)}
      >
        <span
          {...stylex.props(styles.thumb, selected && styles.thumbSelected)}
        />
      </span>
      {label}
    </AriaSwitch>
  );
}
