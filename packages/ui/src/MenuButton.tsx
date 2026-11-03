import { Fragment } from "react";
import {
  MenuTrigger,
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
  trigger: {
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
  group: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
});
export function MenuButton({
  label = "Actions",
  actions,
}: {
  label?: string;
  actions: readonly Action[];
}) {
  const theme = useThemeStyles();
  return (
    <MenuTrigger>
      <AriaButton aria-label={label} {...stylex.props(styles.trigger)}>
        <span title={label}>
          <Icon name="more" size={18} />
        </span>
      </AriaButton>
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
