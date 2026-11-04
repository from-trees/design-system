import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ThemeProvider } from "@from-trees/ui";
import { DesignerToolbarPrototype } from "../src/DesignerToolbarPrototype";
const setup = () => {
  render(
    <ThemeProvider>
      <DesignerToolbarPrototype />
    </ThemeProvider>,
  );
  return userEvent.setup();
};
const select = (name: string) => screen.getByRole("combobox", { name });
it("places through one add menu, supports cancel/undo/redo and retains state across views", async () => {
  const user = setup();
  await user.click(screen.getByRole("button", { name: "Add to room" }));
  await user.click(screen.getByRole("menuitem", { name: "Cabinet" }));
  expect(
    screen.getByRole("button", { name: "Place item in plan" }),
  ).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(
    screen.queryByRole("button", { name: "Place item in plan" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Add to room" }));
  await user.click(screen.getByRole("menuitem", { name: "Cabinet" }));
  await user.click(screen.getByRole("button", { name: "Place item in plan" }));
  expect(screen.getByText(/4 objects/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Undo" }));
  expect(screen.getByText(/3 objects/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Project actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Redo" }));
  expect(screen.getByText(/4 objects/)).toBeInTheDocument();
  await user.selectOptions(select("Workspace view"), "Elevation");
  expect(
    screen.getByRole("heading", { name: "Elevations" }),
  ).toBeInTheDocument();
  await user.selectOptions(select("Workspace view"), "Split");
  expect(screen.getByText(/4 objects/)).toBeInTheDocument();
});
it("keeps public/customer capabilities distinct and recovers failed saves through the menu", async () => {
  const user = setup();
  await user.selectOptions(select("Save state"), "error");
  await user.click(screen.getByRole("button", { name: "Project actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Retry saving" }));
  expect(select("Save state")).toHaveValue("saved");
  await user.selectOptions(select("Access scenario"), "Anonymous draft");
  await user.click(screen.getByRole("button", { name: "Project actions" }));
  expect(
    screen.queryByRole("menuitem", { name: "Save business project" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("menuitem", { name: "Share room" })).toBeEnabled();
  await user.keyboard("{Escape}");
  await user.selectOptions(select("Access scenario"), "Customer view");
  await user.click(screen.getByRole("button", { name: "Project actions" }));
  expect(
    screen.queryByRole("menuitem", { name: "History & sharing" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("menuitem", { name: "Create editable copy" }),
  ).toBeEnabled();
  await user.keyboard("{Escape}");
  await user.selectOptions(
    select("Access scenario"),
    "Customer view · copies disabled",
  );
  await user.click(screen.getByRole("button", { name: "Project actions" }));
  expect(
    screen.queryByRole("menuitem", { name: "Create editable copy" }),
  ).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Add to room" }));
  expect(screen.getByRole("menuitem", { name: "Cabinet" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});
it("saves views through a focused task and confirms deletion", async () => {
  const user = setup();
  await user.click(screen.getByRole("button", { name: "Saved view actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Save current view" }));
  await user.clear(screen.getByRole("textbox", { name: "Name" }));
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Island view");
  await user.click(
    within(screen.getByRole("dialog", { name: "Save current view" })).getByRole(
      "button",
      { name: "Save" },
    ),
  );
  expect(select("Saved view")).toHaveValue("view-3");
  await user.click(screen.getByRole("button", { name: "Saved view actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Delete saved view" }));
  expect(
    screen.getByRole("dialog", { name: "Delete saved view?" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Confirm" }));
  expect(select("Saved view")).toHaveValue("current");
});
it("customizer has one task header and discards or saves its part draft", async () => {
  const user = setup();
  const open = async () => {
    await user.click(screen.getByRole("button", { name: "Workspace tools" }));
    await user.click(
      screen.getByRole("menuitem", { name: "Customize cabinet" }),
    );
  };
  await open();
  expect(
    screen.queryByRole("toolbar", { name: "Project commands" }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Cabinet part actions" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "Add part" }));
  expect(screen.getByText(/9 parts/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  await open();
  expect(screen.getByText(/8 parts/)).toBeInTheDocument();
  await user.selectOptions(select("Task validation"), "invalid");
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  await user.selectOptions(select("Task validation"), "valid");
  await user.click(
    screen.getByRole("button", { name: "Cabinet part actions" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "Add part" }));
  await user.click(screen.getByRole("button", { name: "Save" }));
  await open();
  expect(screen.getByText(/9 parts/)).toBeInTheDocument();
});
