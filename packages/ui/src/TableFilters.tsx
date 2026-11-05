import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { color, metrics, space } from "./tokens.stylex";
import { layout, gap } from "./utilities";
import { Button, IconButton } from "./Button";
import { Dialog } from "./Overlay";
import { Select, TextInput } from "./Field";
import { InfoTooltip } from "./InfoTooltip";
import { ParameterRow } from "./Parameters";
import type {
  TableFilterOperator,
  TableFilterValue,
  TableQuery,
} from "./tableQuery";
export type TableFilter = {
  id: string;
  label: string;
  operators?: readonly TableFilterOperator[];
  options?: readonly { value: string; label: string }[];
};
const labels: Record<TableFilterOperator, string> = {
  eq: "Is",
  contains: "Contains",
  in: "Is any of",
  noteq: "Is not",
};
const styles = stylex.create({
  summary: {
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    minHeight: metrics.control,
  },
  checkbox: { accentColor: color.accent },
  fieldset: { margin: 0, padding: 0, borderWidth: 0, minWidth: 0 },
  legend: {
    color: color.muted,
    fontSize: metrics.small,
    marginBottom: space.sm,
  },
  list: {
    listStyleType: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
  },
});
export function TableFilters({
  filters,
  values,
  onChange,
}: {
  filters: readonly TableFilter[];
  values: TableQuery["filters"];
  onChange: (values: TableQuery["filters"]) => void;
}) {
  const [editing, setEditing] = useState<TableFilter | null>(null);
  const [operator, setOperator] = useState<TableFilterOperator>("eq"),
    [draft, setDraft] = useState<string[]>([]),
    [entry, setEntry] = useState("");
  const rules = `${{ eq: "Matches an exact value.", noteq: "Excludes an exact value.", contains: "Matches literal text without case sensitivity.", in: "Matches any selected value." }[operator]} ${operator === "in" ? "Choose up to 50 values, each up to 200 characters." : "Enter one value, up to 200 characters."} Missing values match none of these operators. Filters on different fields combine with AND.`;
  const close = () => setEditing(null);
  const commit = (value: TableFilterValue | null) => {
    if (!editing) return;
    const next = { ...values };
    if (value) next[editing.id] = value;
    else delete next[editing.id];
    onChange(next);
    close();
  };
  const valid =
    draft.length > 0 &&
    draft.length <= 50 &&
    draft.every((value) => !!value.trim() && value.length <= 200);
  return (
    <>
      {filters.map((filter) => {
        const active = values[filter.id];
        const selected = active
          ? active.operator === "in"
            ? active.value
            : [active.value]
          : [];
        const text = active
          ? `${filter.label}: ${labels[active.operator]} ${selected.map((value) => filter.options?.find((option) => option.value === value)?.label ?? value).join(", ")}`
          : filter.label;
        return (
          <Button
            key={filter.id}
            icon="settings"
            aria-label={`${filter.label} filter`}
            onPress={() => {
              setEditing(filter);
              setOperator(active?.operator ?? filter.operators?.[0] ?? "eq");
              setDraft(selected);
              setEntry("");
            }}
          >
            <span title={text} {...stylex.props(styles.summary)}>
              {text}
            </span>
          </Button>
        );
      })}
      <Dialog
        title={editing ? `${editing.label} filter` : "Filter"}
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        footer={
          <>
            <Button onPress={() => commit(null)}>Clear filter</Button>
            <Button
              variant="primary"
              isDisabled={!valid}
              onPress={() =>
                commit(
                  operator === "in"
                    ? { operator, value: [...new Set(draft)].sort() }
                    : { operator, value: draft[0] },
                )
              }
            >
              Apply filter
            </Button>
          </>
        }
      >
        {editing && (
          <div {...stylex.props(layout.stack, gap.md)}>
            {(editing.operators ?? ["eq"]).length > 1 && (
              <ParameterRow label="Operator" help={rules}>
                <Select
                  label="Operator"
                  value={operator}
                  onChange={(event) => {
                    const next = event.target.value as TableFilterOperator;
                    setOperator(next);
                    if (next !== "in") setDraft(draft.slice(0, 1));
                    setEntry("");
                  }}
                >
                  {(editing.operators ?? ["eq"]).map((value) => (
                    <option key={value} value={value}>
                      {labels[value]}
                    </option>
                  ))}
                </Select>
              </ParameterRow>
            )}
            {operator === "in" ? (
              editing.options ? (
                <fieldset {...stylex.props(styles.fieldset)}>
                  <legend {...stylex.props(styles.legend)}>
                    <span {...stylex.props(layout.row, gap.sm)}>
                      Values{" "}
                      <InfoTooltip label={`${editing.label} filter rules`}>
                        {rules}
                      </InfoTooltip>
                    </span>
                  </legend>
                  {editing.options.map((option) => (
                    <label key={option.value} {...stylex.props(styles.option)}>
                      <input
                        type="checkbox"
                        checked={draft.includes(option.value)}
                        disabled={
                          !draft.includes(option.value) && draft.length >= 50
                        }
                        onChange={(event) =>
                          setDraft(
                            event.target.checked
                              ? [...draft, option.value]
                              : draft.filter((value) => value !== option.value),
                          )
                        }
                        {...stylex.props(styles.checkbox)}
                      />
                      {option.label}
                    </label>
                  ))}
                </fieldset>
              ) : (
                <>
                  <div {...stylex.props(layout.row, gap.sm)}>
                    <ParameterRow label="Value to add" help={rules}>
                      <TextInput
                        label="Value to add"
                        value={entry}
                        maxLength={200}
                        onChange={(event) => setEntry(event.target.value)}
                      />
                    </ParameterRow>
                    <Button
                      isDisabled={
                        !entry.trim() ||
                        draft.includes(entry) ||
                        draft.length >= 50
                      }
                      onPress={() => {
                        setDraft([...draft, entry]);
                        setEntry("");
                      }}
                    >
                      Add value
                    </Button>
                  </div>
                  <ul
                    aria-label="Selected filter values"
                    {...stylex.props(styles.list)}
                  >
                    {draft.map((value) => (
                      <li key={value} {...stylex.props(layout.row, gap.sm)}>
                        <span>{value}</span>
                        <IconButton
                          icon="close"
                          label={`Remove ${value}`}
                          onPress={() =>
                            setDraft(draft.filter((item) => item !== value))
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )
            ) : editing.options && operator !== "contains" ? (
              <ParameterRow label="Value" help={rules}>
                <Select
                  label="Value"
                  value={draft[0] ?? ""}
                  onChange={(event) =>
                    setDraft(event.target.value ? [event.target.value] : [])
                  }
                >
                  <option value="">Choose…</option>
                  {editing.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </ParameterRow>
            ) : (
              <ParameterRow label="Value" help={rules}>
                <TextInput
                  label="Value"
                  value={draft[0] ?? ""}
                  maxLength={200}
                  onChange={(event) => setDraft([event.target.value])}
                />
              </ParameterRow>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
