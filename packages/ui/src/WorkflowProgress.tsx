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
  list: { display: "flex", padding: 0, margin: 0, listStyleType: "none" },
  item: { position: "relative", flexGrow: 1, flexBasis: 0, minWidth: 0 },
  connector: {
    position: "absolute",
    top: 15,
    insetInlineStart: "50%",
    width: "100%",
    borderTopWidth: 2,
    borderTopStyle: "dotted",
    borderTopColor: color.border,
  },
  control: {
    position: "relative",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    width: "100%",
    height: "100%",
    paddingBlock: 0,
    paddingInline: 6,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: color.ink,
    fontFamily: "inherit",
    fontSize: metrics.small,
    textAlign: "center",
    borderRadius: metrics.radius,
  },
  button: {
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 4,
  },
  mark: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: color.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    fontWeight: 650,
  },
  current: { borderWidth: 2, borderColor: color.ink },
  viewing: { outline: `2px solid ${color.focus}`, outlineOffset: 3 },
  complete: {
    color: color.onAccent,
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  attention: { borderColor: color.danger, color: color.danger },
  upcoming: { color: color.muted },
  copy: {
    display: { default: "flex", "@media (max-width: 600px)": "none" },
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  title: { fontWeight: 650, fontSize: 12, lineHeight: 1.4 },
  detail: { fontSize: 11, color: color.muted, lineHeight: 1.4 },
  mobile: {
    display: { default: "none", "@media (max-width: 600px)": "block" },
    marginTop: 16,
    marginBottom: 0,
    fontSize: metrics.small,
    color: color.ink,
    textAlign: "center",
    lineHeight: 1.5,
  },
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
      <ol {...stylex.props(styles.list)}>
        {steps.map((step, index) => {
          const content = (
            <>
              <span
                aria-hidden="true"
                {...stylex.props(
                  styles.mark,
                  step.status === "complete" && styles.complete,
                  step.status === "current" && styles.current,
                  step.status === "attention" && styles.attention,
                  step.id === selectedId && styles.viewing,
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
              {index < steps.length - 1 && (
                <span aria-hidden="true" {...stylex.props(styles.connector)} />
              )}
              {step.available ? (
                <button
                  type="button"
                  aria-label={`${step.label}: ${statusLabel[step.status]}${step.id === selectedId ? ", viewing" : ""}`}
                  onClick={() => onSelect(step.id)}
                  {...stylex.props(
                    styles.control,
                    styles.button,
                    step.status === "upcoming" && styles.upcoming,
                  )}
                >
                  {content}
                </button>
              ) : (
                <div
                  role="group"
                  aria-label={`${step.label}: ${statusLabel[step.status]}. ${step.detail ?? ""}`}
                  aria-disabled="true"
                  {...stylex.props(styles.control, styles.upcoming)}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {steps.some((step) => step.id === selectedId) && (
        <p {...stylex.props(styles.mobile)}>
          Step {steps.findIndex((step) => step.id === selectedId) + 1} of{" "}
          {steps.length} · {steps.find((step) => step.id === selectedId)?.label}
        </p>
      )}
    </nav>
  );
}
