import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ThemeProvider } from "@from-trees/ui";
import { DesignerSidebarPrototype } from "../src/DesignerSidebarPrototype";

const setup = () => {
  render(
    <ThemeProvider>
      <DesignerSidebarPrototype />
    </ThemeProvider>,
  );
  return userEvent.setup();
};
const context = () => screen.getByRole("combobox", { name: "Editing context" });
const selection = () =>
  screen.getByRole("combobox", { name: "Example selection" });
const section = (name: string) =>
  screen.getByText(name, { selector: "summary" });

it("covers every selection fixture and keeps unrelated contexts separate", async () => {
  const user = setup();
  const choices = [...(selection() as HTMLSelectElement).options].map(
    (option) => ({ id: option.value, name: option.textContent! }),
  );
  expect(choices.length).toBeGreaterThanOrEqual(16);
  for (const choice of choices) {
    await user.selectOptions(selection(), choice.id);
    expect(
      screen.getByRole("heading", { name: choice.name }),
    ).toBeInTheDocument();
  }
  await user.selectOptions(context(), "room");
  expect(
    screen.getByRole("button", { name: "Edit room outline" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Object actions" }),
  ).not.toBeInTheDocument();
  await user.selectOptions(context(), "styles");
  expect(
    screen.getByRole("list", { name: "Shared styles" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("textbox", { name: "Width" }),
  ).not.toBeInTheDocument();
});

it("commits numeric edits on blur and retains values across context changes", async () => {
  const user = setup();
  const width = screen.getByRole("textbox", { name: "Width" });
  await user.clear(width);
  await user.type(width, "0");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole("alert")).toHaveTextContent("greater than zero");
  await user.click(width);
  await user.keyboard("{Escape}");
  expect(width).toHaveValue("30");
  await user.clear(width);
  await user.type(width, "30 1/2");
  await user.tab();
  expect(width).toHaveValue("30.5");
  const offset = screen.getByRole("textbox", { name: "Offset from left" });
  expect(offset).toHaveAccessibleDescription(
    expect.stringContaining("nearest 0.125 in"),
  );
  await user.clear(offset);
  await user.type(offset, "12.01");
  expect(offset).toHaveValue("12.01");
  await user.tab();
  expect(offset).toHaveValue("12");
  await user.selectOptions(context(), "room");
  await user.selectOptions(context(), "selection");
  expect(screen.getByRole("textbox", { name: "Width" })).toHaveValue("30.5");
});

it("distinguishes assigning one object from saving or canceling a shared style edit", async () => {
  const user = setup();
  await user.click(section("Appearance"));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Assigned style" }),
    "white",
  );
  await user.click(
    screen.getByRole("button", { name: "Edit assigned shared style" }),
  );
  expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
    expect.stringContaining("affects 2 objects"),
  );
  await user.click(
    screen.getByRole("button", { name: /^(?!About ).*Material$/ }),
  );
  await user.click(screen.getByRole("option", { name: "Walnut" }));
  await user.click(
    screen.getByRole("button", { name: "Close Edit shared style" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Edit assigned shared style" }),
  );
  expect(
    screen.getByRole("button", { name: /^(?!About ).*Material$/ }),
  ).toHaveTextContent("Paint grade");
  await user.click(
    screen.getByRole("button", { name: /^(?!About ).*Material$/ }),
  );
  await user.click(screen.getByRole("option", { name: "Walnut" }));
  await user.click(screen.getByRole("button", { name: "Save shared style" }));
  await user.click(
    screen.getByRole("button", { name: "Edit assigned shared style" }),
  );
  expect(
    screen.getByRole("button", { name: /^(?!About ).*Material$/ }),
  ).toHaveTextContent("Walnut");
});

it("keeps object menu actions functional, including duplicate and confirmed removal", async () => {
  const user = setup();
  await user.click(screen.getByRole("button", { name: "Object actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Rename" }));
  await user.clear(screen.getByRole("textbox", { name: "Name" }));
  await user.type(
    screen.getByRole("textbox", { name: "Name" }),
    "Sink cabinet",
  );
  await user.click(screen.getByRole("button", { name: "Save name" }));
  expect(
    screen.getByRole("heading", { name: "Sink cabinet" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Object actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Duplicate" }));
  expect(
    screen.getByRole("heading", { name: "Sink cabinet copy" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Object actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Remove" }));
  expect(
    screen.getByRole("dialog", { name: "Remove object?" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Remove object" }));
  expect(
    screen.getByRole("heading", { name: "No selection" }),
  ).toBeInTheDocument();
});

it("resolves a section warning through a focused task and discards canceled customization", async () => {
  const user = setup();
  await user.selectOptions(selection(), "attention");
  expect(section("Countertop")).toHaveTextContent("Needs attention");
  await user.click(screen.getByRole("button", { name: "Review countertop" }));
  const overhang = screen.getByRole("textbox", { name: "Overhang" });
  expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await user.clear(overhang);
  await user.type(overhang, "12");
  await user.tab();
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(screen.queryByText(/Needs attention/)).not.toBeInTheDocument();
  expect(context()).toHaveFocus();
  await user.click(section("Construction"));
  await user.click(screen.getByRole("button", { name: "Customize cabinet" }));
  const dialog = screen.getByRole("dialog", { name: "Customize cabinet" });
  const width = within(dialog).getByRole("textbox", { name: "Width" });
  await user.clear(width);
  await user.type(width, "42");
  await user.tab();
  await user.click(
    screen.getByRole("button", { name: "Close Customize cabinet" }),
  );
  expect(screen.getByRole("textbox", { name: "Width" })).toHaveValue("30");
});

it("preserves read-only and generated-object boundaries", async () => {
  const user = setup();
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Access mode" }),
    "read",
  );
  expect(screen.getByRole("textbox", { name: "Width" })).toHaveAttribute(
    "readonly",
  );
  await user.click(section("Appearance"));
  expect(
    screen.getByRole("combobox", { name: "Assigned style" }),
  ).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Object actions" }));
  expect(screen.getByRole("menuitem", { name: "Remove" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await user.keyboard("{Escape}");
  await user.selectOptions(selection(), "automatic");
  expect(
    screen.queryByRole("button", { name: "Object actions" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Thickness" })).toHaveAttribute(
    "readonly",
  );
  await user.click(
    screen.getByRole("button", { name: "Select controlling cabinet" }),
  );
  expect(
    screen.getByRole("heading", { name: "Base cabinet" }),
  ).toBeInTheDocument();
});

it("keeps per-wall overrides separate from room construction defaults", async () => {
  const user = setup();
  await user.selectOptions(context(), "room");
  await user.click(screen.getByRole("button", { name: "Edit room outline" }));
  const thickness = screen.getByRole("textbox", { name: "Thickness" });
  await user.clear(thickness);
  await user.type(thickness, "6");
  await user.tab();
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Example plan wall selection" }),
    "Left wall",
  );
  expect(screen.getByRole("textbox", { name: "Thickness" })).toHaveValue("4.5");
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Example plan wall selection" }),
    "Back wall",
  );
  expect(screen.getByRole("textbox", { name: "Thickness" })).toHaveValue("6");
  await user.click(screen.getByRole("button", { name: "Use room default" }));
  expect(screen.getByRole("textbox", { name: "Thickness" })).toHaveValue("4.5");
});

it("keeps a focused task open when Save blurs an invalid numeric draft", async () => {
  const user = setup();
  await user.click(section("Construction"));
  await user.click(screen.getByRole("button", { name: "Customize cabinet" }));
  const editor = screen.getByRole("dialog", { name: "Customize cabinet" });
  const width = within(editor).getByRole("textbox", { name: "Width" });
  await user.clear(width);
  await user.type(width, "0");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(
    screen.getByRole("dialog", { name: "Customize cabinet" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent("greater than zero");
  await user.clear(width);
  await user.type(width, "42");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Width" })).toHaveValue("42");
});

it("retains visual room and cabinet choices across contexts and respects read-only access", async () => {
  const user = setup();
  const picker = (label: string) =>
    screen.getByRole("button", { name: new RegExp(`^(?!About ).*${label}$`) });
  await user.click(section("Construction"));
  await user.click(picker("Configuration"));
  await user.click(
    screen.getByRole("option", { name: "Drawers", exact: true }),
  );
  expect(picker("Configuration")).toHaveTextContent("Drawers");
  await user.selectOptions(context(), "room");
  await user.click(section("Surfaces"));
  await user.click(picker("Walls"));
  await user.click(screen.getByRole("option", { name: "Sage paint" }));
  await user.click(section("Crown"));
  await user.click(picker("Profile"));
  await user.click(screen.getByRole("option", { name: "Ogee", exact: true }));
  expect(picker("Finish")).toBeEnabled();
  await user.selectOptions(context(), "selection");
  await user.click(section("Construction"));
  expect(picker("Configuration")).toHaveTextContent("Drawers");
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Access mode" }),
    "read",
  );
  expect(picker("Configuration")).toBeDisabled();
  await user.selectOptions(context(), "room");
  await user.click(section("Surfaces"));
  expect(picker("Walls")).toHaveTextContent("Sage paint");
  expect(picker("Walls")).toBeDisabled();
  await user.click(section("Crown"));
  expect(picker("Profile")).toHaveTextContent("Ogee");
});
