import {
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import {
  Breadcrumbs,
  GroupedNavigation,
  WorkspaceLayout,
  type NavigationGroup,
} from "../src";
const groups: NavigationGroup[] = [
  {
    id: "work",
    label: "Work",
    href: "#work",
    items: [
      {
        id: "estimates",
        label: "Estimates",
        href: "#estimates",
        icon: "document",
      },
      { id: "invoices", label: "Invoices", href: "#invoices", icon: "receipt" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: "#settings",
    items: [
      { id: "billing", label: "Subscription & billing", href: "#billing" },
    ],
  },
];
it("renders real group/leaf links with one current page and intercepts only ordinary activations", () => {
  const navigate = vi.fn();
  render(
    <GroupedNavigation
      groups={groups}
      activeId="estimates"
      onNavigate={navigate}
    />,
  );
  expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
    "href",
    "#work",
  );
  const estimates = screen.getByRole("link", { name: "Estimates" });
  expect(estimates).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "Invoices" })).not.toHaveAttribute(
    "aria-current",
  );
  fireEvent.click(estimates);
  expect(navigate).toHaveBeenCalledWith(
    expect.objectContaining({ id: "estimates", href: "#estimates" }),
  );
  navigate.mockClear();
  fireEvent.click(estimates, { ctrlKey: true });
  fireEvent.click(estimates, { metaKey: true });
  fireEvent.click(estimates, { shiftKey: true });
  fireEvent.click(estimates, { button: 1 });
  expect(navigate).not.toHaveBeenCalled();
});
it("supports keyboard navigation and exposes a modal drawer with focus restoration", async () => {
  const user = userEvent.setup(),
    navigate = vi.fn();
  render(
    <WorkspaceLayout
      title="Example shop"
      groups={groups}
      activeId="estimates"
      onNavigate={navigate}
    >
      <h1>Estimates</h1>
    </WorkspaceLayout>,
  );
  const button = screen.getByRole("button", {
    name: "Open workspace navigation",
  });
  await user.click(button);
  const drawer = screen.getByRole("dialog", { name: "Workspace navigation" });
  const invoices = within(drawer).getByRole("link", { name: "Invoices" });
  invoices.focus();
  await user.keyboard("{Enter}");
  expect(navigate).toHaveBeenCalledWith(
    expect.objectContaining({ id: "invoices" }),
  );
  expect(
    screen.queryByRole("dialog", { name: "Workspace navigation" }),
  ).not.toBeInTheDocument();
  await waitFor(() => expect(button).toHaveFocus());
  await user.click(button);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await waitFor(() => expect(button).toHaveFocus());
});
it("keeps breadcrumbs semantic and marks only the final destination current", () => {
  const navigate = vi.fn();
  render(
    <Breadcrumbs
      onNavigate={navigate}
      items={[
        { id: "work", label: "Work", href: "#work" },
        { id: "estimate", label: "EST-1001" },
      ]}
    />,
  );
  expect(screen.getByText("EST-1001")).toHaveAttribute("aria-current", "page");
  fireEvent.click(screen.getByRole("link", { name: "Work" }));
  expect(navigate).toHaveBeenCalledWith({ id: "work", href: "#work" });
});
