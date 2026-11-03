import { RadioGroup, Radio } from "react-aria-components";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { Icon, type IconName } from "./Icon";
const styles = stylex.create({
  root: {
    display: "inline-flex",
    gap: 3,
    padding: 3,
    borderRadius: 8,
    backgroundColor: color.subtle,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    flexWrap: "wrap",
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 28,
    paddingBlock: 4,
    paddingInline: 10,
    borderRadius: 5,
    cursor: "pointer",
    fontSize: metrics.small,
    color: color.muted,
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 2,
  },
  selected: {
    backgroundColor: color.surface,
    color: color.ink,
    boxShadow: "0 1px 3px #0001",
  },
  disabled: { opacity: 0.45, cursor: "not-allowed" },
});
export function SegmentedControl({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly {
    value: string;
    label: string;
    icon?: IconName;
    disabled?: boolean;
  }[];
}) {
  return (
    <RadioGroup
      aria-label={label}
      orientation="horizontal"
      value={value}
      onChange={onChange}
      {...stylex.props(styles.root)}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          isDisabled={option.disabled}
          className={({ isSelected, isDisabled }) =>
            stylex.props(
              styles.item,
              isSelected && styles.selected,
              isDisabled && styles.disabled,
            ).className ?? ""
          }
        >
          {option.icon && <Icon name={option.icon} size={14} />} {option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}
