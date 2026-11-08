import { useId, useRef, useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { color } from "./tokens.stylex";
import { layout, gap } from "./utilities";

export type DocumentSectionProps = {
  title: string;
  description?: string;
  /** Compact management controls beside the title, separate from choice selection. */
  headerActions?: ReactNode;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  editingDisabled?: boolean;
  footerActions?: ReactNode;
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
  inlineButton: {
    borderWidth: 0,
    padding: 0,
    margin: 0,
    backgroundColor: "transparent",
    color: "inherit",
    font: "inherit",
    textAlign: "start",
    cursor: "text",
    overflowWrap: "anywhere",
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 3,
    borderRadius: 2,
  },
  inlineInput: {
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
    padding: 2,
    margin: 0,
    color: color.ink,
    backgroundColor: color.surface,
    font: "inherit",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.focus,
    borderRadius: 3,
    outline: "none",
  },
  editableTitle: { flexGrow: 1, flexBasis: 160, minWidth: 0 },
  footerActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.border,
  },
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

function InlineHeaderText({
  value,
  placeholder,
  label,
  disabled,
  onChange,
}: {
  value: string;
  placeholder: string;
  label: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false),
    [text, setText] = useState(value);
  const handled = useRef(false),
    trigger = useRef<HTMLButtonElement>(null);
  const finish = (save: boolean, restore = false) => {
    if (handled.current) return;
    handled.current = true;
    setEditing(false);
    if (save && text !== value) onChange(text);
    if (restore) requestAnimationFrame(() => trigger.current?.focus());
  };
  return editing ? (
    <input
      aria-label={label}
      autoFocus
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => finish(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          finish(true, true);
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          finish(false, true);
        }
      }}
      {...stylex.props(s.inlineInput)}
    />
  ) : (
    <button
      ref={trigger}
      type="button"
      aria-label={`Edit ${label.toLowerCase()}`}
      disabled={disabled}
      onClick={() => {
        handled.current = false;
        setText(value);
        setEditing(true);
      }}
      {...stylex.props(s.inlineButton)}
    >
      {value || placeholder}
    </button>
  );
}

/** Presentation only. The application supplies amounts, choice identity and persistence. */
export function DocumentSection({
  title,
  description,
  headerActions,
  onTitleChange,
  onDescriptionChange,
  editingDisabled,
  footerActions,
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
                    <h3
                      id={id}
                      aria-label={title}
                      {...stylex.props(
                        s.title,
                        !!onTitleChange && s.editableTitle,
                      )}
                    >
                      {onTitleChange ? (
                        <InlineHeaderText
                          value={title}
                          label="Section title"
                          placeholder="Untitled section"
                          disabled={editingDisabled}
                          onChange={onTitleChange}
                        />
                      ) : (
                        title
                      )}
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
                    {headerActions && (
                      <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
                        {headerActions}
                      </div>
                    )}
                  </div>
                  {(description || onDescriptionChange) && (
                    <p {...stylex.props(s.description)}>
                      {onDescriptionChange ? (
                        <InlineHeaderText
                          value={description ?? ""}
                          label="Section description"
                          placeholder="Add description"
                          disabled={editingDisabled}
                          onChange={onDescriptionChange}
                        />
                      ) : (
                        description
                      )}
                    </p>
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
      {footerActions && (
        <div
          {...stylex.props(s.footerActions, layout.row, layout.wrap, gap.sm)}
        >
          {footerActions}
        </div>
      )}
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
  onTitleChange,
  onDescriptionChange,
  children,
}: {
  title: string;
  description: string;
  onTitleChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <fieldset
      disabled={disabled}
      aria-label={title}
      aria-describedby={id}
      {...stylex.props(groupStyles.root)}
    >
      <legend {...stylex.props(groupStyles.legend)}>
        {onTitleChange ? (
          <InlineHeaderText
            value={title}
            label="Choice title"
            placeholder="Design options"
            disabled={disabled}
            onChange={onTitleChange}
          />
        ) : (
          title
        )}
      </legend>
      <p id={id} {...stylex.props(groupStyles.description)}>
        {onDescriptionChange ? (
          <InlineHeaderText
            value={description}
            label="Choice description"
            placeholder="Add description"
            disabled={disabled}
            onChange={onDescriptionChange}
          />
        ) : (
          description
        )}
      </p>
      <div {...stylex.props(layout.stack, gap.md)}>{children}</div>
    </fieldset>
  );
}
