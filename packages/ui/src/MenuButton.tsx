import { Fragment } from "react";
import { MenuControls, type MenuControlGroup } from "./MenuControls";
import { layout, gap } from "./utilities";
import {
  MenuTrigger,
  DialogTrigger,
  Dialog,
  Menu,
  MenuItem,
  Popover,
  Separator,
  Text,
  Button as AriaButton,
} from "react-aria-components";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { Icon, type IconName } from "./Icon";
import { Button } from "./Button";
import { useThemeStyles } from "./theme";
export type Action = {
  id: string;
  label: string;
  icon?: IconName;
  onAction: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
};
const styles = stylex.create({
  labeledTrigger: { width: "auto", paddingInline: 10, gap: 6 },
  triggerContents: { display: "flex", alignItems: "center", gap: 4 },
  trigger: {
    boxSizing: "border-box",
    margin: 0,
    textTransform: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: 550,
    lineHeight: 1.3,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: metrics.control,
    width: metrics.control,
    padding: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
    color: color.ink,
    backgroundColor: { default: color.surface, ":hover": color.hovered },
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 3,
  },
  popover: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 9,
    boxShadow: "0 12px 38px #132b2024",
    minWidth: 210,
    maxWidth: "calc(100vw - 24px)",
    maxHeight: "min(420px, var(--available-height))",
    overflow: "auto",
    padding: 5,
    zIndex: 100,
  },
  menu: { outline: "none" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 36,
    paddingBlock: 8,
    paddingInline: 10,
    borderRadius: 5,
    outline: "none",
    cursor: "pointer",
    fontSize: metrics.font,
  },
  focused: { backgroundColor: color.hovered },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
  danger: { color: color.danger },
  separator: {
    height: 1,
    borderWidth: 0,
    backgroundColor: color.border,
    marginBlock: 5,
  },
  controlsPopover: { minWidth: "min(300px, calc(100vw - 24px))" },
  controlDialog: { outline: "none" },
  actionButton: {
    width: "100%",
    justifyContent: "flex-start",
    borderWidth: 0,
    fontWeight: 400,
  },
  group: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
});
export function MenuButton({
  label = "Actions",
  icon = "more",
  text,
  actions,
  controlGroups = [],
}: {
  label?: string;
  icon?: IconName | null;
  text?: string;
  actions: readonly Action[];
  controlGroups?: readonly MenuControlGroup[];
}) {
  const theme = useThemeStyles();
  const trigger = (
    <AriaButton
      aria-label={label}
      {...stylex.props(styles.trigger, !!text && styles.labeledTrigger)}
    >
      <span title={label} {...stylex.props(styles.triggerContents)}>
        {icon && <Icon name={icon} size={18} />}
        {text && <span>{text}</span>}
        {(text || (icon && icon !== "more")) && (
          <Icon name="chevronDown" size={12} />
        )}
      </span>
    </AriaButton>
  );
  // Interactive controls need normal Tab/radio-group navigation, not nested
  // widgets inside ARIA menuitems. Action-only menus keep their existing model.
  if (controlGroups.length)
    return (
      <DialogTrigger>
        {trigger}
        <Popover
          placement="bottom end"
          offset={6}
          {...stylex.props(theme, styles.popover, styles.controlsPopover)}
        >
          <Dialog aria-label={label} {...stylex.props(styles.controlDialog)}>
            {({ close }) => (
              <>
                <div
                  role="group"
                  aria-label={`${label} actions`}
                  {...stylex.props(layout.stack, gap.none)}
                >
                  {actions.map((action) => (
                    <Fragment key={action.id}>
                      {action.separatorBefore && (
                        <Separator {...stylex.props(styles.separator)} />
                      )}
                      <AriaButton
                        isDisabled={action.disabled}
                        onPress={() => {
                          close();
                          action.onAction();
                        }}
                        {...stylex.props(
                          styles.trigger,
                          styles.item,
                          styles.actionButton,
                          action.destructive && styles.danger,
                          action.disabled && styles.disabled,
                        )}
                      >
                        {action.icon && <Icon name={action.icon} />}{" "}
                        {action.label}
                      </AriaButton>
                    </Fragment>
                  ))}
                </div>
                {controlGroups.map((group) => (
                  <MenuControls key={group.id} group={group} />
                ))}
              </>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    );
  return (
    <MenuTrigger>
      {trigger}
      <Popover
        placement="bottom end"
        offset={6}
        {...stylex.props(theme, styles.popover)}
      >
        <Menu
          aria-label={label}
          disabledKeys={actions.filter((a) => a.disabled).map((a) => a.id)}
          {...stylex.props(styles.menu)}
        >
          {actions.map((action) => (
            <Fragment key={action.id}>
              {action.separatorBefore && (
                <Separator {...stylex.props(styles.separator)} />
              )}
              <MenuItem
                id={action.id}
                textValue={action.label}
                onAction={action.onAction}
                className={({ isFocused, isDisabled }) =>
                  stylex.props(
                    styles.item,
                    isFocused && styles.focused,
                    isDisabled && styles.disabled,
                    action.destructive && styles.danger,
                  ).className ?? ""
                }
              >
                {action.icon && <Icon name={action.icon} />}
                <Text slot="label">{action.label}</Text>
              </MenuItem>
            </Fragment>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
export function ActionGroup({
  actions,
  primaryId,
  label = "More actions",
}: {
  actions: readonly Action[];
  primaryId?: string;
  label?: string;
}) {
  const primary = actions.find((a) => a.id === primaryId);
  const overflow = actions.filter((a) => a.id !== primary?.id);
  return (
    <div {...stylex.props(styles.group)}>
      {actions.length <= 2 ? (
        actions.map((a) => (
          <Button
            key={a.id}
            icon={a.icon}
            onPress={a.onAction}
            isDisabled={a.disabled}
            variant={
              a.destructive
                ? "danger"
                : a.id === primaryId
                  ? "primary"
                  : "secondary"
            }
          >
            {a.label}
          </Button>
        ))
      ) : (
        <>
          {primary && (
            <Button
              icon={primary.icon}
              onPress={primary.onAction}
              isDisabled={primary.disabled}
              variant="primary"
            >
              {primary.label}
            </Button>
          )}
          <MenuButton label={label} actions={overflow} />
        </>
      )}
    </div>
  );
}
