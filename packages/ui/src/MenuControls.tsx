import { type ComponentProps, type ReactNode, useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { SegmentedControl } from "./SegmentedControl";
import { InfoTooltip } from "./InfoTooltip";
import { color, metrics } from "./tokens.stylex";
import { layout, gap, padding } from "./utilities";

export type MenuControl = ComponentProps<typeof SegmentedControl> & {
  id: string;
};
export type MenuControlGroup = {
  id: string;
  label: string;
  help?: ReactNode;
  controls: readonly MenuControl[];
};
const styles = stylex.create({
  group: {
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.border,
    marginTop: 5,
  },
  heading: {
    fontSize: metrics.small,
    fontWeight: 650,
    color: color.muted,
    margin: 0,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "64px minmax(0,1fr)",
    alignItems: "center",
    gap: 8,
  },
  label: { fontSize: metrics.font, color: color.ink },
});
export function MenuControls({ group }: { group: MenuControlGroup }) {
  const heading = useId();
  return (
    <section
      role="group"
      aria-labelledby={heading}
      {...stylex.props(layout.stack, gap.sm, padding.sm, styles.group)}
    >
      <div {...stylex.props(layout.row, layout.alignCenter, gap.xs)}>
        <h3 id={heading} {...stylex.props(styles.heading)}>
          {group.label}
        </h3>
        {group.help && (
          <InfoTooltip label={group.label}>{group.help}</InfoTooltip>
        )}
      </div>
      {group.controls.map(({ id, ...control }) => (
        <div key={id} {...stylex.props(styles.row)}>
          <span {...stylex.props(styles.label)}>{control.label}:</span>
          <SegmentedControl {...control} />
        </div>
      ))}
    </section>
  );
}
