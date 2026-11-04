import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { Icon } from "./Icon";
export type WorkflowStep = {
  id: string;
  label: string;
  status: "complete" | "current" | "upcoming" | "attention";
  detail?: string;
  available: boolean;
};
export type WorkflowProgressProps = {
  label: string;
  steps: readonly WorkflowStep[];
  selectedId: string;
  onSelect: (id: string) => void;
};
const styles = stylex.create({
  list: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: 0,
    margin: 0,
    listStyleType: "none",
  },
  long: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3,minmax(0,1fr))",
      "@media (max-width: 600px)": "repeat(2,minmax(0,1fr))",
    },
  },
  item: { flexGrow: 1, flexBasis: 160, minWidth: 0 },
  control: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    height: "100%",
    padding: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
    backgroundColor: color.surface,
    color: color.ink,
    fontFamily: "inherit",
    fontSize: metrics.small,
    textAlign: "start",
  },
  button: {
    cursor: "pointer",
    backgroundColor: { default: color.surface, ":hover": color.hovered },
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 2,
  },
  selected: { borderColor: color.accent, backgroundColor: color.subtle },
  mark: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: color.subtle,
    fontWeight: 650,
  },
  complete: { color: color.accent },
  unavailable: { color: color.muted },
  copy: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  title: { fontWeight: 650 },
  detail: { fontSize: 11, color: color.muted, lineHeight: 1.4 },
});
const statusLabel = {
  complete: "Complete",
  current: "Next step",
  upcoming: "Upcoming",
  attention: "Needs attention",
};
/** Apps supply eligibility and authoritative completion; choosing a step never completes it. */
export function WorkflowProgress({
  label,
  steps,
  selectedId,
  onSelect,
}: WorkflowProgressProps) {
  return (
    <nav aria-label={label}>
      <ol {...stylex.props(styles.list, steps.length > 3 && styles.long)}>
        {steps.map((step, index) => {
          const content = (
            <>
              <span
                aria-hidden="true"
                {...stylex.props(
                  styles.mark,
                  step.status === "complete" && styles.complete,
                )}
              >
                {step.status === "complete" ? (
                  <Icon name="check" />
                ) : step.status === "attention" ? (
                  <Icon name="info" />
                ) : (
                  index + 1
                )}
              </span>
              <span {...stylex.props(styles.copy)}>
                <span {...stylex.props(styles.title)}>{step.label}</span>
                <span {...stylex.props(styles.detail)}>
                  {step.detail ?? statusLabel[step.status]}
                </span>
              </span>
            </>
          );
          return (
            <li
              key={step.id}
              aria-current={step.status === "current" ? "step" : undefined}
              {...stylex.props(styles.item)}
            >
              {step.available ? (
                <button
                  type="button"
                  aria-label={`${step.label}: ${statusLabel[step.status]}${step.id === selectedId ? ", viewing" : ""}`}
                  onClick={() => onSelect(step.id)}
                  {...stylex.props(
                    styles.control,
                    styles.button,
                    step.id === selectedId && styles.selected,
                  )}
                >
                  {content}
                </button>
              ) : (
                <div
                  aria-disabled="true"
                  {...stylex.props(styles.control, styles.unavailable)}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
