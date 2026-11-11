import { useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  DataTable,
  SidePanel,
  TextInput,
  Select,
  Status,
  Button,
  InfoTooltip,
  tableQueryKey,
  parseTableQuery,
  type TableColumn,
  type TableFilter,
  type TablePage,
  type TableQuery,
  type TableQuerySchema,
} from "@from-trees/ui";
import { layout, gap } from "@from-trees/ui/utilities";
import type { ExampleState } from "./demos";
import { s } from "./styles";
import { ThumbnailTableDemo } from "./ThumbnailTableDemo";
type Invoice = {
  id: string;
  number: string;
  title: string;
  customer: string;
  amount: number;
  status: string;
  due: string;
};
const schema: TableQuerySchema = {
  sortKeys: ["number", "customer", "amount", "status", "due"],
  filters: {
    status: {
      operators: ["in"],
      values: ["draft", "issued", "paid"],
    },
    customer: { operators: ["eq"] },
  },
  defaultSort: { key: "number", direction: "descending" },
};
const records: Invoice[] = Array.from({ length: 67 }, (_, index) => ({
  id: `invoice-${index + 1}`,
  number: `INV-${String(index + 1001)}`,
  title: [
    "Kitchen cabinetry",
    "Library shelving",
    "Bathroom vanity",
    "Oak wardrobe",
    "Bar cabinets",
  ][index % 5],
  customer: [
    "Alex Morgan",
    "Sam Rivera",
    "Jordan Chen",
    "Taylor Brooks",
    "Casey Patel",
  ][index % 5],
  amount: index === 0 ? 0 : 125000 + index * 13725,
  status: ["draft", "issued", "paid"][index % 3],
  due: `2026-12-${String(1 + (index % 28)).padStart(2, "0")}`,
}));
const filters: TableFilter[] = [
  {
    id: "status",
    label: "Status",
    operators: ["in"],
    options: [
      { value: "draft", label: "Draft" },
      { value: "issued", label: "Issued" },
      { value: "paid", label: "Paid" },
    ],
  },
  {
    id: "customer",
    label: "Customer",
    operators: ["eq"],
  },
];
const columns: TableColumn<Invoice>[] = [
  {
    id: "number",
    label: "Invoice",
    kind: "text",
    sortable: true,
    value: (row) => row.number,
    metadata: (row) => row.title,
  },
  {
    id: "customer",
    label: "Customer",
    kind: "text",
    sortable: true,
    value: (row) => row.customer,
  },
  {
    id: "amount",
    label: "Amount",
    kind: "money",
    currency: "USD",
    sortable: true,
    value: (row) => row.amount,
  },
  {
    id: "status",
    label: "Status",
    kind: "status",
    sortable: true,
    value: (row) => ({
      label: row.status[0].toUpperCase() + row.status.slice(1),
      tone:
        row.status === "paid"
          ? "success"
          : row.status === "issued"
            ? "warning"
            : "neutral",
    }),
  },
  {
    id: "due",
    label: "Due",
    kind: "date",
    sortable: true,
    value: (row) => row.due,
  },
];
/** Endpoint simulation: shared parser, complete-dataset search/filter/sort, stable ID tiebreaker, THEN paging. */
export function queryDemoInvoices(
  input: TableQuery,
  data = records,
): TablePage<Invoice> {
  const query = parseTableQuery(
    new URLSearchParams(tableQueryKey(input)),
    schema,
  );
  const search = query.search.toLocaleLowerCase("en-US");
  const matching = data.filter(
    (row) =>
      Object.entries(query.filters).every(([key, filter]) => {
        const value = String(row[key as "status" | "customer"]);
        if (filter.operator === "in") return filter.value.includes(value);
        if (filter.operator === "contains")
          return value
            .toLocaleLowerCase("en-US")
            .includes(filter.value.toLocaleLowerCase("en-US"));
        return filter.operator === "eq"
          ? value === filter.value
          : value !== filter.value;
      }) &&
      `${row.number} ${row.customer} ${row.title}`
        .toLocaleLowerCase("en-US")
        .includes(search),
  );
  matching.sort((a, b) => {
    const key = (query.sort?.key ?? "number") as keyof Invoice;
    const av = a[key],
      bv = b[key];
    const compared =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "en-US", { numeric: true });
    return (
      (compared || a.id.localeCompare(b.id)) *
      (query.sort?.direction === "ascending" ? 1 : -1)
    );
  });
  const offset = (query.page - 1) * query.pageSize;
  return {
    items: matching.slice(offset, offset + query.pageSize),
    total: matching.length,
    query,
  };
}
export function TablesDemo({ state }: { state: ExampleState }) {
  const [showThumbnailDemo, setShowThumbnailDemo] = useState(false);
  const [query, setQuery] = useState<TableQuery>({
    search: "",
    filters: {},
    sort: schema.defaultSort,
    page: 1,
    pageSize: 10,
  });
  const [page, setPage] = useState<TablePage<Invoice> | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [delay, setDelay] = useState("350"),
    [scenario, setScenario] = useState("records"),
    [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState<Invoice | null>(null),
    [notice, setNotice] = useState("");
  const failNext = useRef(false);
  const [request, setRequest] = useState("");
  useEffect(() => {
    setLoading(true);
    setError("");
    setRequest("GET /api/invoices?" + tableQueryKey(query));
    // Cleanup cancels obsolete requests, so a slow response cannot overwrite new intent.
    if (state === "loading") return;
    const failure = failNext.current || state === "error";
    failNext.current = false;
    const timer = setTimeout(() => {
      if (failure) {
        setError("Invoices could not be loaded. Try again.");
        setLoading(false);
        return;
      }
      setPage(queryDemoInvoices(query, scenario === "empty" ? [] : records));
      setLoading(false);
    }, Number(delay));
    return () => clearTimeout(timer);
  }, [query, delay, scenario, retry, state]);
  return (
    <div {...stylex.props(layout.stack, gap.xl)}>
      <DataTable
        label="Invoices"
        columns={columns}
        query={query}
        onQueryChange={(next) => {
          setNotice("");
          setQuery(next);
        }}
        page={page}
        loading={loading}
        error={error}
        onRetry={() => setRetry((n) => n + 1)}
        filters={filters}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.number}
        onOpenRow={setSelected}
        rowActions={(row) => [
          {
            id: "copy",
            label: "Duplicate",
            icon: "copy",
            disabled: state === "disabled",
            onAction: () =>
              setNotice(
                `Duplicate ${row.number} selected. Demo only; no record was created.`,
              ),
          },
        ]}
        primaryAction={{
          id: "create",
          label: "New invoice",
          icon: "add",
          disabled: state === "disabled",
          onAction: () =>
            setNotice(
              "New invoice selected. This table example does not create records.",
            ),
        }}
      />
      <Button onPress={() => setShowThumbnailDemo((show) => !show)}>
        {showThumbnailDemo
          ? "Hide thumbnail example"
          : "Preview thumbnail rows"}
      </Button>
      {showThumbnailDemo && <ThumbnailTableDemo />}
      {notice && <Status>{notice}</Status>}
      <details>
        <summary>Review controls & API contract</summary>
        <div {...stylex.props(layout.stack, gap.md)}>
          <p {...stylex.props(s.small)}>
            Synthetic records only. Search covers invoice number, project and
            customer. Sorting is server-side in the simulated endpoint; money
            sorts numerically before formatting.
          </p>
          <Select
            label="Dataset"
            value={scenario}
            onChange={(event) => {
              setScenario(event.target.value);
              setQuery({ ...query, page: 1 });
            }}
          >
            <option value="records">67 invoices</option>
            <option value="empty">No records</option>
          </Select>
          <Select
            label="Response delay"
            value={delay}
            onChange={(event) => setDelay(event.target.value)}
          >
            <option value="350">350 ms</option>
            <option value="1800">1.8 seconds</option>
          </Select>
          <Button
            onPress={() => {
              failNext.current = true;
              setRetry((n) => n + 1);
            }}
          >
            Fail next request
          </Button>
          <TextInput
            label="Last request (simulated)"
            readOnly
            value={request}
          />
          <InfoTooltip label="table API">
            GET collection endpoints accept q, sort, direction, page, pageSize
            and allowlisted filter keys. Responses contain items, filtered total
            and the normalized query. Applications own permissions and
            persistence.
          </InfoTooltip>
        </div>
      </details>
      <SidePanel
        title={selected?.number ?? "Invoice"}
        description={
          selected ? `${selected.title} · ${selected.customer}` : undefined
        }
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        footer={<Button onPress={() => setSelected(null)}>Close</Button>}
      >
        {selected && (
          <div {...stylex.props(layout.stack, gap.md)}>
            <Status>
              Table navigation example. No invoice is issued or changed.
            </Status>
            <dl>
              <dt>Customer</dt>
              <dd>{selected.customer}</dd>
              <dt>Amount</dt>
              <dd>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(selected.amount / 100)}
              </dd>
              <dt>Status</dt>
              <dd>{selected.status}</dd>
            </dl>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
