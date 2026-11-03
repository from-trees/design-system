import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ActionGroup,
  Button,
  Dialog,
  MenuButton,
  Parameters,
  SidePanel,
  ThemeProvider,
  parseMeasurement,
} from "../dist/index.js";
import type { Action } from "./MenuButton";

describe("measurement parsing", () => {
  it.each([
    ["30", 30],
    ["30.5", 30.5],
    ["30 1/2", 30.5],
    ["30-1/2", 30.5],
    ["1/2", 0.5],
    ["-2 1/4", -2.25],
    [".5", 0.5],
    ["-0", -0],
  ])("parses %s", (raw, value) => expect(parseMeasurement(raw)).toBe(value));
  it.each(["", " ", "1/0", "1e999", "NaN", "Infinity", "2abc", "1/2/3", "--2"])(
    "rejects %s",
    (raw) => expect(parseMeasurement(raw)).toBeNull(),
  );
});
describe("action hierarchy", () => {
  const actions = (fn: () => void): Action[] => [
    { id: "save", label: "Save", icon: "save", onAction: fn },
    { id: "copy", label: "Duplicate", icon: "copy", onAction: fn },
    {
      id: "delete",
      label: "Delete",
      icon: "delete",
      destructive: true,
      onAction: fn,
    },
  ];
  it("collapses three actions to a primary and menu", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(
      <ThemeProvider>
        <ActionGroup actions={actions(fn)} primaryId="save" />
      </ThemeProvider>,
    );
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Duplicate" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Duplicate" }),
    );
    expect(fn).toHaveBeenCalledOnce();
  });
  it("supports keyboard dismissal and restores the menu trigger", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <MenuButton label="Object actions" actions={actions(vi.fn())} />
      </ThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Object actions" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("menu")).toBeVisible();
    await user.keyboard("{ArrowDown}{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });
  it("does not activate disabled menu items", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(
      <ThemeProvider>
        <MenuButton
          actions={[
            { id: "delete", label: "Delete", onAction: fn, disabled: true },
          ]}
        />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(
      await screen.findByRole("menuitem", { name: "Delete" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(fn).not.toHaveBeenCalled();
  });
});
describe("parameters", () => {
  it("orders applicable fields, commits fractions and protects against invalid input", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <ThemeProvider>
        <Parameters
          values={{
            offset: { value: 12, onChange: change },
            depth: { value: 24, onChange: change },
            width: { value: 30, min: 1, onChange: change },
          }}
        />
      </ThemeProvider>,
    );
    expect(screen.getAllByRole("textbox").map((e) => e.id)).toEqual(
      ["Width", "Depth", "Offset"].map(
        (label) => screen.getByLabelText(label).id,
      ),
    );
    const width = screen.getByLabelText("Width");
    await user.clear(width);
    await user.type(width, "30 1/2{Enter}");
    expect(change).toHaveBeenLastCalledWith(30.5);
    change.mockClear();
    await user.clear(width);
    await user.type(width, "0{Enter}");
    expect(change).not.toHaveBeenCalled();
    expect(width).toHaveAttribute("aria-invalid", "true");
    await user.keyboard("{Escape}");
    expect(width).toHaveValue("30");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("resets drafts when an external saved value changes", () => {
    const fn = vi.fn();
    const { rerender } = render(
      <Parameters values={{ width: { value: 30, onChange: fn } }} />,
    );
    rerender(<Parameters values={{ width: { value: 36, onChange: fn } }} />);
    expect(screen.getByLabelText("Width")).toHaveValue("36");
  });
});
function OverlayHarness({ side = false }: { side?: boolean }) {
  const [open, setOpen] = useState(false);
  const Surface = side ? SidePanel : Dialog;
  return (
    <ThemeProvider theme="dark">
      <Button onPress={() => setOpen(true)}>Open task</Button>
      <Surface
        title="Example task"
        description="A contextual example"
        open={open}
        onOpenChange={setOpen}
      >
        <Button>Inside task</Button>
      </Surface>
    </ThemeProvider>
  );
}
describe("overlays", () => {
  it.each([false, true])(
    "contains focus and returns it to the opener (side=%s)",
    async (side) => {
      const user = userEvent.setup();
      render(<OverlayHarness side={side} />);
      const trigger = screen.getByRole("button", { name: "Open task" });
      await user.click(trigger);
      const dialog = await screen.findByRole("dialog", {
        name: "Example task",
      });
      expect(dialog).toHaveAccessibleDescription("A contextual example");
      expect(dialog.contains(document.activeElement)).toBe(true);
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      expect(
        within(dialog).getByRole("button", { name: "Inside task" }),
      ).toBeVisible();
      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(trigger).toHaveFocus());
    },
  );
});
