import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Button,
  Dialog,
  DocumentSection,
  DocumentChoiceGroup,
  Status,
  Select,
} from "@from-trees/ui";
import { layout, gap } from "@from-trees/ui/utilities";
import { color } from "@from-trees/ui/tokens.stylex";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
type Item = {
  id: string;
  description: string;
  quantity: number;
  price: number;
  taxable: boolean;
  discount?: number;
};
type Option = {
  id: string;
  title: string;
  description: string;
  design?: string;
  items: Item[];
};
type Choice = {
  id: string;
  title: string;
  description: string;
  options: Option[];
};
// Synthetic selling prices only. This fixture is not a quote or a pricing default.
export const estimateChoices: Choice[] = [
  {
    id: "large",
    title: "72″ floating vanity",
    description:
      "Choose one construction option. Both include the same layout and dimensions.",
    options: [
      {
        id: "large-engineered",
        title: "72″ · Engineered wood",
        description:
          "Walnut veneer over an engineered core. Includes cabinet, drawer boxes and hardware.",
        design: "72″ engineered wood design",
        items: [
          {
            id: "cabinet",
            description: "Floating vanity · walnut veneer, drawers and hardware",
            quantity: 1,
            price: 470000,
            taxable: true,
          },
        ],
      },
      {
        id: "large-solid",
        title: "72″ · Solid wood",
        description:
          "Solid walnut construction. Includes cabinet, drawer boxes and hardware.",
        design: "72″ solid wood design",
        items: [
          {
            id: "cabinet",
            description: "Floating vanity · solid walnut, drawers and hardware",
            quantity: 1,
            price: 610000,
            taxable: true,
          },
        ],
      },
    ],
  },
  {
    id: "small",
    title: "48″ floating vanity",
    description: "Choose one construction option for the second vanity.",
    options: [
      {
        id: "small-engineered",
        title: "48″ · Engineered wood",
        description:
          "Walnut veneer over an engineered core. Two drawers with soft-close hardware.",
        design: "48″ engineered wood design",
        items: [
          {
            id: "cabinet",
            description: "Floating vanity · cabinet, drawers and hardware",
            quantity: 1,
            price: 290000,
            taxable: true,
          },
        ],
      },
      {
        id: "small-solid",
        title: "48″ · Solid wood",
        description:
          "Solid walnut construction. Two drawers with soft-close hardware.",
        design: "48″ solid wood design",
        items: [
          {
            id: "cabinet",
            description: "Floating vanity · cabinet, drawers and hardware",
            quantity: 1,
            price: 390000,
            taxable: true,
          },
        ],
      },
    ],
  },
  {
    id: "installation",
    title: "Installation",
    description:
      "Choose installation by the shop or arrange your own installer.",
    options: [
      {
        id: "install",
        title: "Shop installation",
        description:
          "Install both vanities at the project site. Plumbing connections are excluded.",
        items: [
          {
            id: "labor",
            description: "Vanity installation",
            quantity: 1,
            price: 100000,
            taxable: false,
          },
        ],
      },
      {
        id: "no-install",
        title: "No installation",
        description: "Customer arranges installation separately.",
        items: [
          {
            id: "excluded",
            description: "Installation excluded",
            quantity: 1,
            price: 0,
            taxable: false,
          },
        ],
      },
    ],
  },
];
const delivery: Option = {
  id: "delivery",
  title: "Project services",
  description: "Included with every combination.",
  items: [
    {
      id: "delivery",
      description: "Local delivery",
      quantity: 1,
      price: 25000,
      taxable: false,
    },
  ],
};
function amounts(option: Option) {
  const subtotal = option.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = option.items.reduce(
    (sum, item) => sum + (item.discount ?? 0),
    0,
  );
  const tax = option.items.reduce(
    (sum, item) =>
      sum +
      (item.taxable
        ? Math.round(
            (item.price * item.quantity - (item.discount ?? 0)) * 0.085,
          )
        : 0),
    0,
  );
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}
/** This example has independent choices. Production owns dependency-aware bounds. */
export function examplePriceRange(selections: Record<string, string>) {
  let low = amounts(delivery).total,
    high = low;
  for (const choice of estimateChoices) {
    const candidates = choice.options
      .filter(
        (option) =>
          !selections[choice.id] || selections[choice.id] === option.id,
      )
      .map((option) => amounts(option).total);
    low += Math.min(...candidates);
    high += Math.max(...candidates);
  }
  return { low, high };
}
const s = stylex.create({
  page: {
    maxWidth: 1080,
    width: "100%",
    marginInline: "auto",
    boxSizing: "border-box",
    minWidth: 0,
    backgroundColor: color.surface,
    color: color.ink,
  },
  standalone: {
    padding: { default: 32, "@media (max-width: 600px)": 16 },
    marginBlock: 24,
    borderRadius: 12,
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "start",
    gap: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  title: { margin: 0, fontSize: 28, lineHeight: 1.25, letterSpacing: "-0.5px" },
  heading: { margin: 0, fontSize: 20 },
  text: { margin: 0, color: color.muted, fontSize: 13, lineHeight: 1.6 },
  price: {
    margin: 0,
    fontSize: 28,
    fontWeight: 650,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.5px",
  },
  summary: {
    padding: 20,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 8,
    backgroundColor: color.subtle,
  },
  line: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 16,
    fontSize: 14,
  },
  value: { margin: 0, textAlign: "end", fontVariantNumeric: "tabular-nums" },
  divider: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.border,
  },
  link: {
    color: color.accent,
    textUnderlineOffset: 3,
    minHeight: 24,
    display: "inline-flex",
    alignItems: "center",
    fontSize: 13,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
const columns = [
  { id: "item", label: "Item" },
  { id: "qty", label: "Qty", numeric: true },
  { id: "unit", label: "Unit price", numeric: true },
  { id: "amount", label: "Amount", numeric: true },
];
export function EstimateOptionsPrototype({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [mode, setMode] = useState("editable");
  const [document, setDocument] = useState<string | null>(null);
  const [continued, setContinued] = useState(false);
  const groupName = useId();
  const complete = estimateChoices.every((choice) => selections[choice.id]);
  const dirty = JSON.stringify(selections) !== JSON.stringify(saved);
  const range = examplePriceRange(selections);
  const price = complete
    ? money(range.low)
    : `${money(range.low)}–${money(range.high)}`;
  const selected = estimateChoices.flatMap((choice) =>
    choice.options.filter((option) => selections[choice.id] === option.id),
  );
  const totalTax = [...selected, delivery].reduce(
    (sum, option) => sum + amounts(option).tax,
    0,
  );
  const renderSection = (
    option: Option,
    choice?: Choice,
    interactive = true,
  ) => {
    const a = amounts(option);
    return (
      <DocumentSection
        key={option.id}
        title={option.title}
        description={option.description}
        columns={columns}
        selection={
          choice
            ? {
                name: `${groupName}-${choice.id}`,
                value: option.id,
                selected: selections[choice.id] === option.id,
                disabled: mode === "disabled",
                onSelect:
                  mode !== "readonly" && interactive
                    ? (value) => {
                        setSelections((current) => ({
                          ...current,
                          [choice.id]: value,
                        }));
                        setContinued(false);
                      }
                    : undefined,
              }
            : undefined
        }
        actions={
          option.design ? (
            <a
              href={`#design-${option.id}`}
              {...stylex.props(s.link)}
              onClick={(event) => {
                event.preventDefault();
                setDocument(option.design!);
              }}
            >
              View design · revision 12 ↗
            </a>
          ) : undefined
        }
        rows={option.items.map((item) => ({
          id: item.id,
          cells: [
            item.description,
            item.quantity,
            money(item.price),
            money(item.price * item.quantity),
          ],
        }))}
        totals={[
          {
            id: "subtotal",
            label: "Section subtotal",
            value: money(a.subtotal),
          },
          ...(a.discount
            ? [
                {
                  id: "discount",
                  label: "Discount",
                  value: `−${money(a.discount)}`,
                },
              ]
            : []),
          { id: "tax", label: "Sales tax", value: money(a.tax) },
          {
            id: "total",
            label: "Section total",
            value: money(a.total),
            emphasis: true,
          },
        ]}
        note={
          choice && selections[choice.id] !== option.id
            ? "Alternative · excluded from the selected total"
            : undefined
        }
      />
    );
  };
  return (
    <article
      {...stylex.props(
        s.page,
        standalone && s.standalone,
        layout.stack,
        gap.xl,
      )}
      aria-label="Customer estimate options prototype"
    >
      <Status>
        Interactive catalog example · synthetic prices and design previews.
      </Status>
      <header {...stylex.props(s.header)}>
        <div {...stylex.props(layout.stack, gap.sm)}>
          <p {...stylex.props(s.text)}>
            SAMPLE CABINET SHOP · EST-1042 · REVISION 10
          </p>
          <h1 {...stylex.props(s.title)}>Floating vanities</h1>
          <p {...stylex.props(s.text)}>
            Prepared for Example Customer · Valid through November 30, 2026
          </p>
        </div>
        <div aria-live="polite" aria-atomic="true">
          <p {...stylex.props(s.price)}>{price}</p>
          <p {...stylex.props(s.text)}>
            {complete
              ? "Your selected estimate · USD · includes sales tax"
              : "Estimated range · USD · includes sales tax"}
          </p>
          <p {...stylex.props(s.text)}>
            {complete
              ? `50% deposit ${money(Math.round(range.low / 2))}`
              : "Final total and deposit depend on your selections."}
          </p>
        </div>
      </header>
      <div {...stylex.props(s.actions)}>
        <div {...stylex.props(layout.stack, gap.xs)}>
          <h2 {...stylex.props(s.heading)}>Review your estimate</h2>
          <p {...stylex.props(s.text)}>
            Compare the designs and choose one option in each section.
          </p>
        </div>
        <Button icon="view" onPress={() => setDocument("Itemized estimate")}>
          View estimate
        </Button>
      </div>
      <p {...stylex.props(s.text)}>
        Two floating vanities, finished in walnut, with drawer hardware and
        local delivery. Countertops, sinks and plumbing are excluded.
      </p>
      {estimateChoices.map((choice) => (
        <DocumentChoiceGroup
          key={choice.id}
          title={choice.title}
          description={choice.description}
          disabled={mode === "disabled"}
        >
          {choice.options.map((option) => renderSection(option, choice))}
        </DocumentChoiceGroup>
      ))}
      {renderSection(delivery)}
      <section
        aria-label="Estimate summary"
        {...stylex.props(s.summary, layout.stack, gap.md)}
      >
        <h2 {...stylex.props(s.heading)}>Your estimate summary</h2>
        <dl {...stylex.props(layout.stack, gap.sm)}>
          {estimateChoices.map((choice) => (
            <div key={choice.id} {...stylex.props(s.line)}>
              <dt>{choice.title}</dt>
              <dd {...stylex.props(s.value)}>
                {choice.options
                  .find((option) => selections[choice.id] === option.id)
                  ?.title.split(" · ")
                  .at(-1) ?? "Choose an option"}
              </dd>
            </div>
          ))}
          <div {...stylex.props(s.line)}>
            <dt>Project services</dt>
            <dd {...stylex.props(s.value)}>{money(amounts(delivery).total)}</dd>
          </div>
          {complete && (
            <div {...stylex.props(s.line)}>
              <dt>Included sales tax</dt>
              <dd {...stylex.props(s.value)}>{money(totalTax)}</dd>
            </div>
          )}
          <div {...stylex.props(s.line, s.divider)}>
            <dt>
              <strong>{complete ? "Selected total" : "Estimated range"}</strong>
            </dt>
            <dd {...stylex.props(s.value)}>
              <strong>{price}</strong>
            </dd>
          </div>
        </dl>
        <p {...stylex.props(s.text)}>
          {complete
            ? `Deposit ${money(Math.round(range.low / 2))} · Balance after deposit ${money(range.low - Math.round(range.low / 2))}`
            : "Range includes the lowest and highest valid combinations. Choose all options to confirm the exact total."}
        </p>
      </section>
      <div role="status" aria-live="polite">
        <p {...stylex.props(s.text)}>
          {!complete
            ? `${estimateChoices.filter((choice) => !selections[choice.id]).length} selections remaining.`
            : dirty
              ? "Selections changed. Save them before continuing."
              : "Selections saved. Review your final total before continuing."}
        </p>
      </div>
      {mode !== "readonly" && (
        <div {...stylex.props(s.actions)}>
          <Button
            onPress={() => setSaved({ ...selections })}
            isDisabled={!complete || !dirty || mode === "disabled"}
          >
            Save selections
          </Button>
          <Button
            variant="primary"
            onPress={() => setContinued(true)}
            isDisabled={!complete || dirty || mode === "disabled"}
          >
            Continue to approval
          </Button>
        </div>
      )}
      {continued && (
        <Status>
          Example complete. The app would open terms and approval next. No
          agreement has been signed.
        </Status>
      )}
      <div {...stylex.props(s.actions)}>
        <Select
          label="Example state"
          value={mode}
          onChange={(event) => setMode(event.target.value)}
        >
          <option value="editable">Editable</option>
          <option value="disabled">Saving · disabled</option>
          <option value="readonly">Read-only</option>
        </Select>
        <Button
          onPress={() => {
            setSelections({});
            setSaved({});
            setContinued(false);
          }}
        >
          Reset example
        </Button>
      </div>
      <Dialog
        title={document ?? ""}
        open={!!document}
        onOpenChange={(open) => {
          if (!open) setDocument(null);
        }}
      >
        {document === "Itemized estimate" ? (
          <div {...stylex.props(layout.stack, gap.lg)}>
            <p {...stylex.props(s.price)}>{price}</p>
            {complete ? (
              <>
                {selected.map((option) =>
                  renderSection(option, undefined, false),
                )}
                {renderSection(delivery)}
                <p {...stylex.props(s.text)}>
                  Selected options only · includes sales tax. Unselected
                  alternatives are excluded.
                </p>
              </>
            ) : (
              <Status>
                Choose an option in each section to finalize the itemized
                estimate. Current range: {price}.
              </Status>
            )}
          </div>
        ) : (
          <p {...stylex.props(s.text)}>
            Sample preview for {document}. In Cabinitron, this link opens the
            saved design for this section.
          </p>
        )}
      </Dialog>
    </article>
  );
}
