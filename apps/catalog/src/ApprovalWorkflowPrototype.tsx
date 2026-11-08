import { useEffect, useRef, useState } from "react";
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
import { color, metrics } from "@from-trees/ui/tokens.stylex";

type Customer = { id: string; name: string; email: string };
type DocumentFile = { name: string; type: string; size: number };
type Draft = {
  title: string;
  customer: Customer;
  designs: string[];
  packages: string[];
  files?: DocumentFile[];
  instructions: string;
  step: number;
  finalized: boolean;
  sent: boolean;
};
const customers: Customer[] = [
  {
    id: "demo",
    name: "Vanity Demo Customer",
    email: "vanity-demo@example.test",
  },
];
const designs = ["Natural oak vanity", "Walnut vanity", "Painted sage vanity"];
const labels = [
  "Start approval",
  "Connect designs",
  "Generate customer packages",
  "Finalize approval request",
  "Send to customer",
];
const storageKey = "from-trees:catalog:approval-workflow:v1";
function readDraft(): Draft | null {
  try {
    return JSON.parse(
      localStorage.getItem(storageKey) ?? "null",
    ) as Draft | null;
  } catch {
    return null;
  }
}
const styles = stylex.create({
  content: {
    width: "100%",
    maxWidth: 1040,
    marginInline: "auto",
    boxSizing: "border-box",
    paddingBlock: 12,
  },
  body: { width: "100%", maxWidth: 720, marginInline: "auto", marginTop: 36 },
  heading: { fontSize: 20, fontWeight: 650, lineHeight: 1.4, margin: 0 },
  copy: {
    color: color.muted,
    fontSize: metrics.font,
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
  },
});

/** Catalog-only composition. Cabinitron owns real customer records, packages, drafts and delivery. */
export function ApprovalWorkflowPrototype() {
  const [draft, setDraft] = useState<Draft | null>(readDraft);
  const [open, setOpen] = useState(false),
    [step, setStep] = useState(0),
    [started, setStarted] = useState(false);
  const [title, setTitle] = useState(""),
    [customer, setCustomer] = useState<Customer | null>(null);
  const [linked, setLinked] = useState<string[]>([]),
    [packages, setPackages] = useState<string[]>([]);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [instructions, setInstructions] = useState(""),
    [finalized, setFinalized] = useState(false),
    [sent, setSent] = useState(false);
  const [error, setError] = useState(""),
    [newCustomer, setNewCustomer] = useState(false),
    [newName, setNewName] = useState(""),
    [newEmail, setNewEmail] = useState("");
  const [extraCustomers, setExtraCustomers] = useState<Customer[]>([]),
    [confirm, setConfirm] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (open) heading.current?.focus();
  }, [open, step]);
  const choices = [
    ...customers,
    ...extraCustomers,
    ...(customer &&
    ![...customers, ...extraCustomers].some((c) => c.id === customer.id)
      ? [customer]
      : []),
  ];
  const customerReady = !!title.trim() && !!customer?.email;
  const designsReady =
    linked.length > 0 || files.some((file) => file.type === "application/pdf");
  const packagesReady =
    designsReady && linked.every((name) => packages.includes(name));
  const canReach = (index: number) =>
    index === 2 && !linked.length
      ? false
      : index === 0 ||
        (customerReady &&
          started &&
          (index === 1 ||
            (designsReady &&
              (index === 2 || (packagesReady && (index === 3 || finalized))))));
  const firstIncomplete =
    !customerReady || !started
      ? 0
      : !designsReady
        ? 1
        : !packagesReady
          ? 2
          : !finalized
            ? 3
            : 4;
  const progress: WorkflowStep[] = labels.map((label, index) => ({
    id: String(index),
    label,
    available: canReach(index),
    detail:
      index === 2 && !linked.length && started
        ? "Not needed — no connected designs"
        : undefined,
    status:
      sent || index < firstIncomplete
        ? "complete"
        : index === firstIncomplete
          ? "current"
          : "upcoming",
  }));
  const save = (changes: Partial<Draft> = {}) => {
    if (!customer) return;
    const next = {
      title,
      customer,
      designs: linked,
      packages,
      files,
      instructions,
      step,
      finalized,
      sent,
      ...changes,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setDraft(next);
      setStarted(true);
      setError("");
    } catch {
      setError(
        "The example draft could not be saved. Please retry before closing.",
      );
    }
  };
  const move = (next: number) => {
    if (!canReach(next)) return;
    save({ step: next });
    setStep(next);
  };
  const begin = (resume: boolean) => {
    const d = resume ? draft : null;
    setStarted(!!d);
    setTitle(d?.title ?? "");
    setCustomer(d?.customer ?? null);
    setLinked(d?.designs ?? []);
    setPackages(d?.packages ?? []);
    setFiles(d?.files ?? []);
    setInstructions(d?.instructions ?? "");
    setStep(d?.step ?? 0);
    setFinalized(d?.finalized ?? false);
    setSent(d?.sent ?? false);
    setError("");
    setOpen(true);
  };
  return (
    <div {...stylex.props(layout.stack, gap.lg)}>
      <p {...stylex.props(styles.copy)}>
        Interactive example with synthetic customer records and packages. Drafts
        stay in this browser; this example sends no email.
      </p>
      <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
        <Button variant="primary" onPress={() => begin(false)}>
          Create new approval
        </Button>
        {draft && (
          <Button onPress={() => begin(true)}>Resume {draft.title}</Button>
        )}
      </div>
      {draft && (
        <Status>
          {draft.sent
            ? "Example sent"
            : draft.finalized
              ? "Ready to send"
              : "Draft saved"}{" "}
          · {draft.title} · Step {draft.step + 1} of 5
        </Status>
      )}
      <Dialog
        size="fullscreen"
        title={started && open && title ? title : "New design approval"}
        description={
          started && customer
            ? "Draft saved. You can close and resume this approval later."
            : "Start an approval, connect designs and prepare the customer request."
        }
        open={open}
        onOpenChange={(value) => {
          if (!value && started && customer) save();
          setOpen(value);
        }}
        footer={
          <>
            {step > 0 && (
              <Button
                onPress={() =>
                  move(step === 3 && !linked.length ? 1 : step - 1)
                }
              >
                Back
              </Button>
            )}
            {step === 0 ? (
              <Button
                variant="primary"
                isDisabled={!customerReady}
                onPress={() => {
                  save({ step: 1 });
                  setStep(1);
                }}
              >
                Save and continue
              </Button>
            ) : step === 1 ? (
              <Button
                variant="primary"
                isDisabled={!designsReady}
                onPress={() => move(linked.length ? 2 : 3)}
              >
                {linked.length
                  ? "Continue to packages"
                  : "Continue to final review"}
              </Button>
            ) : step === 2 ? (
              <Button
                variant="primary"
                isDisabled={!packagesReady}
                onPress={() => move(3)}
              >
                Continue to final review
              </Button>
            ) : step === 3 ? (
              <Button
                variant="primary"
                isDisabled={!packagesReady}
                onPress={() => {
                  save({ step: 4, finalized: true });
                  setFinalized(true);
                  setStep(4);
                }}
              >
                Save approval request
              </Button>
            ) : (
              <Button
                variant="primary"
                isDisabled={!finalized || sent}
                onPress={() => setConfirm(true)}
              >
                {sent ? "Sent to customer" : "Send to customer"}
              </Button>
            )}
          </>
        }
      >
        <div {...stylex.props(styles.content)}>
          <WorkflowProgress
            label="Approval workflow"
            steps={progress}
            selectedId={String(step)}
            onSelect={(id) => move(Number(id))}
          />
          <section
            {...stylex.props(styles.body, layout.stack, gap.lg)}
            aria-label={labels[step]}
          >
            <h2 ref={heading} tabIndex={-1} {...stylex.props(styles.heading)}>
              {labels[step]}
            </h2>
            {error && <Status tone="danger">{error}</Status>}
            {step === 0 && (
              <>
                <TextInput
                  label="Approval name"
                  value={title}
                  required
                  readOnly={finalized}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (started) save({ title: e.target.value });
                  }}
                />
                <Select
                  label="Customer"
                  value={customer?.id ?? ""}
                  disabled={finalized}
                  onChange={(e) => {
                    const c =
                      choices.find((c) => c.id === e.target.value) ?? null;
                    setCustomer(c);
                    if (started && c) save({ customer: c });
                  }}
                >
                  <option value="">Choose a customer</option>
                  {choices.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name} · {c.email}
                    </option>
                  ))}
                </Select>
                <div {...stylex.props(layout.row)}>
                  <Button
                    isDisabled={finalized}
                    onPress={() => {
                      setNewName("");
                      setNewEmail("");
                      setNewCustomer(true);
                    }}
                  >
                    Create customer
                  </Button>
                </div>
                <p {...stylex.props(styles.copy)}>
                  Completing this step saves the approval as a draft. Close the
                  dialog at any time after that and resume later.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <div {...stylex.props(layout.row, layout.alignCenter, gap.sm)}>
                  <p {...stylex.props(styles.copy)}>
                    Connect Cabinitron designs, upload other design documents,
                    or use both.
                  </p>
                  <InfoTooltip label="linked design versions">
                    Each design uses its latest saved version. Its version and
                    matching customer package are locked when the request is
                    finalized.
                  </InfoTooltip>
                </div>
                <Select
                  label="Add Cabinitron design"
                  value=""
                  disabled={finalized}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const next = [...linked, e.target.value];
                    setLinked(next);
                    save({ designs: next });
                  }}
                >
                  <option value="">Select a design</option>
                  {designs
                    .filter((name) => !linked.includes(name))
                    .map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                </Select>
                {linked.map((name) => (
                  <div
                    key={name}
                    {...stylex.props(
                      layout.row,
                      layout.between,
                      layout.alignCenter,
                      gap.md,
                      padding.md,
                      styles.card,
                    )}
                  >
                    <strong>{name}</strong>
                    <Button
                      icon="close"
                      aria-label={`Remove ${name}`}
                      isDisabled={finalized}
                      onPress={() => {
                        const next = linked.filter((n) => n !== name);
                        setLinked(next);
                        const nextPackages = packages.filter((n) => n !== name);
                        setPackages(nextPackages);
                        save({ designs: next, packages: nextPackages });
                      }}
                    />
                  </div>
                ))}
                <div {...stylex.props(layout.row, gap.sm, layout.alignCenter)}>
                  <label htmlFor="approval-example-files">
                    Other design documents
                  </label>
                  <InfoTooltip label="design document limits">
                    PDF, PNG or JPEG. Packages and uploads share a limit of 10
                    files and 20 MB combined. Include a PDF when no Cabinitron
                    designs are connected. This example retains file names only;
                    Cabinitron will store uploaded files securely.
                  </InfoTooltip>
                </div>
                <input
                  id="approval-example-files"
                  type="file"
                  multiple
                  accept="application/pdf,image/png,image/jpeg"
                  disabled={finalized}
                  onChange={(e) => {
                    const added = Array.from(e.target.files ?? []).map(
                      ({ name, type, size }) => ({ name, type, size }),
                    );
                    e.target.value = "";
                    const next = [...files, ...added];
                    if (
                      added.some(
                        (file) =>
                          ![
                            "application/pdf",
                            "image/png",
                            "image/jpeg",
                          ].includes(file.type),
                      ) ||
                      next.length + linked.length > 10 ||
                      next.reduce((sum, file) => sum + file.size, 0) >
                        20 * 1024 * 1024
                    ) {
                      setError(
                        "Use PDF, PNG or JPEG files within the file and size limits.",
                      );
                      return;
                    }
                    setFiles(next);
                    save({ files: next });
                  }}
                />
                {files.map((file, i) => (
                  <div
                    key={i}
                    {...stylex.props(
                      layout.row,
                      layout.between,
                      layout.alignCenter,
                      gap.sm,
                    )}
                  >
                    <span>{file.name}</span>
                    <Button
                      icon="close"
                      aria-label={`Remove ${file.name}`}
                      isDisabled={finalized}
                      onPress={() => {
                        const next = files.filter((_, index) => index !== i);
                        setFiles(next);
                        save({ files: next });
                      }}
                    />
                  </div>
                ))}
                {!linked.length && (
                  <p {...stylex.props(styles.copy)}>
                    Cabinitron designs are optional. Upload a design PDF to
                    continue; customer package generation will be skipped.
                  </p>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <p {...stylex.props(styles.copy)}>
                  Every connected design needs a customer package before you can
                  continue.
                </p>
                {linked.map((name) => (
                  <div
                    key={name}
                    {...stylex.props(
                      layout.stack,
                      gap.md,
                      padding.md,
                      styles.card,
                    )}
                  >
                    <strong>{name}</strong>
                    {packages.includes(name) ? (
                      <Status tone="success">Customer package ready</Status>
                    ) : (
                      <div {...stylex.props(layout.row)}>
                        <Button
                          onPress={() => {
                            const next = [...packages, name];
                            setPackages(next);
                            save({ packages: next });
                          }}
                        >
                          Generate customer package
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            {step === 3 && (
              <>
                <div {...stylex.props(layout.stack, gap.sm)}>
                  <strong>{title}</strong>
                  <p {...stylex.props(styles.copy)}>
                    {customer?.name} · {customer?.email}
                  </p>
                </div>
                <ul>
                  {files.map((file, i) => (
                    <li key={`file-${i}`}>{file.name}</li>
                  ))}
                  {linked.map((name) => (
                    <li key={name}>{name} · customer package ready</li>
                  ))}
                </ul>
                <TextInput
                  label="Review instructions"
                  value={instructions}
                  readOnly={finalized}
                  onChange={(e) => {
                    setInstructions(e.target.value);
                    save({ instructions: e.target.value });
                  }}
                />
                <p {...stylex.props(styles.copy)}>
                  Saving the request locks these design versions and customer
                  packages for review.
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <Status tone={sent ? "success" : "neutral"}>
                  {sent
                    ? "Example approval sent. No email was delivered."
                    : "Approval request saved and ready to send."}
                </Status>
                <p {...stylex.props(styles.copy)}>
                  Send to {customer?.name} · {customer?.email}
                </p>
                <ul>
                  {files.map((file, i) => (
                    <li key={`file-${i}`}>{file.name}</li>
                  ))}
                  {linked.map((name) => (
                    <li key={name}>{name} · customer package.pdf</li>
                  ))}
                </ul>
                <p {...stylex.props(styles.copy)}>
                  The customer receives the design links and packages in one
                  approval request.
                </p>
              </>
            )}
          </section>
        </div>
      </Dialog>
      <Dialog
        title="Create customer"
        open={newCustomer}
        onOpenChange={setNewCustomer}
        footer={
          <Button
            variant="primary"
            isDisabled={
              !newName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
            }
            onPress={() => {
              const c = {
                id: crypto.randomUUID(),
                name: newName.trim(),
                email: newEmail.trim(),
              };
              setExtraCustomers([...extraCustomers, c]);
              setCustomer(c);
              if (started) save({ customer: c });
              setNewCustomer(false);
            }}
          >
            Save customer
          </Button>
        }
      >
        <div {...stylex.props(layout.stack, gap.md)}>
          <TextInput
            label="Customer name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextInput
            label="Customer email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>
      </Dialog>
      <Dialog
        title="Send approval to customer"
        description={`Send the example approval to ${customer?.email ?? ""}?`}
        open={confirm}
        onOpenChange={setConfirm}
        footer={
          <Button
            variant="primary"
            onPress={() => {
              setSent(true);
              save({ sent: true });
              setConfirm(false);
            }}
          >
            Send approval
          </Button>
        }
      >
        <p {...stylex.props(styles.copy)}>
          Catalog demonstration only. No message will be sent.
        </p>
      </Dialog>
    </div>
  );
}
