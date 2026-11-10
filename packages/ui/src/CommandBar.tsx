import { type MenuControlGroup } from "./MenuControls";
import { useId, type ReactNode, type KeyboardEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import type { IconName } from "./Icon";
import { Button, IconButton } from "./Button";
import { MenuButton, type Action } from "./MenuButton";
import { color, metrics } from "./tokens.stylex";
import { Badge } from "./Feedback";
import { layout, gap } from "./utilities";
export type CommandAction = Action & { busy?: boolean };
export type CommandStatus = {
  label: string;
  description?: string;
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
  menuGroups?: readonly MenuControlGroup[];
  status?: CommandStatus;
  inline?: boolean;
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
  inline: {
    flexWrap: { default: "nowrap", "@media (max-width: 700px)": "wrap" },
  },
  inlineLeading: { flexShrink: 0 },
  workspace: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(80px,1fr) minmax(0,auto)",
      "@media (max-width: 700px)": "minmax(0,1fr)",
    },
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
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
    flexShrink: 1,
  },
  status: {
    display: "flex",
    justifyContent: "flex-end",
    width: 112,
    minWidth: 0,
    overflow: "hidden",
  },
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
  menuGroups = [],
  status,
  inline = false,
}: CommandBarProps) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      onKeyDown={arrowNavigation}
      {...stylex.props(layout.row, gap.md, styles.bar, inline && styles.inline)}
    >
      {children && (
        <div {...stylex.props(styles.leading, inline && styles.inlineLeading)}>
          {children}
        </div>
      )}
      <div {...stylex.props(styles.trailing)}>
        {status && (
          <span
            role="status"
            aria-live="polite"
            aria-label={status.description ?? status.label}
            title={status.description ?? status.label}
            {...stylex.props(styles.status)}
          >
            <Badge tone={status.tone}>{status.label}</Badge>
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
        {(!!actions.length || !!menuGroups.length) && (
          <MenuButton
            label={menuLabel}
            icon={menuIcon}
            text={menuText}
            actions={actions}
            controlGroups={menuGroups}
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
      {...stylex.props(
        styles.header,
        styles.workspace,
        compact && styles.compact,
      )}
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
        <CommandBar {...commands} inline />
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
