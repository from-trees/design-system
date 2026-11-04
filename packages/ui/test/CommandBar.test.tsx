import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { CommandBar, WorkspaceHeader, TaskHeader } from "../src/CommandBar";
import { ThemeProvider } from "../src/theme";
it("keeps a direct command and one menu, with keyboard and disabled command behavior", async () => {
  const user = userEvent.setup(),
    undo = vi.fn(),
    share = vi.fn();
  render(
    <ThemeProvider>
      <CommandBar
        label="Document commands"
        primary={{ id: "undo", label: "Undo", icon: "undo", onAction: undo }}
        menuLabel="Document actions"
        actions={[
          { id: "share", label: "Share", icon: "share", onAction: share },
          { id: "delete", label: "Remove", disabled: true, onAction: vi.fn() },
        ]}
      />
    </ThemeProvider>,
  );
  const bar = screen.getByRole("toolbar", { name: "Document commands" });
  expect(within(bar).getAllByRole("button")).toHaveLength(2);
  await user.tab();
  expect(screen.getByRole("button", { name: "Undo" })).toHaveFocus();
  await user.keyboard("{ArrowRight}");
  expect(
    screen.getByRole("button", { name: "Document actions" }),
  ).toHaveFocus();
  await user.keyboard("{ArrowLeft}{Enter}");
  expect(undo).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: "Document actions" }));
  expect(screen.getByRole("menuitem", { name: "Remove" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await user.click(screen.getByRole("menuitem", { name: "Share" }));
  expect(share).toHaveBeenCalledOnce();
});
it("retains complete identity/status text while status changes", () => {
  const action = {
    id: "undo",
    label: "Undo",
    icon: "undo" as const,
    onAction: vi.fn(),
  };
  const { rerender } = render(
    <ThemeProvider>
      <WorkspaceHeader
        title="Long document name"
        metadata="Business workspace"
        label="Commands"
        primary={action}
        status={{ label: "Saved", tone: "success" }}
      />
    </ThemeProvider>,
  );
  expect(
    screen.getByRole("heading", { name: "Long document name" }),
  ).toBeInTheDocument();
  rerender(
    <ThemeProvider>
      <WorkspaceHeader
        title="Long document name"
        metadata="Business workspace"
        label="Commands"
        primary={action}
        status={{
          label: "Unable to save. Reconnect and retry from the document menu.",
          tone: "danger",
        }}
      />
    </ThemeProvider>,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Reconnect and retry");
  expect(screen.getByRole("status")).toHaveAttribute(
    "title",
    "Unable to save. Reconnect and retry from the document menu.",
  );
  expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
});
it("gives tasks explicit save/cancel and prevents duplicate commits while busy", async () => {
  const user = userEvent.setup(),
    save = vi.fn(),
    cancel = vi.fn();
  const { rerender } = render(
    <TaskHeader title="Customize cabinet" onCancel={cancel} onSave={save} />,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(save).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(cancel).toHaveBeenCalledOnce();
  rerender(
    <TaskHeader
      title="Customize cabinet"
      onCancel={cancel}
      onSave={save}
      busy
    />,
  );
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  rerender(
    <TaskHeader
      title="Customize cabinet"
      onCancel={cancel}
      onSave={save}
      disabled
      error="Fix invalid dimensions"
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Fix invalid dimensions");
  expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
});
