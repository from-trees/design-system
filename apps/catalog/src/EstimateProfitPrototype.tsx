import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Button,
  DocumentSection,
  ParameterRow,
  SidePanel,
  Slider,
  Status,
} from "@from-trees/ui";
import { layout, gap } from "@from-trees/ui/utilities";

const key = "from-trees:catalog:estimate-profit:v1";
const groups = [
  {
    id: "kitchen",
    title: "ADU kitchen",
    rows: [
      { name: "Sink base cabinet", qty: 1, cost: 35000 },
      { name: "Wall cabinet", qty: 2, cost: 22500 },
    ],
  },
  {
    id: "laundry",
    title: "Laundry",
    rows: [
      { name: "Drawer base cabinet", qty: 1, cost: 50000 },
      { name: "Full-height end panel", qty: 1, cost: 12500 },
    ],
  },
];
const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
const s = stylex.create({
  header: {
    width: { default: 340, "@media (max-width: 600px)": "100%" },
    maxWidth: "100%",
  },
  screen: { padding: 24 },
});
export function EstimateProfitPrototype() {
  const [open, setOpen] = useState(true);
  const [customer, setCustomer] = useState(false);
  const [saved, setSaved] = useState(false);
  const [margins, setMargins] = useState<Record<string, number>>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(key) ?? "null") ?? {
          kitchen: 47.8,
          laundry: 47.8,
        }
      );
    } catch {
      return { kitchen: 47.8, laundry: 47.8 };
    }
  });
  return (
    <main {...stylex.props(s.screen)}>
      <Button onPress={() => setOpen(true)}>
        Open estimate pricing example
      </Button>
      <SidePanel
        size="wide-workflow"
        title={
          customer
            ? "Customer estimate preview"
            : "Kitchen & laundry · Estimate pricing"
        }
        description={customer ? "Cabinetry estimate" : "Draft · Add line items"}
        open={open}
        onOpenChange={setOpen}
        footer={
          <>
            {!customer && (
              <Button
                variant="primary"
                onPress={() => {
                  localStorage.setItem(key, JSON.stringify(margins));
                  setSaved(true);
                }}
              >
                Save prices
              </Button>
            )}
            <Button onPress={() => setCustomer(!customer)}>
              {customer ? "Back to editing" : "Customer preview"}
            </Button>
          </>
        }
      >
        <div {...stylex.props(layout.stack, gap.lg)}>
          {!customer && saved && (
            <Status>Prices saved for this estimate.</Status>
          )}
          {groups.map((group) => {
            const margin = margins[group.id] ?? 47.8;
            const rate = (cost: number) =>
              Math.round(cost / (1 - margin / 100));
            const total = group.rows.reduce(
              (sum, row) => sum + rate(row.cost) * row.qty,
              0,
            );
            return (
              <DocumentSection
                key={group.id}
                title={group.title}
                headerActions={
                  customer ? undefined : (
                    <div {...stylex.props(s.header)}>
                      <ParameterRow
                        label="Gross margin"
                        help="Choose 0%–90% in 0.1% increments. Gross margin = profit ÷ selling price. Rate = unit cost ÷ (1 − margin). At 90%, a $100 cost gives a $1,000 rate. Adjusting this section changes only its rates and totals. Save prices retains the selection when reopened."
                      >
                        <Slider
                          aria-label={`${group.title} gross margin`}
                          value={margin}
                          min={0}
                          max={90}
                          step={0.1}
                          formatValue={(value) => `${value.toFixed(1)}%`}
                          onChange={(value) => {
                            setMargins({ ...margins, [group.id]: value });
                            setSaved(false);
                          }}
                        />
                      </ParameterRow>
                    </div>
                  )
                }
                columns={
                  customer
                    ? [
                        { id: "item", label: "Item" },
                        { id: "qty", label: "Qty", numeric: true },
                        { id: "rate", label: "Rate", numeric: true },
                        { id: "total", label: "Total", numeric: true },
                      ]
                    : [
                        { id: "item", label: "Item" },
                        { id: "qty", label: "Qty", numeric: true },
                        { id: "rate", label: "Rate", numeric: true },
                        { id: "cost", label: "Cost", numeric: true },
                        { id: "profit", label: "Profit %", numeric: true },
                        { id: "total", label: "Total", numeric: true },
                      ]
                }
                rows={group.rows.map((row) => ({
                  id: row.name,
                  cells: customer
                    ? [
                        row.name,
                        row.qty,
                        money(rate(row.cost)),
                        money(rate(row.cost) * row.qty),
                      ]
                    : [
                        row.name,
                        row.qty,
                        money(rate(row.cost)),
                        money(row.cost),
                        `${margin.toFixed(1)}%`,
                        money(rate(row.cost) * row.qty),
                      ],
                }))}
                totals={[
                  {
                    id: "total",
                    label: "Section total",
                    value: money(total),
                    emphasis: true,
                  },
                ]}
              />
            );
          })}
        </div>
      </SidePanel>
    </main>
  );
}
