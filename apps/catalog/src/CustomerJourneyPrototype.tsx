import { useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Button,
  Dialog,
  InfoTooltip,
  Select,
  Status,
  TextInput,
  WorkflowProgress,
  type WorkflowStep,
} from "@from-trees/ui";
import { layout, gap, padding } from "@from-trees/ui/utilities";
import { color } from "@from-trees/ui/tokens.stylex";
const styles = stylex.create({
  root: { width: "100%", minWidth: 0 },
  frame: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: color.surface,
  },
  header: {
    display: "flex",
    alignItems: "start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: 22, lineHeight: 1.3, color: color.ink },
  text: { margin: 0, color: color.muted, fontSize: 13, lineHeight: 1.5 },
  total: { fontSize: 24, fontWeight: 650, color: color.ink, margin: 0 },
  heading: { margin: 0, fontSize: 18, color: color.ink, outline: "none" },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.border,
    paddingTop: 16,
  },
  check: {
    display: "flex",
    alignItems: "start",
    gap: 8,
    fontSize: 13,
    lineHeight: 1.5,
  },
  review: { display: "flex", alignItems: "end", flexWrap: "wrap", gap: 12 },
});
type Scenario =
  | "Ready to review"
  | "Approval only"
  | "Preparing agreement"
  | "Approved · deposit due"
  | "Checkout open"
  | "Payment processing"
  | "Deposit paid"
  | "No deposit required"
  | "Payment failed"
  | "Payment needs review"
  | "Expired"
  | "Superseded";
const scenarios: Scenario[] = [
  "Ready to review",
  "Approval only",
  "Preparing agreement",
  "Approved · deposit due",
  "Checkout open",
  "Payment processing",
  "Deposit paid",
  "No deposit required",
  "Payment failed",
  "Payment needs review",
  "Expired",
  "Superseded",
];
export function CustomerJourneyPrototype() {
  const [scenario, setScenario] = useState<Scenario>("Ready to review"),
    [selected, setSelected] = useState("review"),
    [reviewed, setReviewed] = useState(false),
    [signed, setSigned] = useState(false),
    [name, setName] = useState(""),
    [consent, setConsent] = useState(false),
    [terms, setTerms] = useState(false),
    [electronic, setElectronic] = useState(false),
    [confirm, setConfirm] = useState(false),
    [document, setDocument] = useState("");
  const heading = useRef<HTMLHeadingElement>(null),
    frame = useRef<HTMLDivElement>(null);
  const approved =
    signed ||
    [
      "Approved · deposit due",
      "Checkout open",
      "Payment processing",
      "Deposit paid",
      "No deposit required",
      "Payment failed",
      "Payment needs review",
    ].includes(scenario);
  const blocked = scenario === "Expired" || scenario === "Superseded",
    preparing = scenario === "Preparing agreement",
    payment = scenario !== "Approval only",
    paid = scenario === "Deposit paid",
    noDeposit = scenario === "No deposit required",
    processing = scenario === "Payment processing",
    needsReview = scenario === "Payment needs review",
    failed = scenario === "Payment failed";
  const complete = approved && (!payment || paid || noDeposit);
  const go = (id: string) => {
    setSelected(id);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      frame.current?.scrollIntoView?.({ block: "start" });
    });
  };
  const steps: WorkflowStep[] = [
    {
      id: "review",
      label: "Review estimate",
      status: reviewed || approved ? "complete" : "current",
      available: true,
      detail: reviewed || approved ? "Reviewed" : "Scope, price & documents",
    },
    {
      id: "approval",
      label: "Approve & sign",
      status: approved
        ? "complete"
        : blocked
          ? "attention"
          : reviewed && !preparing
            ? "current"
            : "upcoming",
      available: approved || reviewed || blocked,
      detail: approved
        ? "Signed"
        : blocked
          ? "Contact your cabinetmaker"
          : preparing
            ? "Agreement being prepared"
            : "Terms & signature",
    },
    ...(payment
      ? [
          {
            id: "deposit",
            label: "Deposit",
            status:
              paid || noDeposit
                ? "complete"
                : failed || needsReview
                  ? "attention"
                  : approved
                    ? "current"
                    : "upcoming",
            available: approved,
            detail: paid
              ? "Paid"
              : noDeposit
                ? "Not required"
                : processing
                  ? "Processing — no action needed"
                  : needsReview
                    ? "Contact your cabinetmaker"
                    : approved
                      ? "$4,000 due"
                      : "Available after signing",
          } satisfies WorkflowStep,
        ]
      : []),
    {
      id: "queue",
      label: "Production queue",
      status: complete ? "current" : "upcoming",
      available: true,
      detail: complete
        ? "Awaiting shop confirmation"
        : "After approval & deposit",
    },
    {
      id: "final-design",
      label: "Final design confirmation",
      status: "upcoming",
      available: true,
      detail: "Confirm details before production",
    },
    {
      id: "production",
      label: "Production",
      status: "upcoming",
      available: true,
      detail: "Updates from your cabinetmaker",
    },
    {
      id: "final-payment",
      label: "Final Production Payment Due",
      status: "upcoming",
      available: true,
      detail: "Requested after production",
    },
    {
      id: "delivery",
      label: "Delivery",
      status: "upcoming",
      available: true,
      detail: "Arrangements confirmed by shop",
    },
  ];
  return (
    <div {...stylex.props(styles.root, layout.stack, gap.lg)}>
      <Status>
        Interactive example. No real signature, approval or payment is
        submitted.
      </Status>
      <div
        ref={frame}
        {...stylex.props(styles.frame, padding.lg, layout.stack, gap.lg)}
      >
        <header {...stylex.props(styles.header)}>
          <div {...stylex.props(layout.stack, gap.xs)}>
            <p {...stylex.props(styles.text)}>
              Sample Cabinet Shop · Estimate 1042
            </p>
            <h2 {...stylex.props(styles.title)}>Kitchen cabinetry</h2>
            <p {...stylex.props(styles.text)}>
              Prepared for Example Customer · Revision 3
            </p>
          </div>
          <div>
            <p {...stylex.props(styles.total)}>$12,000</p>
            <p {...stylex.props(styles.text)}>
              {noDeposit
                ? "No deposit required · Balance $12,000"
                : !payment
                  ? "Approval requested"
                  : "Deposit $4,000 · Balance $8,000"}
            </p>
          </div>
        </header>
        <WorkflowProgress
          label="Your estimate progress"
          steps={steps}
          selectedId={selected}
          onSelect={go}
        />
        {blocked ? (
          <Status tone="warning">
            {scenario === "Expired"
              ? "This estimate has expired."
              : "A newer estimate replaces this version."}{" "}
            You can read the saved documents. Contact your cabinetmaker for the
            current estimate before signing or paying.
          </Status>
        ) : complete ? (
          <Status tone="success">
            {noDeposit
              ? "Signed. No deposit is required."
              : payment
                ? "Signed and deposit paid."
                : "Approval complete."}{" "}
            Next: your cabinetmaker confirms your production queue position and
            timing. No queue position or production start is confirmed here.
          </Status>
        ) : preparing ? (
          <Status>
            Your cabinetmaker is preparing the agreement. Review the estimate
            and documents; signing becomes available when it is ready.
          </Status>
        ) : (
          <p role="status" {...stylex.props(styles.text)}>
            {approved
              ? processing
                ? "Your deposit is processing. You do not need to pay again."
                : needsReview
                  ? "Your payment needs review. Contact your cabinetmaker before trying another payment."
                  : "Next: pay the $4,000 deposit."
              : reviewed
                ? "Next: review the terms and approve & sign."
                : "Start by reviewing the scope, total and included documents."}
          </p>
        )}
        <h3 ref={heading} tabIndex={-1} {...stylex.props(styles.heading)}>
          {selected === "review"
            ? "Review your estimate"
            : selected === "approval"
              ? approved
                ? "Your signed agreement"
                : "Approve & sign"
              : selected === "deposit"
                ? "Your deposit"
                : selected === "queue"
                  ? "Production queue"
                  : selected === "final-design"
                    ? "Final design confirmation"
                    : selected === "production"
                      ? "Production"
                      : selected === "final-payment"
                        ? "Final Production Payment Due"
                        : "Delivery"}
        </h3>
        {[
          "queue",
          "final-design",
          "production",
          "final-payment",
          "delivery",
        ].includes(selected) ? (
          <>
            <p {...stylex.props(styles.text)}>
              {selected === "queue"
                ? "After approval and any required deposit, your cabinetmaker confirms your place in the production queue. A paid deposit alone does not confirm a queue position or start date."
                : selected === "final-design"
                  ? "Before production begins, you and your cabinetmaker will confirm the final drawings, dimensions, materials and details. This is a separate confirmation from approving the estimate. Your cabinetmaker will contact you when the final design is ready to review."
                  : selected === "production"
                    ? "Your cabinetmaker will confirm when fabrication begins and provide progress updates. This estimate does not currently track production automatically."
                    : selected === "final-payment"
                      ? "When production is complete, your cabinetmaker will confirm the remaining balance and send the final payment request before delivery. No final payment has been requested in this example."
                      : "Your cabinetmaker will contact you to arrange delivery or installation. This estimate does not currently track delivery automatically."}
            </p>
            <Status>
              Shop updates for this stage are not connected yet. Contact Sample
              Cabinet Shop for confirmed timing.
            </Status>
            <Button
              onPress={() => go(approved && payment ? "deposit" : "review")}
            >
              Back to {approved && payment ? "deposit" : "estimate"}
            </Button>
          </>
        ) : selected === "review" ? (
          <>
            <p {...stylex.props(styles.text)}>
              Custom kitchen cabinetry, installation and hardware as listed in
              the saved estimate. Review the full scope, drawings and finishes
              before continuing.
            </p>
            <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
              <Button
                icon="view"
                onPress={() => setDocument("Itemized estimate")}
              >
                View estimate
              </Button>
              <Button icon="view" onPress={() => setDocument("Design package")}>
                View design package
              </Button>
            </div>
            <InfoTooltip label="Estimate review">
              Continuing records only your place in this example. Viewing a
              document does not approve the estimate or sign an agreement.
            </InfoTooltip>
            <div {...stylex.props(styles.actions)}>
              <p {...stylex.props(styles.text)}>
                Questions? Contact Sample Cabinet Shop.
              </p>
              {!blocked && !preparing && (
                <Button
                  variant="primary"
                  onPress={() => {
                    setReviewed(true);
                    go(approved && payment ? "deposit" : "approval");
                  }}
                >
                  {approved
                    ? payment
                      ? "View deposit"
                      : "View signed agreement"
                    : "Continue to approval"}
                </Button>
              )}
            </div>
          </>
        ) : selected === "approval" ? (
          approved ? (
            <>
              <p {...stylex.props(styles.text)}>
                Approved and signed by Example Customer. The saved signed
                agreement remains available.
              </p>
              <Button
                icon="view"
                onPress={() => setDocument("Signed agreement")}
              >
                View signed agreement
              </Button>
              {payment && (
                <div {...stylex.props(styles.actions)}>
                  <Button onPress={() => go("review")}>Back to estimate</Button>
                  <Button variant="primary" onPress={() => go("deposit")}>
                    {paid || noDeposit
                      ? "View payment status"
                      : "Continue to deposit"}
                  </Button>
                </div>
              )}
            </>
          ) : blocked ? (
            <p {...stylex.props(styles.text)}>
              Signing is unavailable for this version. Ask your cabinetmaker for
              an updated estimate.
            </p>
          ) : preparing ? (
            <p {...stylex.props(styles.text)}>
              The agreement is not ready yet. Your estimate remains available.
            </p>
          ) : (
            <>
              <p {...stylex.props(styles.text)}>
                Approve the saved estimate and design package, review the
                business terms, and sign the agreement. No payment is taken at
                this step.
              </p>
              <Button icon="view" onPress={() => setDocument("Business terms")}>
                Read terms
              </Button>
              <TextInput
                label="Full name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
              <label {...stylex.props(styles.check)}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.currentTarget.checked)}
                />
                I approve the saved estimate and design package.
              </label>
              <label {...stylex.props(styles.check)}>
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.currentTarget.checked)}
                />
                I accept the business terms.
              </label>
              <label {...stylex.props(styles.check)}>
                <input
                  type="checkbox"
                  checked={electronic}
                  onChange={(e) => setElectronic(e.currentTarget.checked)}
                />
                I consent to signing electronically.
              </label>
              <InfoTooltip label="Approval and identity">
                The real flow retains separate design approval, terms acceptance
                and electronic-signature consent, email verification, and a
                final confirmation. This example illustrates their location; it
                is not a replacement signing implementation.
              </InfoTooltip>
              <div {...stylex.props(styles.actions)}>
                <Button onPress={() => go("review")}>Back to estimate</Button>
                <Button
                  variant="primary"
                  isDisabled={!name.trim() || !consent || !terms || !electronic}
                  onPress={() => setConfirm(true)}
                >
                  Review approval
                </Button>
              </div>
            </>
          )
        ) : (
          <>
            {paid || noDeposit ? (
              <p {...stylex.props(styles.text)}>
                {paid
                  ? "Deposit paid: $4,000. Remaining balance: $8,000."
                  : "No deposit is required for this agreement."}{" "}
                Your cabinetmaker will confirm the schedule. This does not mean
                the project balance is paid.
              </p>
            ) : processing ? (
              <Status>
                Your payment is processing. Do not submit another deposit. We
                will show confirmation after the payment provider confirms it.
              </Status>
            ) : needsReview ? (
              <Status tone="warning">
                Your payment needs review. Contact your cabinetmaker. A new
                checkout is unavailable while this is unresolved.
              </Status>
            ) : (
              <>
                <p {...stylex.props(styles.text)}>
                  Deposit due: $4,000. Remaining balance after the deposit:
                  $8,000. Secure checkout offers card and ACH.
                </p>
                {failed && (
                  <Status tone="danger">
                    The last payment failed. No completed deposit has been
                    confirmed. You can try checkout again.
                  </Status>
                )}
                <Button
                  variant="primary"
                  onPress={() => setDocument("Secure checkout handoff")}
                >
                  {scenario === "Checkout open"
                    ? "Resume secure checkout"
                    : failed
                      ? "Try deposit payment again"
                      : "Continue to secure checkout"}
                </Button>
              </>
            )}
            <div {...stylex.props(styles.actions)}>
              <Button onPress={() => go("approval")}>
                View signed agreement
              </Button>
              {!paid && !noDeposit && (
                <Button onPress={() => setDocument("Refresh payment status")}>
                  Refresh payment status
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      <div {...stylex.props(styles.review)}>
        <Select
          label="Review scenario"
          value={scenario}
          onChange={(e) => {
            const value = e.currentTarget.value as Scenario;
            setScenario(value);
            setReviewed(false);
            setSigned(false);
            setConsent(false);
            setTerms(false);
            setElectronic(false);
            setName("");
            setSelected(
              [
                "Approved · deposit due",
                "Checkout open",
                "Payment processing",
                "Deposit paid",
                "No deposit required",
                "Payment failed",
                "Payment needs review",
              ].includes(value)
                ? "deposit"
                : "review",
            );
          }}
        >
          {scenarios.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <InfoTooltip label="Scenario controls">
          Catalog-only states, not actual customer controls. Completion and
          payment eligibility must come from the application server. Review
          progress must be scoped to the estimate revision.
        </InfoTooltip>
      </div>
      <Dialog
        title="Confirm example approval"
        open={confirm}
        onOpenChange={setConfirm}
        footer={
          <>
            <Button onPress={() => setConfirm(false)}>Back</Button>
            <Button
              variant="primary"
              onPress={() => {
                setSigned(true);
                setReviewed(true);
                setConfirm(false);
                go(payment ? "deposit" : "approval");
              }}
            >
              Simulate signature
            </Button>
          </>
        }
      >
        <p {...stylex.props(styles.text)}>
          This does not create a legal signature. The actual app must retain its
          full confirmation, consent and identity verification flow.
        </p>
      </Dialog>
      <Dialog
        title={document || "Document"}
        open={!!document}
        onOpenChange={(open) => {
          if (!open) setDocument("");
        }}
        footer={<Button onPress={() => setDocument("")}>Close</Button>}
      >
        <p {...stylex.props(styles.text)}>
          {document === "Secure checkout handoff"
            ? "The actual app opens the existing secure checkout. Closing checkout does not mark a deposit paid. Return to this estimate to see server-confirmed status."
            : document === "Refresh payment status"
              ? "The actual app requests the latest server status. A click or checkout return alone never completes the payment step."
              : "Document preview placeholder. The actual app must show its complete saved document, with download access, rather than this summary."}
        </p>
      </Dialog>
    </div>
  );
}
