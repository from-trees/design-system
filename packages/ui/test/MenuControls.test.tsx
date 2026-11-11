import { useState } from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { WorkspaceHeader } from "../src/CommandBar";
import { ThemeProvider } from "../src/theme";
const options = [
  { value: "full", label: "Solid" },
  { value: "ghost", label: "Ghost" },
  { value: "hidden", label: "Hide" },
];
function Example({ action = () => {} }: { action?: () => void }) {
  const [walls, setWalls] = useState("ghost"),
    [objects, setObjects] = useState("ghost");
  return (
    <ThemeProvider>
      <WorkspaceHeader
        title="3D"
        label="3D commands"
        menuLabel="3D navigation"
        actions={[
          { id: "fit", label: "Fit", onAction: action },
          {
            id: "unavailable",
            label: "Unavailable",
            disabled: true,
            onAction: action,
          },
        ]}
        menuGroups={[
          {
            id: "obstruction",
            label: "Obstruction",
            controls: [
              {
                id: "walls",
                label: "Walls",
                value: walls,
                onChange: setWalls,
                options,
              },
              {
                id: "objects",
                label: "Objects",
                value: objects,
                onChange: setObjects,
                options,
              },
            ],
          },
        ]}
      />
    </ThemeProvider>
  );
}
it("keeps two independent button bars inside one header popup, retaining selection without closing", async () => {
  const user = userEvent.setup();
  render(<Example />);
  const trigger = screen.getByRole("button", { name: "3D navigation" });
  expect(screen.queryByRole("radiogroup")).toBeNull();
  await user.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "3D navigation" });
  expect(
    within(dialog).getByRole("group", { name: "Obstruction" }),
  ).toBeInTheDocument();
  const walls = within(dialog).getByRole("radiogroup", { name: "Walls" });
  const objects = within(dialog).getByRole("radiogroup", { name: "Objects" });
  await user.click(within(walls).getByRole("radio", { name: "Solid" }));
  expect(within(walls).getByRole("radio", { name: "Solid" })).toBeChecked();
  expect(within(objects).getByRole("radio", { name: "Ghost" })).toBeChecked();
  await user.click(within(objects).getByRole("radio", { name: "Hide" }));
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(() => expect(trigger).toHaveFocus());
  await user.click(trigger);
  expect(
    within(screen.getByRole("radiogroup", { name: "Objects" })).getByRole(
      "radio",
      { name: "Hide" },
    ),
  ).toBeChecked();
});
it("supports radio arrow keys, disabled actions and closes after a command", async () => {
  const user = userEvent.setup(),
    action = vi.fn();
  render(<Example action={action} />);
  await user.click(screen.getByRole("button", { name: "3D navigation" }));
  expect(screen.getByRole("button", { name: "Unavailable" })).toBeDisabled();
  const walls = screen.getByRole("radiogroup", { name: "Walls" });
  await user.click(within(walls).getByRole("radio", { name: "Ghost" }));
  await user.keyboard("{ArrowRight}");
  expect(within(walls).getByRole("radio", { name: "Hide" })).toBeChecked();
  expect(
    within(screen.getByRole("radiogroup", { name: "Objects" })).getByRole(
      "radio",
      { name: "Ghost" },
    ),
  ).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Fit" }));
  expect(action).toHaveBeenCalledOnce();
  expect(screen.queryByRole("dialog")).toBeNull();
});
