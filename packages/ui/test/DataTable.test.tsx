import { useState } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type TableColumn } from "../src/DataTable";
import type { TableQuery, TablePage } from "../src/tableQuery";
type Item = {
  id: string;
  name: string;
  amount: number | null;
  date: string;
  status: string;
};
const items: Item[] = [
  {
    id: "a",
    name: "Oak kitchen",
    amount: 123456,
    date: "2026-12-01",
    status: "Paid",
  },
  {
    id: "b",
    name: "Walnut bar",
    amount: 0,
    date: "2026-12-02",
    status: "Draft",
  },
];
const columns: TableColumn<Item>[] = [
  {
    id: "name",
    label: "Name",
    kind: "text",
    sortable: true,
    value: (r) => r.name,
  },
  {
    id: "amount",
    label: "Amount",
    kind: "money",
    currency: "USD",
    sortable: true,
    value: (r) => r.amount,
  },
  { id: "date", label: "Due", kind: "date", value: (r) => r.date },
  {
    id: "status",
    label: "Status",
    kind: "status",
    value: (r) => ({ label: r.status }),
  },
];
const query: TableQuery = {
  search: "",
  filters: {},
  sort: { key: "name", direction: "ascending" },
  page: 1,
  pageSize: 10,
};
const page: TablePage<Item> = { query, items, total: 67 };
const base = {
  label: "Orders",
  columns,
  query,
  page,
  getRowId: (r: Item) => r.id,
  getRowLabel: (r: Item) => r.name,
};
describe("DataTable", () => {
  it("formats money, date-only values and one action column while leaving input data unsorted", () => {
    render(
      <DataTable
        {...base}
        timeZone="America/Los_Angeles"
        onQueryChange={vi.fn()}
        rowActions={() => [{ id: "edit", label: "Edit", onAction: () => {} }]}
      />,
    );
    const grid = screen.getByRole("grid", { name: "Orders" });
    expect(within(grid).getAllByRole("columnheader")).toHaveLength(5);
    expect(within(grid).getByText("$1,234.56")).toBeVisible();
    expect(within(grid).getByText("$0.00")).toBeVisible();
    expect(within(grid).getByText("Dec 1, 2026")).toHaveAttribute(
      "datetime",
      "2026-12-01",
    );
    expect(within(grid).getAllByRole("row")[1]).toHaveTextContent(
      "Oak kitchen",
    );
    expect(
      within(grid).getByRole("columnheader", { name: /Name/ }),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
  });
  it("commits search on submit and resets page atomically for search, filters, sort and page size", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    render(
      <DataTable
        {...base}
        query={{ ...query, page: 3 }}
        page={{ ...page, query: { ...query, page: 3 } }}
        onQueryChange={change}
        filters={[
          {
            id: "status",
            label: "Status filter",
            options: [{ value: "paid", label: "Paid" }],
          },
        ]}
      />,
    );
    await user.type(
      screen.getByRole("searchbox", { name: "Search Orders" }),
      "oak",
    );
    expect(change).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith({
      ...query,
      page: 1,
      search: "oak",
    });
    await user.click(
      screen.getByRole("button", { name: "Status filter filter" }),
    );
    await user.selectOptions(screen.getByLabelText("Value"), "paid");
    await user.click(screen.getByRole("button", { name: "Apply filter" }));
    expect(change).toHaveBeenLastCalledWith({
      ...query,
      page: 1,
      filters: { status: { operator: "eq" as const, value: "paid" } },
    });
    await user.click(screen.getByRole("columnheader", { name: /Amount/ }));
    expect(change).toHaveBeenLastCalledWith({
      ...query,
      page: 1,
      sort: { key: "amount", direction: "ascending" },
    });
    await user.selectOptions(screen.getByLabelText("Rows per page"), "50");
    expect(change).toHaveBeenLastCalledWith({
      ...query,
      page: 1,
      pageSize: 50,
    });
  });
  it("sends page changes without dropping search, filters or sort", async () => {
    const user = userEvent.setup(),
      change = vi.fn();
    const intent = {
      ...query,
      page: 3,
      search: "oak",
      filters: { status: { operator: "eq" as const, value: "paid" } },
    };
    render(
      <DataTable
        {...base}
        query={intent}
        page={{ ...page, query: intent }}
        onQueryChange={change}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(change).toHaveBeenLastCalledWith({ ...intent, page: 4 });
    await user.click(screen.getByRole("button", { name: "Last page" }));
    expect(change).toHaveBeenLastCalledWith({ ...intent, page: 7 });
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(change).toHaveBeenLastCalledWith({ ...intent, page: 2 });
  });
  it("uses column-shaped shimmer rows with no stale data or actions while loading a new query", () => {
    render(
      <DataTable
        {...base}
        query={{ ...query, search: "new query" }}
        loading
        onQueryChange={vi.fn()}
      />,
    );
    const grid = screen.getByRole("grid", { name: "Orders" });
    expect(screen.getByRole("region", { name: "Orders" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(
      grid.querySelectorAll('[data-ft-ui="shimmer"]').length,
    ).toBeGreaterThan(20);
    expect(within(grid).queryByText("Oak kitchen")).not.toBeInTheDocument();
    expect(within(grid).queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("No matching records.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
  it("rejects a late response even when the loading flag is false", () => {
    render(
      <DataTable
        {...base}
        query={{ ...query, page: 2 }}
        onQueryChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("region", { name: "Orders" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.queryByText("Oak kitchen")).not.toBeInTheDocument();
  });
  it("distinguishes empty, no-match and failed states and clears filters without changing sort/page size", async () => {
    const user = userEvent.setup(),
      change = vi.fn(),
      retry = vi.fn();
    const intent = {
      ...query,
      search: "missing",
      filters: { status: { operator: "eq" as const, value: "paid" } },
    };
    const { rerender } = render(
      <DataTable
        {...base}
        query={intent}
        page={{ items: [], total: 0, query: intent }}
        onQueryChange={change}
      />,
    );
    expect(screen.getByText("No matching records.")).toBeVisible();
    await user.click(
      screen.getAllByRole("button", { name: "Clear filters" })[0],
    );
    expect(change).toHaveBeenLastCalledWith({
      ...query,
      page: 1,
      filters: {},
      search: "",
    });
    rerender(
      <DataTable
        {...base}
        page={{ items: [], total: 0, query }}
        onQueryChange={change}
      />,
    );
    expect(screen.getByText("No records yet.")).toBeVisible();
    rerender(
      <DataTable
        {...base}
        onQueryChange={change}
        error="Request failed"
        onRetry={retry}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Request failed");
    expect(screen.queryByText("Oak kitchen")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledOnce();
  });
  it("navigates by keyboard and exposes commands only in the row action menu", async () => {
    const user = userEvent.setup(),
      open = vi.fn(),
      edit = vi.fn();
    render(
      <DataTable
        {...base}
        onQueryChange={vi.fn()}
        onOpenRow={open}
        rowActions={() => [{ id: "edit", label: "Edit", onAction: edit }]}
      />,
    );
    const grid = screen.getByRole("grid");
    const cell = within(grid).getAllByRole("rowheader")[0];
    act(() => cell.focus());
    await user.keyboard("{ArrowDown}{Enter}");
    expect(open).toHaveBeenCalledWith(items[1]);
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Oak kitchen actions" }),
    );
    await user.click(await screen.findByRole("menuitem", { name: "Edit" }));
    expect(edit).toHaveBeenCalledOnce();
  });
  it("uses the currency's minor unit and never displays null as zero", () => {
    render(
      <DataTable
        {...base}
        columns={[
          { id: "name", label: "Name", kind: "text", value: (r) => r.name },
          {
            id: "yen",
            label: "Yen",
            kind: "money",
            currency: "JPY",
            value: () => 1234,
          },
          {
            id: "dinar",
            label: "Dinar",
            kind: "money",
            currency: "KWD",
            value: () => 12345,
          },
          { id: "absent", label: "Absent", kind: "number", value: () => null },
        ]}
        onQueryChange={() => {}}
      />,
    );
    expect(screen.getAllByText("¥1,234")).toHaveLength(2);
    expect(screen.getAllByText(/12.345/)).toHaveLength(2);
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });
  it("offers first-page recovery when the current page becomes empty", async () => {
    const user = userEvent.setup(),
      change = vi.fn(),
      intent = { ...query, page: 8 };
    render(
      <DataTable
        {...base}
        query={intent}
        page={{ query: intent, total: 67, items: [] }}
        onQueryChange={change}
      />,
    );
    expect(screen.getByText("No records on this page.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Go to first page" }));
    expect(change).toHaveBeenLastCalledWith({ ...intent, page: 1 });
  });
  it("preserves the search draft across page navigation but follows externally restored search state", () => {
    function Harness() {
      const [q, setQ] = useState(query);
      return (
        <DataTable
          {...base}
          query={q}
          page={{ ...page, query: q }}
          onQueryChange={setQ}
        />
      );
    }
    render(<Harness />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "unfinished" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByRole("searchbox")).toHaveValue("unfinished");
  });
});

it("keeps multi-status edits as a draft and clears only that field on apply", async () => {
  const user = userEvent.setup(),
    change = vi.fn();
  const intent: TableQuery = {
    ...query,
    page: 3,
    filters: {
      status: { operator: "in", value: ["draft", "paid"] },
      name: { operator: "contains", value: "oak" },
    },
  };
  render(
    <DataTable
      {...base}
      query={intent}
      page={{ ...page, query: intent }}
      onQueryChange={change}
      filters={[
        {
          id: "status",
          label: "Status",
          operators: ["in", "eq", "noteq"],
          options: [
            { value: "draft", label: "Draft" },
            { value: "paid", label: "Paid" },
          ],
        },
      ]}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Status filter" }));
  let dialog = screen.getByRole("dialog", { name: "Status filter" });
  await user.click(within(dialog).getByRole("checkbox", { name: "Draft" }));
  expect(change).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  await act(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  });
  await user.click(screen.getByRole("button", { name: "Status filter" }));
  dialog = screen.getByRole("dialog", { name: "Status filter" });
  expect(within(dialog).getByRole("checkbox", { name: "Draft" })).toBeChecked();
  expect(within(dialog).getByRole("checkbox", { name: "Paid" })).toBeChecked();
  await user.click(
    within(dialog).getByRole("button", { name: "Clear filter" }),
  );
  expect(change).toHaveBeenLastCalledWith({
    ...intent,
    page: 1,
    filters: { name: { operator: "contains", value: "oak" } },
  });
});
