import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ThemeProvider } from "@from-trees/ui";
import {
  EstimateOptionsPrototype,
  examplePriceRange,
  estimateChoices,
} from "../src/EstimateOptionsPrototype";
const setup = () => {
  render(
    <ThemeProvider>
      <EstimateOptionsPrototype />
    </ThemeProvider>,
  );
  return userEvent.setup();
};
const choose = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    screen.getByRole("radio", { name: "Select 72″ · Engineered wood" }),
  );
  await user.click(
    screen.getByRole("radio", { name: "Select 48″ · Engineered wood" }),
  );
  await user.click(
    screen.getByRole("radio", { name: "Select No installation" }),
  );
};
it("starts with the extrema of valid combinations including shared services and rounded taxes", () => {
  setup();
  expect(screen.getByRole("article")).toHaveTextContent("$8,496.00–$12,100.00");
  expect(
    screen
      .getAllByRole("radio", { hidden: true })
      .every((radio) => !(radio as HTMLInputElement).checked),
  ).toBe(true);
  const totals: number[] = [];
  for (const large of estimateChoices[0].options)
    for (const small of estimateChoices[1].options)
      for (const installation of estimateChoices[2].options) {
        const result = examplePriceRange({
          large: large.id,
          small: small.id,
          installation: installation.id,
        });
        expect(result.low).toBe(result.high);
        totals.push(result.low);
      }
  expect(examplePriceRange({})).toEqual({
    low: Math.min(...totals),
    high: Math.max(...totals),
  });
  expect(examplePriceRange({ large: "large-solid" })).toEqual({
    low: 1001500,
    high: 1210000,
  });
});
it("keeps design actions with their own tables and does not select an option when previewing", async () => {
  const user = setup();
  expect(screen.getAllByRole("link", { name: /View design/ })).toHaveLength(4);
  const section = screen.getByRole("region", {
    name: "72″ · Solid wood itemized table",
  });
  await user.click(within(section).getByRole("link"));
  expect(screen.getByRole("dialog")).toHaveTextContent("72″ solid wood design");
  expect(
    screen
      .getAllByRole("radio", { hidden: true })
      .every((radio) => !(radio as HTMLInputElement).checked),
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: /^Close / }));
  const table = within(section).getByRole("table");
  expect(
    within(table).getByRole("columnheader", { name: "Qty" }),
  ).toBeInTheDocument();
  expect(table.querySelector("tfoot")).toHaveTextContent(
    "Section subtotal$6,100.00Sales tax$518.50Section total$6,618.50",
  );
});
it("narrows the range, requires explicit saving and excludes unselected alternatives from the document", async () => {
  const user = setup();
  const save = screen.getByRole("button", { name: "Save selections" });
  const next = screen.getByRole("button", { name: "Continue to approval" });
  expect(save).toBeDisabled();
  expect(next).toBeDisabled();
  await choose(user);
  expect(screen.getByRole("article")).toHaveTextContent(
    "50% deposit $4,248.00",
  );
  expect(next).toBeDisabled();
  await user.click(save);
  expect(next).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "View estimate" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getAllByRole("table")).toHaveLength(4);
  expect(dialog).not.toHaveTextContent("Solid wood");
  expect(
    within(dialog).getByRole("table", { name: "No installation" }),
  ).toHaveTextContent("$0.00");
  await user.click(screen.getByRole("button", { name: /^Close / }));
  await user.click(
    screen.getByRole("radio", { name: "Select 72″ · Solid wood" }),
  );
  expect(next).toBeDisabled();
  expect(save).toBeEnabled();
});
it("supports native radio keyboard navigation and disables selection while saving", async () => {
  const user = setup();
  const first = screen.getByRole("radio", {
    name: "Select 72″ · Engineered wood",
  });
  await user.click(first);
  await user.keyboard("{ArrowDown}");
  expect(
    screen.getByRole("radio", { name: "Select 72″ · Solid wood" }),
  ).toBeChecked();
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Example state" }),
    "disabled",
  );
  for (const radio of screen.getAllByRole("radio"))
    expect(radio).toBeDisabled();
});
it("shows selected and excluded statuses for read-only estimates and resets back to the full range", async () => {
  const user = setup();
  await choose(user);
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Example state" }),
    "readonly",
  );
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  expect(screen.getAllByText("Selected")).toHaveLength(3);
  expect(screen.getAllByText("Alternative · excluded")).toHaveLength(3);
  expect(
    screen.queryByRole("button", { name: "Save selections" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reset example" }));
  expect(screen.getByRole("article")).toHaveTextContent("$8,496.00–$12,100.00");
});
