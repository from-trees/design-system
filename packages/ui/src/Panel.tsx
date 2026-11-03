import { useId, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
const styles = stylex.create({
  panel: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 10,
    overflow: "hidden",
    minWidth: 0,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: metrics.panelPadding,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  title: {
    fontFamily: "inherit",
    fontStyle: "normal",
    lineHeight: 1.3,
    letterSpacing: "normal",
    whiteSpace: "normal",
    margin: 0,
    fontSize: 15,
    fontWeight: 650,
  },
  body: {
    padding: metrics.panelPadding,
    display: "flex",
    flexDirection: "column",
    gap: metrics.sectionGap,
  },
  section: {
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.border,
    paddingTop: metrics.sectionGap,
  },
  summary: {
    cursor: "pointer",
    fontSize: metrics.small,
    fontWeight: 650,
    color: color.ink,
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 4,
  },
  sectionBody: {
    display: "flex",
    flexDirection: "column",
    gap: metrics.fieldGap,
    paddingTop: 14,
  },
  hint: { fontSize: 11, color: color.muted, marginLeft: 8 },
});
export function Panel({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} {...stylex.props(styles.panel)}>
      <header {...stylex.props(styles.header)}>
        <h2 id={id} {...stylex.props(styles.title)}>
          {title}
        </h2>
        {actions}
      </header>
      <div {...stylex.props(styles.body)}>{children}</div>
    </section>
  );
}
export function Section({
  title,
  children,
  collapsible = false,
  defaultOpen = false,
  modified = false,
  hasError = false,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  modified?: boolean;
  hasError?: boolean;
}) {
  const id = useId();
  const heading = (
    <>
      {title}
      {(hasError || modified) && (
        <span {...stylex.props(styles.hint)}>
          {hasError ? " · Needs attention" : " · Modified"}
        </span>
      )}
    </>
  );
  return collapsible ? (
    <details open={defaultOpen || undefined} {...stylex.props(styles.section)}>
      <summary {...stylex.props(styles.summary)}>{heading}</summary>
      <div {...stylex.props(styles.sectionBody)}>{children}</div>
    </details>
  ) : (
    <section aria-labelledby={id}>
      <h3 id={id} {...stylex.props(styles.title)}>
        {heading}
      </h3>
      <div {...stylex.props(styles.sectionBody)}>{children}</div>
    </section>
  );
}
