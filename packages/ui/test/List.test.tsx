import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { List, ThemeProvider, type ListItem } from "../src/index";

describe("standard lists", () => {
  it("routes menu actions to the correct row and restores focus on dismissal", async () => {
    const inspect = vi.fn(),
      restore = vi.fn();
    const items: ListItem[] = [
      {
        id: "4",
        title: "Revision 4",
        metadata: "Team member · Nov 2",
        status: { label: "Current", tone: "success" },
      },
      ...[3, 2].map(
        (revision): ListItem => ({
          id: String(revision),
          title: `Revision ${revision}`,
          metadata: "Team member · Nov 2",
          actions: [
            {
              id: "inspect",
              label: "Inspect",
              onAction: () => inspect(revision),
            },
            {
              id: "restore",
              label: "Restore",
              onAction: () => restore(revision),
            },
          ],
        }),
      ),
    ];
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <List label="Saved revisions" items={items} />
      </ThemeProvider>,
    );
    const rows = within(
      screen.getByRole("list", { name: "Saved revisions" }),
    ).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText("Current")).toBeVisible();
    expect(within(rows[0]).queryByRole("button")).not.toBeInTheDocument();
    const menu = screen.getByRole("button", { name: "Revision 2 actions" });
    menu.focus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("menu", { name: "Revision 2 actions" }),
    ).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(menu).toHaveFocus());
    await user.click(
      screen.getByRole("button", { name: "Revision 3 actions" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Restore" }));
    expect(restore).toHaveBeenCalledExactlyOnceWith(3);
    expect(inspect).not.toHaveBeenCalled();
  });

  it("keeps inspection available when a row mutation is disabled", async () => {
    const inspect = vi.fn(),
      restore = vi.fn();
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <List
          label="Revisions"
          items={[
            {
              id: "1",
              title: "Revision 1",
              metadata: "Team member · Nov 2",
              actions: [
                { id: "inspect", label: "Inspect", onAction: inspect },
                {
                  id: "restore",
                  label: "Restore",
                  onAction: restore,
                  disabled: true,
                },
              ],
            },
          ]}
        />
      </ThemeProvider>,
    );
    await user.click(
      screen.getByRole("button", { name: "Revision 1 actions" }),
    );
    expect(screen.getByRole("menuitem", { name: "Restore" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.click(screen.getByRole("menuitem", { name: "Inspect" }));
    expect(inspect).toHaveBeenCalledOnce();
    expect(restore).not.toHaveBeenCalled();
  });
});
