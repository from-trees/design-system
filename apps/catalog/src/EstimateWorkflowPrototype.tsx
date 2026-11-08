import { useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Button,
  Dialog,
  DocumentChoiceGroup,
  DocumentSection,
  IconButton,
  InfoTooltip,
  Select,
  SidePanel,
  Status,
  TextInput,
  WorkflowProgress,
  type WorkflowStep,
} from "@from-trees/ui";
import { layout, gap, padding } from "@from-trees/ui/utilities";
import { color } from "@from-trees/ui/tokens.stylex";

type Row = {
  id: string;
  description: string;
  quantity: string;
  rate: string;
  taxable: boolean;
};
type Group = {
  plain?: boolean;
  id: string;
  title: string;
  description: string;
  rows: Row[];
  design?: { name: string; revision: number; packageRevision?: number };
};
type Block =
  | Group
  | {
      id: string;
      kind: "choice";
      title: string;
      description: string;
      options: Group[];
    };
type Customer = { id: string; name: string; email: string };
type Draft = {
  title: string;
  customer: Customer | null;
  expiration: string;
  blocks: Block[];
  tax: string;
  files: { name: string; type: string }[];
  terms: string;
  step: number;
  finalized: boolean;
  sent: boolean;
};
const key = "from-trees:catalog:estimate-workflow:v1";
const labels = [
  "Start estimate",
  "Add line items",
  "Prepare documents",
  "Set T&C",
  "Review and finalize",
  "Send to customer",
];
const demoCustomer = {
  id: "demo",
  name: "Vanity Demo Customer",
  email: "vanity-demo@example.test",
};
const designs = ["Vanity — Design A", "Vanity — Design B", "Vanity — Design C"];
const uid = () => crypto.randomUUID();
const row = (): Row => ({
  id: uid(),
  description: "",
  quantity: "1",
  rate: "0.00",
  taxable: true,
});
const group = (title = "Items"): Group => ({
  id: uid(),
  title,
  description: "",
  rows: [],
});
const initial = (): Draft => ({
  title: "",
  customer: null,
  expiration: "",
  blocks: [{ ...group(), plain: true }],
  tax: "0",
  files: [],
  terms:
    "Cabinetry will be supplied as described in this estimate. Changes to scope require an approved revision.",
  step: 0,
  finalized: false,
  sent: false,
});
const isChoice = (b: Block): b is Extract<Block, { kind: "choice" }> =>
  "kind" in b;
const groups = (d: Draft) =>
  d.blocks.flatMap((b) => (isChoice(b) ? b.options : [b]));
const money = (n: number) =>
  Number.isFinite(n)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(n / 100)
    : "—";
const net = (r: Row) => Math.round(Number(r.quantity) * Number(r.rate) * 100);
const subtotal = (g: Group) => g.rows.reduce((n, r) => n + net(r), 0);
const total = (g: Group, tax: string) =>
  g.rows.reduce(
    (n, r) =>
      n + net(r) + (r.taxable ? Math.round((net(r) * Number(tax)) / 100) : 0),
    0,
  );
const range = (
  d: Draft,
  value: (g: Group) => number = (g) => total(g, d.tax),
): [number, number] =>
  d.blocks.reduce<[number, number]>(
    (sum, b) => {
      const amounts = isChoice(b)
        ? b.options.length
          ? b.options.map(value)
          : [0]
        : [value(b)];
      return [sum[0] + Math.min(...amounts), sum[1] + Math.max(...amounts)];
    },
    [0, 0],
  );
function read(): Draft | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") as Draft | null;
  } catch {
    return null;
  }
}
const s = stylex.create({
  heading: { margin: 0, fontSize: 18, lineHeight: 1.4, outline: "none" },
  copy: {
    margin: 0,
    color: color.muted,
    fontSize: 13,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },
  field: { minWidth: 120 },
  qty: { width: 52 },
  rate: { width: 76 },
  area: {
    width: "100%",
    minHeight: 150,
    boxSizing: "border-box",
    padding: 12,
    font: "inherit",
    color: color.ink,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 8,
  },
  card: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 8,
    minWidth: 0,
  },
});

/** Interactive catalog composition. All customers, prices, designs and delivery are synthetic. */
export function EstimateWorkflowPrototype() {
  const [draft, setDraft] = useState<Draft>(initial),
    [stored, setStored] = useState<Draft | null>(read),
    [open, setOpen] = useState(false),
    [started, setStarted] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false),
    [address, setAddress] = useState({ street: "", city: "", zip: "" }),
    [found, setFound] = useState(false);
  const [packageId, setPackageId] = useState<string | null>(null),
    [confirm, setConfirm] = useState(false),
    [newCustomer, setNewCustomer] = useState(false),
    [customerName, setCustomerName] = useState(""),
    [customerEmail, setCustomerEmail] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (started) {
      localStorage.setItem(key, JSON.stringify(draft));
      setStored(draft);
    }
  }, [draft, started]);
  useEffect(() => {
    if (open) heading.current?.focus({ preventScroll: true });
  }, [open, draft.step]);
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  const mapGroups = (fn: (g: Group) => Group) =>
    patch({
      blocks: draft.blocks.map((b) =>
        isChoice(b) ? { ...b, options: b.options.map(fn) } : fn(b),
      ),
    });
  const updateGroup = (id: string, p: Partial<Group>) =>
    mapGroups((g) => (g.id === id ? { ...g, ...p } : g));
  const updateRow = (g: Group, id: string, p: Partial<Row>) =>
    updateGroup(g.id, {
      rows: g.rows.map((r) => (r.id === id ? { ...r, ...p } : r)),
    });
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const startReady =
    !!draft.title.trim() &&
    !!draft.customer?.email &&
    draft.expiration >= todayString;
  const rowsReady = (g: Group) =>
    g.rows.length > 0 &&
    !!g.title.trim() &&
    g.rows.every(
      (r) =>
        !!r.description.trim() &&
        r.quantity.trim() !== "" &&
        Number.isFinite(Number(r.quantity)) &&
        Number(r.quantity) > 0 &&
        r.rate.trim() !== "" &&
        Number.isFinite(Number(r.rate)) &&
        Number(r.rate) >= 0,
    );
  const active = groups(draft).filter((g) => g.rows.length > 0);
  const itemsReady =
    active.length > 0 &&
    active.every(rowsReady) &&
    draft.blocks.every(
      (b) =>
        !isChoice(b) ||
        (!!b.title.trim() &&
          b.options.length >= 2 &&
          b.options.every(rowsReady)),
    ) &&
    draft.tax.trim() !== "" &&
    Number.isFinite(Number(draft.tax)) &&
    Number(draft.tax) >= 0 &&
    Number(draft.tax) <= 100;
  const docsReady = groups(draft).every(
    (g) => !g.design || g.design.packageRevision === g.design.revision,
  );
  const termsReady = !!draft.terms.trim();
  const ready = [
    startReady,
    itemsReady,
    docsReady,
    termsReady,
    draft.finalized,
    draft.sent,
  ];
  const canReach = (i: number) =>
    i === 0 || (started && ready.slice(0, i).every(Boolean));
  const firstIncomplete = ready.findIndex((v) => !v);
  const steps: WorkflowStep[] = labels.map((label, i) => ({
    id: String(i),
    label,
    status: ready.slice(0, i + 1).every(Boolean)
      ? "complete"
      : i === firstIncomplete
        ? "current"
        : "upcoming",
    available: canReach(i),
  }));
  const go = (step: number) => {
    if (canReach(step)) patch({ step });
  };
  const locked = draft.finalized;
  const addDesign = (name: string, choiceId?: string) => {
    const g: Group = {
      ...group(name),
      design: { name, revision: 7 },
      rows: [
        { ...row(), description: "Vanity cabinet", rate: "2100.00" },
        { ...row(), description: "Drawer fronts and hardware", rate: "320.00" },
      ],
    };
    patch({
      blocks: choiceId
        ? draft.blocks.map((b) =>
            isChoice(b) && b.id === choiceId
              ? { ...b, options: [...b.options, g] }
              : b,
          )
        : [...draft.blocks, g],
    });
  };
  const refresh = (g: Group) =>
    updateGroup(g.id, {
      design: { name: g.design!.name, revision: g.design!.revision + 1 },
      rows: g.rows.map((r, i) => ({
        ...r,
        rate: i === 0 ? (Number(r.rate) + 50).toFixed(2) : r.rate,
      })),
    });
  const removeGroup = (id: string) =>
    patch({
      blocks: draft.blocks
        .filter((b) => b.id !== id)
        .map((b) =>
          isChoice(b)
            ? { ...b, options: b.options.filter((g) => g.id !== id) }
            : b,
        ),
    });
  const [low, high] = range(draft);
  const amount = (g: Group) => ({
    net: subtotal(g),
    tax: total(g, draft.tax) - subtotal(g),
  });
  const renderGroup = (g: Group, review = false) => {
    const sums = amount(g);
    return (
      <div key={g.id} {...stylex.props(layout.stack, gap.sm)}>
        <DocumentSection
          title={g.title || "Untitled section"}
          onTitleChange={
            !review && !g.design
              ? (title) => updateGroup(g.id, { title })
              : undefined
          }
          onDescriptionChange={
            !review && !g.design
              ? (description) => updateGroup(g.id, { description })
              : undefined
          }
          editingDisabled={locked}
          footerActions={
            !review && !g.design ? (
              <Button
                isDisabled={locked}
                onPress={() => updateGroup(g.id, { rows: [...g.rows, row()] })}
              >
                Add item to {g.title || "section"}
              </Button>
            ) : undefined
          }
          description={
            g.design
              ? [
                  g.description,
                  `Saved design · revision ${g.design.revision} · items are read-only`,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : g.description
          }
          headerActions={
            !review ? (
              <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
                {g.design && (
                  <IconButton
                    label="Update to latest revision"
                    icon="rotation"
                    isDisabled={locked}
                    onPress={() => refresh(g)}
                  />
                )}
                <IconButton
                  label={g.design ? "Remove design" : "Remove section"}
                  icon="delete"
                  isDisabled={locked}
                  onPress={() => removeGroup(g.id)}
                />
              </div>
            ) : undefined
          }
          columns={[
            { id: "item", label: "Item" },
            { id: "qty", label: "Qty", numeric: true },
            { id: "rate", label: "Rate", numeric: true },
            { id: "amount", label: "Amount", numeric: true },
          ]}
          rows={g.rows.map((r, i) => ({
            id: r.id,
            cells:
              review || g.design
                ? [
                    <div
                      {...stylex.props(layout.stack, gap.xs)}
                      key="description"
                    >
                      {r.description}
                      <span {...stylex.props(s.copy)}>
                        {r.taxable ? "Taxable" : "Tax exempt"}
                      </span>
                    </div>,
                    r.quantity,
                    money(Math.round(Number(r.rate) * 100)),
                    money(net(r)),
                  ]
                : [
                    <div
                      {...stylex.props(s.field, layout.stack, gap.sm)}
                      key="item"
                    >
                      <TextInput
                        aria-label={`Item ${i + 1} description in ${g.title}`}
                        size={1}
                        value={r.description}
                        disabled={locked}
                        onChange={(e) =>
                          updateRow(g, r.id, { description: e.target.value })
                        }
                      />
                      <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
                        <label>
                          <input
                            type="checkbox"
                            aria-label={`Taxable item ${i + 1} in ${g.title}`}
                            checked={r.taxable}
                            disabled={locked}
                            onChange={(e) =>
                              updateRow(g, r.id, { taxable: e.target.checked })
                            }
                          />{" "}
                          Taxable
                        </label>
                        <IconButton
                          label={`Remove item ${i + 1} from ${g.title}`}
                          icon="delete"
                          isDisabled={locked}
                          onPress={() =>
                            updateGroup(g.id, {
                              rows: g.rows.filter((x) => x.id !== r.id),
                            })
                          }
                        />
                      </div>
                    </div>,
                    <div {...stylex.props(s.qty)} key="qty">
                      <TextInput
                        aria-label={`Quantity item ${i + 1} in ${g.title}`}
                        size={1}
                        inputMode="decimal"
                        value={r.quantity}
                        disabled={locked}
                        onChange={(e) =>
                          updateRow(g, r.id, { quantity: e.target.value })
                        }
                        onBlur={() => {
                          if (Number(r.quantity) > 0)
                            updateRow(g, r.id, {
                              quantity: String(
                                Number(Number(r.quantity).toFixed(3)),
                              ),
                            });
                        }}
                      />
                    </div>,
                    <div {...stylex.props(s.rate)} key="rate">
                      <TextInput
                        aria-label={`Rate item ${i + 1} in ${g.title}`}
                        size={1}
                        inputMode="decimal"
                        value={r.rate}
                        disabled={locked}
                        onChange={(e) =>
                          updateRow(g, r.id, { rate: e.target.value })
                        }
                        onBlur={() => {
                          if (r.rate.trim() && Number(r.rate) >= 0)
                            updateRow(g, r.id, {
                              rate: Number(r.rate).toFixed(2),
                            });
                        }}
                      />
                    </div>,
                    money(net(r)),
                  ],
          }))}
          totals={[
            {
              id: "subtotal",
              label: "Section subtotal",
              value: money(sums.net),
            },
            { id: "tax", label: "Sales tax", value: money(sums.tax) },
            {
              id: "total",
              label: "Section total",
              value: money(sums.net + sums.tax),
              emphasis: true,
            },
          ]}
        />
      </div>
    );
  };
  const renderBlocks = (review = false) =>
    draft.blocks
      .filter((b) => !review || isChoice(b) || b.rows.length)
      .map((b) =>
        isChoice(b) ? (
          <div
            key={b.id}
            {...stylex.props(layout.stack, gap.md, s.card, padding.md)}
          >
            <DocumentChoiceGroup
              title={b.title || "Choice"}
              description={b.description}
              disabled={locked}
              onTitleChange={
                !review
                  ? (title) =>
                      patch({
                        blocks: draft.blocks.map((x) =>
                          x.id === b.id ? { ...b, title } : x,
                        ),
                      })
                  : undefined
              }
              onDescriptionChange={
                !review
                  ? (description) =>
                      patch({
                        blocks: draft.blocks.map((x) =>
                          x.id === b.id ? { ...b, description } : x,
                        ),
                      })
                  : undefined
              }
            >
              {b.options.map((g) => renderGroup(g, review))}
            </DocumentChoiceGroup>
            {!review && (
              <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
                <Button
                  isDisabled={locked}
                  onPress={() =>
                    patch({
                      blocks: draft.blocks.map((x) =>
                        x.id === b.id
                          ? {
                              ...b,
                              options: [
                                ...b.options,
                                {
                                  ...group(`Option ${b.options.length + 1}`),
                                  rows: [row()],
                                },
                              ],
                            }
                          : x,
                      ),
                    })
                  }
                >
                  Add item option
                </Button>
                <Select
                  aria-label={`Add design option to ${b.title}`}
                  value=""
                  disabled={locked}
                  onChange={(e) => addDesign(e.target.value, b.id)}
                >
                  <option value="">Add design option</option>
                  {designs.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </Select>
                <Button
                  variant="ghost"
                  isDisabled={locked}
                  onPress={() =>
                    patch({ blocks: draft.blocks.filter((x) => x.id !== b.id) })
                  }
                >
                  Remove choice
                </Button>
              </div>
            )}
          </div>
        ) : (
          renderGroup(b, review)
        ),
      );
  const formattedRange = ([min, max]: [number, number]) =>
    min === max ? money(min) : `${money(min)}–${money(max)}`;
  const renderSummary = (editable: boolean) => (
    <section
      aria-label="Estimate summary"
      {...stylex.props(s.card, padding.md, layout.stack, gap.md)}
    >
      <div {...stylex.props(layout.row, layout.between, gap.sm)}>
        <span>Subtotal</span>
        <strong>{formattedRange(range(draft, subtotal))}</strong>
      </div>
      <div
        {...stylex.props(
          layout.row,
          layout.wrap,
          layout.between,
          layout.alignCenter,
          gap.sm,
        )}
      >
        {editable ? (
          <div
            {...stylex.props(
              layout.row,
              layout.wrap,
              layout.alignCenter,
              gap.sm,
            )}
          >
            <TextInput
              label="Tax rate (%)"
              inputMode="decimal"
              value={draft.tax}
              disabled={locked}
              onChange={(e) => patch({ tax: e.target.value })}
            />
            <Button
              isDisabled={locked}
              onPress={() => {
                setFound(false);
                setTaxOpen(true);
              }}
            >
              Look up tax rate
            </Button>
            <InfoTooltip label="tax rate">
              One rate from zero to one hundred percent applies to taxable rows.
              California lookup returns a sample rate in this catalog; applying
              it requires Update tax rate.
            </InfoTooltip>
          </div>
        ) : (
          <span>Sales tax ({draft.tax}%)</span>
        )}
        <strong aria-label="Estimate tax amount">
          {formattedRange(
            range(draft, (g) => total(g, draft.tax) - subtotal(g)),
          )}
        </strong>
      </div>
      <div {...stylex.props(layout.row, layout.between, gap.sm)}>
        <strong>Total</strong>
        <strong>{formattedRange([low, high])}</strong>
      </div>
    </section>
  );
  return (
    <section {...stylex.props(layout.stack, gap.lg)}>
      <h1 {...stylex.props(s.heading)}>Create an estimate</h1>
      <p {...stylex.props(s.copy)}>
        Interactive example with sample customers, designs and prices. Nothing
        is sent to a customer.
      </p>
      <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
        <Button
          variant="primary"
          onPress={() => {
            setDraft(initial());
            setStarted(false);
            setOpen(true);
          }}
        >
          Create new estimate
        </Button>
        {stored && (
          <Button
            onPress={() => {
              setDraft(stored);
              setStarted(true);
              setOpen(true);
            }}
          >
            Resume {stored.title}
          </Button>
        )}
      </div>
      <SidePanel
        size="workflow"
        title={draft.title || "New estimate"}
        description={
          started
            ? "Draft saved. Close and resume later."
            : "Name the estimate and choose its customer and expiration."
        }
        open={open}
        dismissible={!taxOpen && !packageId && !confirm && !newCustomer}
        onOpenChange={setOpen}
        footer={
          <>
            <Button
              isDisabled={draft.step === 0}
              onPress={() => patch({ step: draft.step - 1 })}
            >
              Back
            </Button>
            {draft.step < 4 ? (
              <Button
                variant="primary"
                isDisabled={!ready[draft.step]}
                onPress={() => {
                  setStarted(true);
                  patch({ step: draft.step + 1 });
                }}
              >
                {draft.step === 0 ? "Save and continue" : "Continue"}
              </Button>
            ) : draft.step === 4 ? (
              <Button
                variant="primary"
                isDisabled={!ready.slice(0, 4).every(Boolean)}
                onPress={() => patch({ finalized: true, step: 5 })}
              >
                {draft.finalized ? "Continue to send" : "Finalize estimate"}
              </Button>
            ) : (
              <Button
                variant="primary"
                isDisabled={!draft.finalized || draft.sent}
                onPress={() => setConfirm(true)}
              >
                {draft.sent ? "Sent to customer" : "Send to customer"}
              </Button>
            )}
          </>
        }
      >
        <div {...stylex.props(layout.stack, gap.lg)}>
          <WorkflowProgress
            label="Estimate workflow"
            steps={steps}
            selectedId={String(draft.step)}
            onSelect={(id) => go(Number(id))}
          />
          <h2 ref={heading} tabIndex={-1} {...stylex.props(s.heading)}>
            {labels[draft.step]}
          </h2>
          {draft.step === 0 && (
            <>
              <TextInput
                label="Estimate name"
                value={draft.title}
                disabled={locked}
                onChange={(e) => patch({ title: e.target.value })}
              />
              <Select
                label="Customer"
                value={draft.customer?.id ?? ""}
                disabled={locked}
                onChange={(e) =>
                  patch({
                    customer:
                      e.target.value === "demo"
                        ? demoCustomer
                        : e.target.value
                          ? draft.customer
                          : null,
                  })
                }
              >
                <option value="">Choose a customer</option>
                <option value="demo">
                  {demoCustomer.name} · {demoCustomer.email}
                </option>
                {draft.customer?.id !== "demo" && draft.customer && (
                  <option value={draft.customer.id}>
                    {draft.customer.name} · {draft.customer.email}
                  </option>
                )}
              </Select>
              <div {...stylex.props(layout.row)}>
                <Button
                  isDisabled={locked}
                  onPress={() => setNewCustomer(true)}
                >
                  New customer
                </Button>
              </div>
              <TextInput
                label="Expiration date"
                type="date"
                min={todayString}
                value={draft.expiration}
                disabled={locked}
                onChange={(e) => patch({ expiration: e.target.value })}
              />
              <InfoTooltip label="estimate dates">
                Choose today or a future date. Completing this step saves a
                resumable example draft.
              </InfoTooltip>
            </>
          )}
          {draft.step === 1 && (
            <>
              <InfoTooltip label="line item values">
                Use quantities greater than zero and prices at least zero.
                Quantities round to three decimal places and USD prices round to
                cents when leaving a field. Each choice requires at least two
                complete alternatives. Tax applies only to taxable items.
              </InfoTooltip>
              {renderBlocks()}
              <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
                <Button
                  isDisabled={locked}
                  onPress={() =>
                    patch({ blocks: [...draft.blocks, group("New section")] })
                  }
                >
                  Add section
                </Button>
                <Button
                  isDisabled={locked}
                  onPress={() =>
                    patch({
                      blocks: [
                        ...draft.blocks,
                        {
                          id: uid(),
                          kind: "choice",
                          title: "Design options",
                          description: "",
                          options: [],
                        },
                      ],
                    })
                  }
                >
                  Add choice section
                </Button>
              </div>
              <Select
                label="Add Cabinitron design"
                value=""
                disabled={locked}
                onChange={(e) => addDesign(e.target.value)}
              >
                <option value="">Choose a design</option>
                {designs.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </Select>
              {renderSummary(true)}
            </>
          )}
          {draft.step === 2 && (
            <>
              {active
                .filter((g) => g.design)
                .map((g) => (
                  <div
                    key={g.id}
                    {...stylex.props(s.card, padding.md, layout.stack, gap.sm)}
                  >
                    <strong>
                      {g.title} · revision {g.design!.revision}
                    </strong>
                    <Status>
                      {g.design!.packageRevision === g.design!.revision
                        ? "Customer package ready"
                        : "Customer package required"}
                    </Status>
                    <div {...stylex.props(layout.row)}>
                      <Button
                        isDisabled={locked}
                        onPress={() => setPackageId(g.id)}
                      >
                        {g.design!.packageRevision === g.design!.revision
                          ? "Rebuild customer package"
                          : "Generate customer package"}
                      </Button>
                    </div>
                  </div>
                ))}
              {!active.some((g) => g.design) && (
                <Status>
                  No linked designs. You can upload supporting documents below.
                </Status>
              )}
              <label {...stylex.props(layout.stack, gap.sm)}>
                Additional documents
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/png,image/jpeg"
                  disabled={locked}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? [])
                      .filter((f) =>
                        ["application/pdf", "image/png", "image/jpeg"].includes(
                          f.type,
                        ),
                      )
                      .map((f) => ({ name: f.name, type: f.type }));
                    patch({ files: [...draft.files, ...files] });
                    e.target.value = "";
                  }}
                />
              </label>
              {draft.files.map((f, i) => (
                <div
                  key={i}
                  {...stylex.props(layout.row, layout.between, gap.sm)}
                >
                  <span>{f.name}</span>
                  <Button
                    variant="ghost"
                    isDisabled={locked}
                    onPress={() =>
                      patch({
                        files: draft.files.filter((_, index) => index !== i),
                      })
                    }
                  >
                    Remove document {i + 1}
                  </Button>
                </div>
              ))}
            </>
          )}
          {draft.step === 3 && (
            <>
              <p {...stylex.props(s.copy)}>
                These terms apply to this estimate.
              </p>
              <label {...stylex.props(layout.stack, gap.sm)}>
                Estimate terms and conditions
                <textarea
                  {...stylex.props(s.area)}
                  value={draft.terms}
                  disabled={locked}
                  onChange={(e) => patch({ terms: e.target.value })}
                />
              </label>
            </>
          )}
          {draft.step === 4 && (
            <>
              <strong>{draft.title}</strong>
              <p {...stylex.props(s.copy)}>
                {draft.customer?.name} · Expires {draft.expiration}
              </p>
              {renderBlocks(true)}
              {renderSummary(false)}
              <h3 {...stylex.props(s.heading)}>Terms and conditions</h3>
              <p>{draft.terms}</p>
              <h3 {...stylex.props(s.heading)}>Documents</h3>
              <ul>
                {active
                  .filter((g) => g.design)
                  .map((g) => (
                    <li key={g.id}>
                      {g.title} · customer package · revision{" "}
                      {g.design!.revision}
                    </li>
                  ))}
                {draft.files.map((f, i) => (
                  <li key={i}>{f.name}</li>
                ))}
              </ul>
              {draft.finalized && (
                <Button
                  onPress={() =>
                    patch({ finalized: false, sent: false, step: 1 })
                  }
                >
                  Prepare a new revision
                </Button>
              )}
            </>
          )}
          {draft.step === 5 && (
            <>
              <Status>
                {draft.sent
                  ? "Estimate sent. Awaiting the customer's response."
                  : "Estimate finalized and ready to send."}
              </Status>
              <p>
                Send to {draft.customer?.name} · {draft.customer?.email}
              </p>
              <strong>{draft.title}</strong>
              <p>
                {low === high
                  ? money(low)
                  : `${money(low)}–${money(high)} with choices`}
              </p>
              <p {...stylex.props(s.copy)}>
                The customer will review the estimate, choose any options, and
                approve its terms in their own workflow.
              </p>
            </>
          )}
        </div>
      </SidePanel>
      <Dialog
        title="California address tax lookup"
        open={taxOpen}
        onOpenChange={setTaxOpen}
        footer={
          <Button
            variant="primary"
            isDisabled={!found}
            onPress={() => {
              patch({ tax: "8.75" });
              setTaxOpen(false);
            }}
          >
            Update tax rate
          </Button>
        }
      >
        <div {...stylex.props(layout.stack, gap.md)}>
          <Status>
            Sample California lookup. No live tax determination is made in this
            example.
          </Status>
          <TextInput
            label="Street address"
            value={address.street}
            onChange={(e) => {
              setFound(false);
              setAddress({ ...address, street: e.target.value });
            }}
          />
          <TextInput
            label="City"
            value={address.city}
            onChange={(e) => {
              setFound(false);
              setAddress({ ...address, city: e.target.value });
            }}
          />
          <TextInput
            label="ZIP code"
            value={address.zip}
            onChange={(e) => {
              setFound(false);
              setAddress({ ...address, zip: e.target.value });
            }}
          />
          <div {...stylex.props(layout.row)}>
            <Button
              isDisabled={
                !address.street.trim() ||
                !address.city.trim() ||
                !/^\d{5}(-\d{4})?$/.test(address.zip)
              }
              onPress={() => setFound(true)}
            >
              Find tax rate
            </Button>
          </div>
          {found && <Status>Sample result: 8.75%</Status>}
        </div>
      </Dialog>
      <Dialog
        title="Prepare customer package"
        open={!!packageId}
        onOpenChange={(v) => {
          if (!v) setPackageId(null);
        }}
        footer={
          <Button
            variant="primary"
            onPress={() => {
              mapGroups((g) =>
                g.id === packageId && g.design
                  ? {
                      ...g,
                      design: {
                        ...g.design,
                        packageRevision: g.design.revision,
                      },
                    }
                  : g,
              );
              setPackageId(null);
            }}
          >
            Create customer package
          </Button>
        }
      >
        <p>
          Generate the package for the current saved design revision. This
          example simulates package generation.
        </p>
      </Dialog>
      <Dialog
        title="Send estimate to customer"
        open={confirm}
        onOpenChange={setConfirm}
        footer={
          <Button
            variant="primary"
            onPress={() => {
              patch({ sent: true });
              setConfirm(false);
            }}
          >
            Confirm simulated send
          </Button>
        }
      >
        <p>
          Send {draft.title} to {draft.customer?.email}? This example records
          completion without sending email.
        </p>
      </Dialog>
      <Dialog
        title="New customer"
        open={newCustomer}
        onOpenChange={setNewCustomer}
        footer={
          <Button
            variant="primary"
            isDisabled={
              !customerName.trim() || !/^\S+@\S+\.\S+$/.test(customerEmail)
            }
            onPress={() => {
              patch({
                customer: {
                  id: uid(),
                  name: customerName,
                  email: customerEmail,
                },
              });
              setNewCustomer(false);
            }}
          >
            Create customer
          </Button>
        }
      >
        <div {...stylex.props(layout.stack, gap.md)}>
          <TextInput
            label="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <TextInput
            label="Customer email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
      </Dialog>
    </section>
  );
}
