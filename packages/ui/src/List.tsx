import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { layout, gap, margin, padding } from "./utilities";
import { Badge } from "./Feedback";
import { MenuButton, type Action } from "./MenuButton";

export type ListStatus = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};
/** A row has a status or an action menu, never an application-defined trailing layout. */
export type ListItem = {
  id: string;
  title: string;
  metadata: string;
} & (
  | { status: ListStatus; actions?: never; actionLabel?: never }
  | { status?: never; actions?: Action[]; actionLabel?: string }
);
export type ListProps = {
  label: string;
  items: readonly ListItem[];
  emptyMessage?: string;
};
const styles = stylex.create({
  list: { listStyleType: "none", width: "100%", boxSizing: "border-box" },
  row: { minHeight: metrics.control },
  content: { flexGrow: 1, minWidth: 0 },
  title: {
    display: "block",
    fontFamily: "inherit",
    fontSize: metrics.font,
    fontWeight: 650,
    lineHeight: 1.5,
    color: color.ink,
    letterSpacing: "normal",
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  metadata: {
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 1.5,
    color: color.muted,
    letterSpacing: "normal",
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  trailing: { flexShrink: 0 },
});

/** Fixed catalog list composition: two text lines, then a right-aligned status or menu. */
export function List({
  label,
  items,
  emptyMessage = "No items yet.",
}: ListProps) {
  return (
    <ul
      aria-label={label}
      {...stylex.props(
        layout.stack,
        gap.xl,
        margin.none,
        padding.none,
        styles.list,
      )}
    >
      {items.length === 0 ? (
        <li {...stylex.props(styles.metadata)}>{emptyMessage}</li>
      ) : (
        items.map((item) => (
          <li
            key={item.id}
            {...stylex.props(
              layout.row,
              layout.alignCenter,
              layout.between,
              gap.md,
              styles.row,
            )}
          >
            <div {...stylex.props(styles.content)}>
              <span title={item.title} {...stylex.props(styles.title)}>
                {item.title}
              </span>
              <p
                title={item.metadata}
                {...stylex.props(margin.none, styles.metadata)}
              >
                {item.metadata}
              </p>
            </div>
            {(item.status || !!item.actions?.length) && (
              <div {...stylex.props(styles.trailing)}>
                {item.status ? (
                  <Badge tone={item.status.tone}>{item.status.label}</Badge>
                ) : (
                  <MenuButton
                    label={item.actionLabel ?? `${item.title} actions`}
                    actions={item.actions!}
                  />
                )}
              </div>
            )}
          </li>
        ))
      )}
    </ul>
  );
}
