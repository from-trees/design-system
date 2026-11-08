import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import { ThemeProvider } from "@from-trees/ui";
import { EstimateWorkflowPrototype } from "../src/EstimateWorkflowPrototype";
beforeEach(() => localStorage.clear());
async function start() {
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <EstimateWorkflowPrototype />
    </ThemeProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Create new estimate" }));
  await user.type(screen.getByLabelText("Estimate name"), "Bathroom vanity");
  await user.selectOptions(screen.getByLabelText("Customer"), "demo");
  await user.type(screen.getByLabelText("Expiration date"), "2099-12-31");
  await user.click(screen.getByRole("button", { name: "Save and continue" }));
  return user;
}
it("requires the initial fields, saves a resumable draft and keeps later invalid steps unavailable", async () => {
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <EstimateWorkflowPrototype />
    </ThemeProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Create new estimate" }));
  expect(
    screen.getByRole("button", { name: "Save and continue" }),
  ).toBeDisabled();
  await user.type(screen.getByLabelText("Estimate name"), "Vanity");
  await user.selectOptions(screen.getByLabelText("Customer"), "demo");
  expect(
    screen.getByRole("button", { name: "Save and continue" }),
  ).toBeDisabled();
  await user.type(screen.getByLabelText("Expiration date"), "2099-12-31");
  await user.click(screen.getByRole("button", { name: "Save and continue" }));
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await user.click(screen.getByRole("button", { name: "Resume Vanity" }));
  expect(screen.getByRole("heading", { name: "Add line items" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByLabelText("Estimate name")).toHaveValue("Vanity");
});
it("edits rows directly, applies tax only through the lookup update and completes the six-step flow", async () => {
  const user = await start();
  await user.click(screen.getByRole("button", { name: "Add item to Items" }));
  await user.type(
    screen.getByLabelText("Item 1 description in Items"),
    "Vanity installation",
  );
  await user.clear(screen.getByLabelText("Rate item 1 in Items"));
  await user.type(screen.getByLabelText("Rate item 1 in Items"), "100");
  await user.tab();
  expect(screen.getAllByText("$100.00").length).toBeGreaterThan(0);
  await user.click(screen.getByRole("button", { name: "Look up tax rate" }));
  await user.type(screen.getByLabelText("Street address"), "100 Main Street");
  await user.type(screen.getByLabelText("City"), "Sacramento");
  await user.type(screen.getByLabelText("ZIP code"), "95814");
  await user.click(screen.getByRole("button", { name: "Find tax rate" }));
  expect(screen.getByLabelText("Tax rate (%)")).toHaveValue("0");
  await user.click(screen.getByRole("button", { name: "Update tax rate" }));
  expect(screen.getByLabelText("Tax rate (%)")).toHaveValue("8.75");
  expect(
    within(screen.getByRole("region", { name: "Estimate summary" })).getByText(
      "$108.75",
    ),
  ).toBeVisible();
  const summary = screen.getByRole("region", { name: "Estimate summary" });
  expect(summary.textContent).toMatch(
    /Subtotal\$100\.00Tax rate.*\$8\.75Total\$108\.75/,
  );
  await user.click(screen.getByLabelText("Taxable item 1 in Items"));
  expect(
    within(
      screen.getByRole("region", { name: "Estimate summary" }),
    ).getAllByText("$100.00")[0],
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(
    screen.getByRole("heading", { name: "Prepare documents" }),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.clear(screen.getByLabelText("Estimate terms and conditions"));
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  await user.type(
    screen.getByLabelText("Estimate terms and conditions"),
    "Due on delivery.",
  );
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Due on delivery.")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Finalize estimate" }));
  await user.click(screen.getByRole("button", { name: "Send to customer" }));
  await user.click(
    screen.getByRole("button", { name: "Confirm simulated send" }),
  );
  expect(
    screen.getByRole("button", {
      name: /^Send to customer: Complete, viewing/,
    }),
  ).toBeVisible();
});
it("adds read-only design rows immediately and invalidates the package when refreshing the design", async () => {
  const user = await start();
  await user.selectOptions(
    screen.getByLabelText("Add Cabinitron design"),
    "Vanity — Design A",
  );
  expect(screen.getByText("Vanity cabinet")).toBeVisible();
  const header = screen
    .getByRole("table", { name: "Vanity — Design A", exact: true })
    .querySelector("thead")!;
  expect(
    within(header).getByRole("button", { name: "Update to latest revision" }),
  ).toBeVisible();
  expect(
    within(header).getByRole("button", { name: "Remove design" }),
  ).toBeVisible();

  expect(screen.getByText("Drawer fronts and hardware")).toBeVisible();
  expect(
    screen.queryByLabelText(/description in Vanity — Design A/),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  await user.click(
    screen.getByRole("button", { name: "Generate customer package" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Create customer package" }),
  );
  expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "Back" }));
  await user.click(
    screen.getByRole("button", { name: "Update to latest revision" }),
  );
  expect(screen.getByText(/Saved design · revision 8/)).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Customer package required")).toBeVisible();
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
});
it("creates options first and adds their items inside the choice, preserving separate subtotals", async () => {
  const user = await start();
  await user.click(screen.getByRole("button", { name: "Add choice section" }));
  expect(screen.getByRole("group", { name: "Design options" })).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "Add item option", exact: true }),
  );
  await user.type(
    screen.getByLabelText("Item 1 description in Option 1"),
    "Option A scope",
  );
  await user.clear(screen.getByLabelText("Rate item 1 in Option 1"));
  await user.type(screen.getByLabelText("Rate item 1 in Option 1"), "200");
  await user.click(
    screen.getByRole("button", { name: "Add item option", exact: true }),
  );
  await user.type(
    screen.getByLabelText("Item 1 description in Option 2"),
    "Option B scope",
  );
  await user.clear(screen.getByLabelText("Rate item 1 in Option 2"));
  await user.type(screen.getByLabelText("Rate item 1 in Option 2"), "300");
  await user.tab();
  expect(
    within(
      screen.getByRole("region", { name: "Estimate summary" }),
    ).getAllByText("$200.00–$300.00")[0],
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  await user.click(
    screen.getByRole("button", { name: "Add item option", exact: true }),
  );
  expect(
    screen.getByRole("button", { name: "Add item to Option 3" }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
});

it("adds arbitrary saved designs as options without assuming a finish or prebuilding empty alternatives", async () => {
  const user = await start();
  await user.click(screen.getByRole("button", { name: "Add choice section" }));
  expect(screen.queryByText(/Choose your finish/)).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Option 1" }),
  ).not.toBeInTheDocument();
  await user.selectOptions(
    screen.getByLabelText("Add design option to Design options"),
    "Vanity — Design A",
  );
  await user.selectOptions(
    screen.getByLabelText("Add design option to Design options"),
    "Vanity — Design B",
  );
  const choice = screen.getByRole("group", { name: "Design options" });
  expect(
    within(choice).getByRole("table", {
      name: "Vanity — Design A",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    within(choice).getByRole("table", {
      name: "Vanity — Design B",
      exact: true,
    }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
});

it("edits an option title and description in its header and cancels inline edits without closing the workflow", async () => {
  const user = await start();
  await user.click(screen.getByRole("button", { name: "Add choice section" }));
  await user.click(screen.getByRole("button", { name: "Add item option" }));
  let table = screen.getByRole("table", { name: "Option 1", exact: true });
  expect(
    screen.queryByRole("textbox", { name: "Section title", exact: true }),
  ).not.toBeInTheDocument();
  await user.click(
    within(table).getByRole("button", {
      name: "Edit section title",
      exact: true,
    }),
  );
  const title = screen.getByRole("textbox", {
    name: "Section title",
    exact: true,
  });
  await user.clear(title);
  await user.type(title, "Wall-mounted option{Enter}");
  table = screen.getByRole("table", {
    name: "Wall-mounted option",
    exact: true,
  });
  await user.click(
    within(table).getByRole("button", {
      name: "Edit section description",
      exact: true,
    }),
  );
  await user.type(
    screen.getByRole("textbox", { name: "Section description", exact: true }),
    "Extra floor clearance",
  );
  await user.tab();
  expect(within(table).getByText("Extra floor clearance")).toBeVisible();
  await user.click(
    within(table).getByRole("button", {
      name: "Edit section title",
      exact: true,
    }),
  );
  await user.type(
    screen.getByRole("textbox", { name: "Section title", exact: true }),
    " discarded{Escape}",
  );
  expect(
    screen.getByRole("table", { name: "Wall-mounted option", exact: true }),
  ).toBeVisible();
  expect(
    screen.getByRole("dialog", { name: "Bathroom vanity", exact: true }),
  ).toBeVisible();
  expect(
    within(table).getByRole("button", { name: "Remove section", exact: true }),
  ).toBeVisible();
  expect(
    screen
      .getByRole("button", { name: "Add item to Wall-mounted option" })
      .closest("section"),
  ).toBe(table.closest("section"));
});

it("uses the same consolidated inline header and footer for regular sections", async () => {
  const user = await start();
  await user.click(screen.getByRole("button", { name: "Add section" }));
  let table = screen.getByRole("table", { name: "New section", exact: true });
  await user.click(
    within(table).getByRole("button", {
      name: "Edit section title",
      exact: true,
    }),
  );
  const field = screen.getByRole("textbox", {
    name: "Section title",
    exact: true,
  });
  await user.clear(field);
  await user.type(field, "Installation{Enter}");
  table = screen.getByRole("table", { name: "Installation", exact: true });
  await user.click(
    within(table).getByRole("button", {
      name: "Edit section description",
      exact: true,
    }),
  );
  await user.type(
    screen.getByRole("textbox", { name: "Section description", exact: true }),
    "Install and level the vanity{Enter}",
  );
  expect(within(table).getByText("Install and level the vanity")).toBeVisible();
  expect(
    screen.queryByRole("textbox", { name: "Section title", exact: true }),
  ).not.toBeInTheDocument();
  expect(
    screen
      .getByRole("button", { name: "Add item to Installation" })
      .closest("section"),
  ).toBe(table.closest("section"));
  await user.click(
    within(table).getByRole("button", { name: "Remove section", exact: true }),
  );
  expect(
    screen.queryByRole("table", { name: "Installation", exact: true }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("table", { name: "Items", exact: true }),
  ).toBeVisible();
});
