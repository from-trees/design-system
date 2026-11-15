import { useState } from "react";
import {
  Button,
  Panel,
  SegmentedControl,
  SendEmailDialog,
  Status,
  Switch,
  type EmailDraft,
} from "@from-trees/ui";
import { layout, gap } from "@from-trees/ui/utilities";
import * as stylex from "@stylexjs/stylex";
const examples = {
  estimate: {
    label: "Estimate",
    subject: "Estimate EST-000007 · Kitchen cabinetry",
    message: "Please review your estimate using the secure link below.",
    summary: "EST-000007 · $13,746.56",
    notice:
      "Includes the secure estimate link. Saved prices and documents stay unchanged.",
  },
  approval: {
    label: "Design approval",
    subject: "Design approval · Kitchen cabinetry",
    message: "Please review and sign the saved design approval.",
    summary: "Kitchen cabinetry · Revision 3",
    notice:
      "Approval instructions and signature verification remain separate from this message. Verification codes go only to the customer.",
  },
  invoice: {
    label: "Invoice",
    subject: "Invoice INV-000003 · Progress payment",
    message:
      "Your invoice is ready to review and pay using the secure link below.",
    summary: "INV-000003 · $4,000.00 due",
    notice:
      "The app issues the saved invoice and PDF before sending. Sending an email does not charge the customer.",
  },
};
type Kind = keyof typeof examples;
const initial = (kind: Kind): EmailDraft => ({
  cc: ["owner@example.test"],
  subject: examples[kind].subject,
  message: examples[kind].message,
});
export function EmailDeliveryPrototype() {
  const [kind, setKind] = useState<Kind>("estimate");
  const [draft, setDraft] = useState(() => initial("estimate"));
  const [open, setOpen] = useState(false),
    [fail, setFail] = useState(false);
  const [sent, setSent] = useState<{ kind: Kind; draft: EmailDraft }>();
  const example = examples[kind];
  return (
    <div {...stylex.props(layout.stack, gap.lg)}>
      <h2>Send email</h2>
      <p>
        One shared dialog for estimates, design approvals and invoices. Edit Cc,
        subject and message, then send. This catalog uses sample data and sends
        no email.
      </p>
      <SegmentedControl
        label="Document type"
        value={kind}
        options={Object.entries(examples).map(([value, e]) => ({
          value,
          label: e.label,
        }))}
        onChange={(value) => {
          setKind(value as Kind);
          setDraft(initial(value as Kind));
        }}
      />
      <Panel title={example.label}>
        <div {...stylex.props(layout.stack, gap.md)}>
          <p>{example.summary}</p>
          <Switch
            label="Simulate send failure"
            selected={fail}
            onChange={setFail}
          />
          <Button
            variant="primary"
            onPress={() => {
              setDraft(initial(kind));
              setOpen(true);
            }}
          >
            Compose email
          </Button>
        </div>
      </Panel>
      {sent && (
        <Status>
          Email simulated for {examples[sent.kind].label.toLowerCase()}. Cc:{" "}
          {sent.draft.cc.join(", ") || "None"}. Subject: {sent.draft.subject}
        </Status>
      )}
      <SendEmailDialog
        open={open}
        onOpenChange={setOpen}
        title={`Send ${example.label.toLowerCase()}`}
        to={["customer@example.test"]}
        replyTo="owner@example.test"
        value={draft}
        onChange={setDraft}
        summary={<strong>{example.summary}</strong>}
        notice={<p>{example.notice}</p>}
        onSend={async (next) => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          if (fail) throw new Error("Synthetic provider details");
          setSent({ kind, draft: next });
        }}
      />
    </div>
  );
}
