import { useId, useRef, useState, type ReactNode } from "react";
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Text,
} from "react-aria-components";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { Icon } from "./Icon";
import { useParameterControl } from "./ParameterContext";
import { useThemeStyles } from "./theme";

export type SwatchOption = {
  id: string;
  label: string;
  preview: ReactNode;
  description?: string;
  disabled?: boolean;
};
export type SwatchPickerProps = {
  label?: string;
  value: string | null;
  options: readonly SwatchOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};
const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
    width: "100%",
  },
  label: { fontSize: metrics.small, color: color.muted, fontWeight: 550 },
  trigger: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: 7,
    width: "100%",
    minWidth: 0,
    minHeight: metrics.control,
    paddingBlock: 5,
    paddingInline: 7,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
    backgroundColor: { default: color.surface, ":hover": color.hovered },
    color: color.ink,
    fontFamily: "inherit",
    fontSize: metrics.font,
    textAlign: "start",
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 2,
  },
  thumb: {
    width: 25,
    height: 25,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: color.subtle,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
  },
  value: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
    flexGrow: 1,
  },
  popover: {
    boxSizing: "border-box",
    width: 350,
    maxWidth: "calc(100vw - 24px)",
    maxHeight: "min(420px, var(--available-height))",
    overflowY: "auto",
    padding: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 10,
    backgroundColor: color.surface,
    color: color.ink,
    boxShadow: "0 12px 38px #132b2024",
    zIndex: 300,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 7,
    outline: "none",
  },
  option: {
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 6,
    padding: 5,
    minWidth: 0,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 7,
    backgroundColor: color.surface,
    cursor: "pointer",
    outline: "none",
  },
  selected: { borderColor: color.accent, backgroundColor: color.subtle },
  focused: { outline: `2px solid ${color.focus}`, outlineOffset: -1 },
  preview: {
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: color.subtle,
  },
  caption: {
    fontSize: 12,
    lineHeight: 1.3,
    textAlign: "center",
    color: color.ink,
    overflowWrap: "anywhere",
  },
  check: {
    position: "absolute",
    right: 7,
    top: 7,
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: color.accent,
    color: color.onAccent,
  },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
  invalid: { borderColor: color.danger },
  hidden: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});
/** Compact visual choice. Applications own preview artwork, option identity and eligibility. */
export function SwatchPicker({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Choose…",
}: SwatchPickerProps) {
  const parameter = useParameterControl();
  const generatedId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [portal, setPortal] = useState<Element>();
  const theme = useThemeStyles();
  const current = options.find((option) => option.id === value);
  if (!parameter && !label)
    throw new Error("Standalone swatch pickers require a label.");
  return (
    <Select
      selectedKey={value}
      onSelectionChange={(key) => {
        if (key != null) onChange(String(key));
      }}
      isDisabled={disabled || options.length === 0}
      isInvalid={parameter?.["aria-invalid"]}
      aria-labelledby={parameter?.["aria-labelledby"]}
      aria-describedby={parameter?.["aria-describedby"]}
      disabledKeys={options
        .filter((option) => option.disabled)
        .map((option) => option.id)}
      onOpenChange={(open) => {
        if (open) setPortal(trigger.current?.closest("dialog") ?? undefined);
      }}
      {...stylex.props(styles.root)}
    >
      {!parameter && <Label {...stylex.props(styles.label)}>{label}</Label>}
      <Button
        ref={trigger}
        id={parameter?.id ?? generatedId}
        {...stylex.props(
          styles.trigger,
          (disabled || options.length === 0) && styles.disabled,
          parameter?.["aria-invalid"] && styles.invalid,
        )}
      >
        <span aria-hidden="true" {...stylex.props(styles.thumb)}>
          {current?.preview ?? <Icon name="view" />}
        </span>
        <SelectValue {...stylex.props(styles.value)}>
          {() => (
            <span title={current?.label}>
              {current?.label ?? (options.length ? placeholder : "No options")}
            </span>
          )}
        </SelectValue>
        <Icon name="chevronDown" size={14} />
      </Button>
      <Popover
        placement="bottom end"
        offset={6}
        UNSTABLE_portalContainer={portal}
        {...stylex.props(theme, styles.popover)}
      >
        <ListBox layout="grid" items={options} {...stylex.props(styles.grid)}>
          {(option) => (
            <ListBoxItem
              id={option.id}
              textValue={option.label}
              className={({ isSelected, isFocused, isDisabled }) =>
                stylex.props(
                  styles.option,
                  isSelected && styles.selected,
                  isFocused && styles.focused,
                  isDisabled && styles.disabled,
                ).className ?? ""
              }
            >
              {({ isSelected }) => (
                <>
                  <span aria-hidden="true" {...stylex.props(styles.preview)}>
                    {option.preview}
                  </span>
                  <Text slot="label" {...stylex.props(styles.caption)}>
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text slot="description" {...stylex.props(styles.hidden)}>
                      {option.description}
                    </Text>
                  )}
                  {isSelected && (
                    <span aria-hidden="true" {...stylex.props(styles.check)}>
                      <Icon name="check" size={14} />
                    </span>
                  )}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
}
