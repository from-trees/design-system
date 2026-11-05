import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
afterEach(() => vi.useRealTimers());
import { TablesDemo, queryDemoInvoices } from "../src/TablesDemo";
import type { TableQuery } from "@from-trees/ui";
const query: TableQuery = {
  search: "",
  filters: {},
  sort: { key: "number", direction: "ascending" },
  page: 1,
  pageSize: 10,
};
it("searches and filters the complete dataset before paging and reports the filtered count", () => {
  const result = queryDemoInvoices({
    ...query,
    search: "kitchen",
    filters: { status: { operator: "in" as const, value: ["paid"] } },
  });
  expect(result.total).toBe(5);
  expect(result.items).toHaveLength(5);
  expect(
    result.items.every(
      (row) => row.title === "Kitchen cabinetry" && row.status === "paid",
    ),
  ).toBe(true);
  expect(
    queryDemoInvoices({ ...query, search: "INV-1067" }).items[0].number,
  ).toBe("INV-1067");
});
it("sorts raw money values, preserves zero, and has stable nonoverlapping page boundaries", () => {
  const first = queryDemoInvoices({
    ...query,
    sort: { key: "amount", direction: "ascending" },
  });
  expect(first.items[0].amount).toBe(0);
  const second = queryDemoInvoices({
    ...query,
    sort: { key: "amount", direction: "ascending" },
    page: 2,
  });
  expect(
    second.items.every(
      (row) => !first.items.some((previous) => previous.id === row.id),
    ),
  ).toBe(true);
  expect(Math.max(...first.items.map((row) => row.amount))).toBeLessThan(
    Math.min(...second.items.map((row) => row.amount)),
  );
  expect(queryDemoInvoices({ ...query, page: 7 }).items).toHaveLength(7);
  expect(queryDemoInvoices({ ...query, page: 8 }).items).toHaveLength(0);
  expect(
    queryDemoInvoices({
      ...query,
      sort: { key: "customer", direction: "ascending" },
    }),
  ).toEqual(
    queryDemoInvoices({
      ...query,
      sort: { key: "customer", direction: "ascending" },
    }),
  );
});
it("opens contextual row details and exercises failure/retry without mutating records", async () => {
  const user = userEvent.setup();
  render(<TablesDemo state="default" />);
  await screen.findByText("67 results · Page 1 of 7");
  await user.click(screen.getByRole("button", { name: "INV-1067 actions" }));
  await user.click(await screen.findByRole("menuitem", { name: "Open" }));
  const panel = await screen.findByRole("dialog", { name: "INV-1067" });
  expect(panel).toHaveTextContent("Library shelving");
  await user.click(
    within(panel).getByRole("button", { name: "Close", exact: true }),
  );
  await user.click(screen.getByText("Review controls & API contract"));
  await user.click(screen.getByRole("button", { name: "Fail next request" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Invoices could not be loaded",
  );
  await user.click(screen.getByRole("button", { name: "Retry" }));
  await screen.findByText("67 results · Page 1 of 7");
  expect(screen.getByRole("grid")).toHaveTextContent("INV-1067");
});

it("cancels an older delayed failure so it cannot replace a newer successful query", async () => {
  vi.useFakeTimers();
  render(<TablesDemo state="default" />);
  await act(async () => {
    vi.advanceTimersByTime(350);
  });
  fireEvent.click(screen.getByText("Review controls & API contract"));
  fireEvent.change(screen.getByLabelText("Response delay"), {
    target: { value: "1800" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Fail next request" }));
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "INV-1001" },
  });
  fireEvent.submit(screen.getByRole("search", { name: "Search Invoices" }));
  fireEvent.change(screen.getByLabelText("Response delay"), {
    target: { value: "350" },
  });
  await act(async () => {
    vi.advanceTimersByTime(350);
  });
  expect(screen.getByText("1 result · Page 1 of 1")).toBeVisible();
  await act(async () => {
    vi.advanceTimersByTime(1800);
  });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("grid")).toHaveTextContent("INV-1001");
});

it("selects multiple statuses in the filter dialog before paging and resets to page one", async () => {
  const user = userEvent.setup();
  render(<TablesDemo state="default" />);
  await screen.findByText("67 results · Page 1 of 7");
  await user.click(screen.getByRole("button", { name: "Next page" }));
  await screen.findByText("67 results · Page 2 of 7");
  await user.click(screen.getByRole("button", { name: "Status filter" }));
  const dialog = screen.getByRole("dialog", { name: "Status filter" });
  expect(within(dialog).queryByLabelText("Operator")).not.toBeInTheDocument();
  await user.click(within(dialog).getByRole("checkbox", { name: "Draft" }));
  await user.click(within(dialog).getByRole("checkbox", { name: "Issued" }));
  await user.click(
    within(dialog).getByRole("button", { name: "Apply filter" }),
  );
  await screen.findByText("45 results · Page 1 of 5");
  expect(
    within(screen.getByRole("grid")).queryByText("Paid"),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Last page" }));
  await screen.findByText("45 results · Page 5 of 5");
  expect(within(screen.getByRole("grid")).getAllByRole("row")).toHaveLength(6);
});
it("combines multi-status IN with scalar customer equality and rejects operators not yet enabled for a field", () => {
  const combined = queryDemoInvoices({
    ...query,
    filters: {
      status: { operator: "in", value: ["draft", "issued"] },
      customer: { operator: "eq", value: "Alex Morgan" },
    },
  });
  expect(combined.total).toBe(9);
  expect(
    combined.items.every(
      (row) => row.customer === "Alex Morgan" && row.status !== "paid",
    ),
  ).toBe(true);
  expect(() =>
    queryDemoInvoices({
      ...query,
      filters: { customer: { operator: "contains", value: "Alex" } },
    }),
  ).toThrow();
});
