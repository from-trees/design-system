import {
  Button as AriaButton,
  TooltipTrigger,
  Tooltip,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { useThemeStyles } from "./theme";
import { Icon, type IconName } from "./Icon";
export type ButtonProps = Omit<
  AriaButtonProps,
  "children" | "style" | "className"
> & {
  children?: React.ReactNode;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  busy?: boolean;
};
const styles = stylex.create({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: metrics.control,
    paddingBlock: 7,
    paddingInline: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
    backgroundColor: { default: color.surface, ":hover": color.hovered },
    color: color.ink,
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: 550,
    lineHeight: 1.3,
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 3,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  primary: {
    backgroundColor: { default: color.accent, ":hover": color.accentHover },
    borderColor: "transparent",
    color: color.onAccent,
  },
  ghost: {
    backgroundColor: { default: "transparent", ":hover": color.hovered },
    borderColor: "transparent",
  },
  danger: {
    color: color.danger,
    backgroundColor: {
      default: color.dangerSurface,
      ":hover": color.dangerSurface,
    },
    borderColor: "transparent",
  },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
  busy: { cursor: "progress" },
  icon: { paddingInline: 0, width: metrics.control },
  tooltip: {
    paddingBlock: 6,
    paddingInline: 9,
    borderRadius: 5,
    backgroundColor: color.ink,
    color: color.surface,
    fontSize: 12,
    maxWidth: 240,
    boxShadow: "0 3px 12px #0002",
  },
});
export function Button({
  children,
  icon,
  variant = "secondary",
  busy,
  isDisabled,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      isDisabled={isDisabled || busy}
      aria-busy={busy || undefined}
      {...stylex.props(
        styles.base,
        variant !== "secondary" && styles[variant],
        (isDisabled || busy) && styles.disabled,
        busy && styles.busy,
      )}
    >
      {icon && <Icon name={icon} />} {children}
      {busy && <span aria-hidden="true">…</span>}
    </AriaButton>
  );
}
export function IconButton({
  label,
  icon,
  variant = "ghost",
  busy,
  isDisabled,
  ...props
}: Omit<ButtonProps, "children"> & { label: string; icon: IconName }) {
  const theme = useThemeStyles();
  return (
    <TooltipTrigger delay={350}>
      <AriaButton
        {...props}
        aria-label={label}
        isDisabled={isDisabled || busy}
        aria-busy={busy || undefined}
        {...stylex.props(
          styles.base,
          styles.icon,
          variant !== "secondary" && styles[variant],
          (isDisabled || busy) && styles.disabled,
        )}
      >
        <Icon name={icon} />
      </AriaButton>
      <Tooltip {...stylex.props(theme, styles.tooltip)} offset={8}>
        {label}
      </Tooltip>
    </TooltipTrigger>
  );
}
