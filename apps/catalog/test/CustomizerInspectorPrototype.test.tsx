import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ThemeProvider } from "@from-trees/ui";
import { CustomizerInspectorPrototype } from "../src/CustomizerInspectorPrototype";
import {
  createPart,
  equalHeights,
  resizeDrawer,
} from "../src/CustomizerInspectorModel";
const setup = () => {
  render(
    <ThemeProvider>
      <CustomizerInspectorPrototype />
    </ThemeProvider>,
  );
  return userEvent.setup();
};
const select = (name: string) => screen.getByRole("combobox", { name });
const field = (name: string) =>
  screen.getByRole("textbox", { name, exact: true });
const section = (name: string) =>
  screen.getByText(name, { selector: "summary" });
it("locks room dimensions and validates only after editing, then supports Save and Cancel", async () => {
  const user = setup();
  expect(field("Width")).toHaveAttribute("readonly");
  await user.selectOptions(select("Review scenario"), "Standalone");
  await user.clear(field("Width"));
  await user.type(field("Width"), "0");
  expect(field("Width")).toHaveValue("0");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await user.tab();
  expect(field("Width")).toHaveAttribute("aria-invalid", "true");
  await user.click(screen.getByRole("button", { name: "Save", exact: true }));
  expect(
    screen.getByText("Correct the highlighted field before saving."),
  ).toBeInTheDocument();
  await user.keyboard("{Escape}");
  await user.clear(field("Width"));
  await user.type(field("Width"), "31 1/2");
  await user.tab();
  await user.click(screen.getByRole("button", { name: "Save", exact: true }));
  await user.clear(field("Width"));
  await user.type(field("Width"), "36");
  await user.tab();
  await user.click(screen.getByRole("button", { name: "Cancel", exact: true }));
  expect(field("Width")).toHaveValue("31.5");
});
it("keeps part edits scoped and drawer inheritance distinct from overrides", async () => {
  const user = setup();
  await user.selectOptions(select("Inspect"), "Selected part");
  await user.clear(field("Width"));
  await user.type(field("Width"), "27");
  await user.tab();
  await user.selectOptions(select("Part"), "part-3");
  expect(field("Width")).toHaveValue("28.5");
  await user.selectOptions(select("Part"), "part-1");
  expect(field("Width")).toHaveValue("27");
  await user.selectOptions(select("Part"), "part-2");
  await user.click(section("Front & box"));
  await user.selectOptions(select("Opening method"), "Push-to-open");
  await user.selectOptions(select("Drawer"), "0");
  expect(select("Opening method")).toHaveValue("Use array setting");
  await user.selectOptions(select("Opening method"), "Pulls");
  expect(screen.getByText("Override", { exact: true })).toBeInTheDocument();
  await user.selectOptions(select("Drawer"), "1");
  expect(select("Opening method")).toHaveValue("Use array setting");
  await user.selectOptions(select("Drawer"), "0");
  expect(select("Opening method")).toHaveValue("Pulls");
  await user.click(
    screen.getByRole("button", { name: "Selected part actions" }),
  );
  await user.click(
    screen.getByRole("menuitem", { name: "Reset drawer overrides" }),
  );
  expect(select("Opening method")).toHaveValue("Use array setting");
});
it("does not mark navigation or preview finishes as configuration edits and prevents read-only mutation", async () => {
  const user = setup();
  await user.selectOptions(select("Cabinet view"), "Front");
  await user.selectOptions(select("Movement snapping"), "Off");
  await user.selectOptions(select("Inspect"), "Preview");
  await user.click(screen.getByRole("button", { name: /Material/ }));
  await user.click(screen.getByRole("option", { name: /Walnut/ }));
  expect(
    screen.queryByText("Modified", { exact: true }),
  ).not.toBeInTheDocument();
  await user.selectOptions(select("Review scenario"), "Read only");
  await user.selectOptions(select("Inspect"), "Selected part");
  expect(field("Width")).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Save", exact: true }),
  ).toBeDisabled();
});
it("balances drawer rows without changing the total or violating the fixture minimum", () => {
  const part = createPart("Drawer array", "test");
  const resized = resizeDrawer(part, 0, 24);
  expect(resized.reduce((a, b) => a + b, 0)).toBeCloseTo(30);
  expect(Math.min(...resized)).toBeGreaterThanOrEqual(2);
  expect(
    equalHeights(30.25, 0.125, 4).reduce((a, b) => a + b, 0) + 3 * 0.125,
  ).toBeCloseTo(30.25);
});

it("keeps duplicate identities stable and restores a valid selection on undo", async () => {
  const user = setup();
  await user.selectOptions(select("Inspect"), "Selected part");
  await user.click(
    screen.getByRole("button", { name: "Selected part actions" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "Duplicate part" }));
  expect(select("Part")).toHaveValue("part-6");
  expect(field("Name")).toHaveValue("Door copy");
  await user.click(
    screen.getByRole("button", { name: "Cabinet part actions" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "Undo", exact: true }));
  expect(select("Part")).toHaveValue("part-1");
  expect(field("Name")).toHaveValue("Door");
  await user.click(
    screen.getByRole("button", { name: "Cabinet part actions" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "Redo", exact: true }));
  await user.selectOptions(select("Part"), "part-6");
  expect(field("Name")).toHaveValue("Door copy");
});
