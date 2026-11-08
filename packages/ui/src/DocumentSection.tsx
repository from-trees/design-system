import { useId, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { color } from "./tokens.stylex";
import { layout, gap } from "./utilities";

export type DocumentSectionProps = {
  title: string;
  description?: string;
  /** Links and document actions belong to this section, outside the radio label. */
  actions?: ReactNode;
  columns: readonly { id: string; label: string; numeric?: boolean }[];
  rows: readonly { id: string; cells: readonly ReactNode[] }[];
  totals: readonly {
    id: string;
    label: string;
    value: ReactNode;
    emphasis?: boolean;
  }[];
  note?: string;
  selection?: {
    name: string;
    value: string;
    selected: boolean;
    disabled?: boolean;
    onSelect?: (value: string) => void;
  };
};
const s = stylex.create({
  frame: {
    minWidth: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: color.surface,
  },
  selected: {
    borderColor: color.accent,
    boxShadow: `0 0 0 1px ${color.accent}`,
  },
  scroll: {
    overflowX: "auto",
    outlineOffset: -3,
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: 13,
    lineHeight: 1.5,
    color: color.ink,
  },
  header: {
    padding: 16,
    textAlign: "start",
    backgroundColor: color.subtle,
    fontWeight: 400,
  },
  selectedHeader: { backgroundColor: color.successSurface },
  headingRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { margin: 0, fontWeight: 650, fontSize: 16, overflowWrap: "anywhere" },
  description: {
    margin: 0,
    color: color.muted,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    maxWidth: 760,
  },
  cell: {
    paddingBlock: 10,
    paddingInline: { default: 16, "@media (max-width: 600px)": 8 },
    textAlign: "start",
    verticalAlign: "top",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.border,
    overflowWrap: "anywhere",
  },
  column: { color: color.muted, fontWeight: 500, fontSize: 12 },
  numeric: {
    textAlign: "end",
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
    width: "1%",
  },
  footer: { backgroundColor: color.subtle },
  summaryLabel: { fontWeight: 400, textAlign: "end" },
  emphasis: { fontWeight: 650, color: color.ink },
  selection: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    cursor: "pointer",
    color: color.accent,
    fontWeight: 600,
  },
  radio: {
    width: 18,
    height: 18,
    margin: 0,
    accentColor: color.accent,
    flexShrink: 0,
    outlineOffset: 4,
  },
  status: { color: color.muted, fontWeight: 600 },
  note: {
    padding: 12,
    margin: 0,
    fontSize: 12,
    color: color.muted,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.border,
  },
});

/** Presentation only. The application supplies amounts, choice identity and persistence. */
export function DocumentSection({
  title,
  description,
  actions,
  columns,
  rows,
  totals,
  note,
  selection,
}: DocumentSectionProps) {
  const id = useId();
  return (
    <section
      aria-label={title}
      {...stylex.props(s.frame, selection?.selected && s.selected)}
    >
      <div
        role="region"
        aria-label={`${title} itemized table`}
        tabIndex={0}
        {...stylex.props(s.scroll)}
      >
        <table aria-labelledby={id} {...stylex.props(s.table)}>
          <thead>
            <tr>
              <th
                colSpan={columns.length}
                {...stylex.props(
                  s.header,
                  selection?.selected && s.selectedHeader,
                )}
              >
                <div {...stylex.props(layout.stack, gap.sm)}>
                  <div {...stylex.props(s.headingRow)}>
                    <h3 id={id} {...stylex.props(s.title)}>
                      {title}
                    </h3>
                    {selection &&
                      (selection.onSelect ? (
                        <label {...stylex.props(s.selection)}>
                          <input
                            type="radio"
                            name={selection.name}
                            value={selection.value}
                            checked={selection.selected}
                            disabled={selection.disabled}
                            onChange={() =>
                              selection.onSelect?.(selection.value)
                            }
                            aria-label={`Select ${title}`}
                            {...stylex.props(s.radio)}
                          />
                          {selection.selected ? "Selected" : "Select option"}
                        </label>
                      ) : (
                        <span {...stylex.props(s.status)}>
                          {selection.selected
                            ? "Selected"
                            : "Alternative · excluded"}
                        </span>
                      ))}
                  </div>
                  {description && (
                    <p {...stylex.props(s.description)}>{description}</p>
                  )}
                  {actions && (
                    <div {...stylex.props(layout.row, layout.wrap, gap.md)}>
                      {actions}
                    </div>
                  )}
                </div>
              </th>
            </tr>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  {...stylex.props(
                    s.cell,
                    s.column,
                    column.numeric && s.numeric,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell, i) => (
                  <td
                    key={columns[i].id}
                    {...stylex.props(s.cell, columns[i].numeric && s.numeric)}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot {...stylex.props(s.footer)}>
            {totals.map((total) => (
              <tr key={total.id}>
                <th
                  scope="row"
                  colSpan={columns.length - 1}
                  {...stylex.props(
                    s.cell,
                    s.summaryLabel,
                    total.emphasis && s.emphasis,
                  )}
                >
                  {total.label}
                </th>
                <td
                  {...stylex.props(
                    s.cell,
                    s.numeric,
                    total.emphasis && s.emphasis,
                  )}
                >
                  {total.value}
                </td>
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
      {note && <p {...stylex.props(s.note)}>{note}</p>}
    </section>
  );
}

const groupStyles = stylex.create({
  root: { borderWidth: 0, minWidth: 0, padding: 0, margin: 0 },
  legend: {
    padding: 0,
    marginBottom: 6,
    fontSize: 20,
    fontWeight: 650,
    color: color.ink,
  },
  description: {
    margin: 0,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 1.5,
    color: color.muted,
  },
});
export function DocumentChoiceGroup({
  title,
  description,
  disabled,
  children,
}: {
  title: string;
  description: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <fieldset
      disabled={disabled}
      aria-describedby={id}
      {...stylex.props(groupStyles.root)}
    >
      <legend {...stylex.props(groupStyles.legend)}>{title}</legend>
      <p id={id} {...stylex.props(groupStyles.description)}>
        {description}
      </p>
      <div {...stylex.props(layout.stack, gap.md)}>{children}</div>
    </fieldset>
  );
}
