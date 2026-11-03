import { type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { color } from "./tokens.stylex";
import { Icon } from "./Icon";
import { layout, gap, padding } from "./utilities";
const styles = stylex.create({
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    borderRadius: 5,
    paddingBlock: 3,
    paddingInline: 7,
    fontSize: 11,
    fontWeight: 550,
    backgroundColor: color.subtle,
    color: color.muted,
    whiteSpace: "nowrap",
  },
  status: {
    borderRadius: 7,
    fontSize: 13,
    backgroundColor: color.subtle,
    color: color.ink,
  },
  success: { backgroundColor: color.successSurface, color: color.success },
  warning: { backgroundColor: color.warningSurface, color: color.warning },
  danger: { backgroundColor: color.dangerSurface, color: color.danger },
});
type Tone = "neutral" | "success" | "warning" | "danger";
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span {...stylex.props(styles.badge, tone !== "neutral" && styles[tone])}>
      {children}
    </span>
  );
}
export function Status({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      {...stylex.props(
        layout.row,
        layout.alignStart,
        gap.sm,
        padding.md,
        styles.status,
        tone !== "neutral" && styles[tone],
      )}
    >
      <Icon name={tone === "success" ? "check" : "info"} />
      <span>{children}</span>
    </div>
  );
}
