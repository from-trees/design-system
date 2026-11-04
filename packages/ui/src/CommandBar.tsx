import { useId, type ReactNode, type KeyboardEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import type { IconName } from "./Icon";
import { Button, IconButton } from "./Button";
import { MenuButton, type Action } from "./MenuButton";
import { color, metrics } from "./tokens.stylex";
import { layout, gap } from "./utilities";
export type CommandAction = Action & { busy?: boolean };
export type CommandStatus = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};
export type CommandBarProps = {
  label: string;
  children?: ReactNode;
  primary?: CommandAction;
  actions?: Action[];
  menuLabel?: string;
  menuIcon?: IconName;
  menuText?: string;
  status?: CommandStatus;
};
const styles = stylex.create({
  bar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },
  leading: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    minWidth: 0,
    flexGrow: 1,
  },
  trailing: {
    minWidth:0,
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
    flexShrink: 1,
  },
  status: {
    display: "block",
    width: 160,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: color.muted,
  },
  success: { color: color.success },
  warning: { color: color.warning },
  danger: { color: color.danger },
  header: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    padding: metrics.panelPadding,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
    minWidth: 0,
  },
  identity: { flexGrow: 1, minWidth: 0, flexBasis: 180 },
  title: {
    margin: 0,
    fontFamily: "inherit",
    fontSize: 16,
    lineHeight: 1.35,
    fontWeight: 650,
    color: color.ink,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  metadata: {
    display: "block",
    fontSize: 12,
    color: color.muted,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: 3,
  },
  compact: { paddingBlock: 10, paddingInline: 12 },
  commands: { width: "auto", maxWidth: "100%", marginLeft: "auto" },
  taskActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
    flexShrink: 0,
  },
  error: { margin: 0, flexBasis: "100%", fontSize: 13, color: color.danger },
});
function arrowNavigation(event: KeyboardEvent<HTMLDivElement>) {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    !(event.target instanceof HTMLButtonElement) ||
    event.target.getAttribute("aria-expanded") === "true"
  )
    return;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const buttons = [
    ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
      "button:not(:disabled)",
    ),
  ].filter(
    (button) =>
      button.getAttribute("aria-disabled") !== "true" &&
      button.getAttribute("tabindex") !== "-1",
  );
  const index = buttons.indexOf(event.target);
  if (index < 0 || !buttons.length) return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? buttons.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
          buttons.length;
  buttons[next].focus();
}
/** At most one direct command plus one menu. Children are input controls, not extra action rows. */
export function CommandBar({
  label,
  children,
  primary,
  actions = [],
  menuLabel = "More actions",
  menuIcon,
  menuText,
  status,
}: CommandBarProps) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      onKeyDown={arrowNavigation}
      {...stylex.props(layout.row, gap.md, styles.bar)}
    >
      {children && <div {...stylex.props(styles.leading)}>{children}</div>}
      <div {...stylex.props(styles.trailing)}>
        {status && (
          <span
            role="status"
            aria-live="polite"
            title={status.label}
            {...stylex.props(
              styles.status,
              status.tone === "success" && styles.success,
              status.tone === "warning" && styles.warning,
              status.tone === "danger" && styles.danger,
            )}
          >
            {status.label}
          </span>
        )}
        {primary &&
          (primary.icon ? (
            <IconButton
              label={primary.label}
              icon={primary.icon}
              busy={primary.busy}
              isDisabled={primary.disabled}
              variant="secondary"
              onClick={primary.onAction}
            />
          ) : (
            <Button
              isDisabled={primary.disabled}
              busy={primary.busy}
              onClick={primary.onAction}
            >
              {primary.label}
            </Button>
          ))}
        {!!actions.length && (
          <MenuButton
            label={menuLabel}
            icon={menuIcon}
            text={menuText}
            actions={actions}
          />
        )}
      </div>
    </div>
  );
}
/** One identity and command area; do not stack an app header and a second document header. */
export function WorkspaceHeader({
  title,
  metadata,
  level = 2,
  compact = false,
  ...commands
}: CommandBarProps & {
  title: string;
  metadata?: string;
  level?: 1 | 2 | 3;
  compact?: boolean;
}) {
  const id = useId(),
    Heading = level === 1 ? "h1" : level === 3 ? "h3" : "h2";
  return (
    <header
      aria-labelledby={id}
      {...stylex.props(styles.header, compact && styles.compact)}
    >
      <div {...stylex.props(styles.identity)}>
        <Heading id={id} title={title} {...stylex.props(styles.title)}>
          {title}
        </Heading>
        {metadata && (
          <span title={metadata} {...stylex.props(styles.metadata)}>
            {metadata}
          </span>
        )}
      </div>
      <div {...stylex.props(styles.commands)}>
        <CommandBar {...commands} />
      </div>
    </header>
  );
}
/** A task owns its single header and two explicit commit/discard actions. */
export function TaskHeader({
  title,
  description,
  onCancel,
  onSave,
  saveLabel = "Save",
  busy = false,
  disabled = false,
  error,
}: {
  title: string;
  description?: string;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  busy?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  const id = useId();
  return (
    <header aria-labelledby={id} {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.identity)}>
        <h2 id={id} title={title} {...stylex.props(styles.title)}>
          {title}
        </h2>
        {description && (
          <span {...stylex.props(styles.metadata)}>{description}</span>
        )}
      </div>
      <div {...stylex.props(styles.taskActions)}>
        <Button isDisabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          icon="save"
          variant="primary"
          busy={busy}
          isDisabled={disabled}
          onClick={onSave}
        >
          {saveLabel}
        </Button>
      </div>
      {error && (
        <p role="alert" {...stylex.props(styles.error)}>
          {error}
        </p>
      )}
    </header>
  );
}
