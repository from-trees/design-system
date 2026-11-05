import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import { WorkspaceNavigationPrototype } from "../src/WorkspaceNavigationPrototype";
import {
  businessPath,
  demoPrefix,
  readWorkspace,
  workspaceGroups,
  workspaceHref,
} from "../src/workspaceNavigationModel";
const path = businessPath + "/work/estimates";
beforeEach(() => window.history.replaceState(null, "", workspaceHref(path)));
it("restores direct record section, saved revision and table criteria on reload", () => {
  const url = workspaceHref(
    path + "/estimates-1",
    new URLSearchParams(
      "detail=activity&revision=2&estimates.q=kitchen&estimates.page=2&estimates.pageSize=10&estimates.filter.status.in=Draft&estimates.sort=total&estimates.direction=ascending",
    ),
  );
  window.history.replaceState(null, "", url);
  const rendered = render(<WorkspaceNavigationPrototype />);
  expect(screen.getByRole("dialog", { name: "EST-1001" })).toBeInTheDocument();
  expect(screen.getByRole("radio", { name: "Activity" })).toBeChecked();
  expect(screen.getByLabelText("Saved revision")).toHaveValue("2");
  rendered.unmount();
  render(<WorkspaceNavigationPrototype />);
  expect(screen.getByRole("radio", { name: "Activity" })).toBeChecked();
  expect(readWorkspace().query).toMatchObject({
    search: "kitchen",
    page: 2,
    pageSize: 10,
    sort: { key: "total", direction: "ascending" },
    filters: { status: { operator: "in", value: ["Draft"] } },
  });
});
it("opens a record from its list and closes it without losing the list state", async () => {
  const user = userEvent.setup();
  window.history.replaceState(
    null,
    "",
    workspaceHref(
      path,
      new URLSearchParams(
        "estimates.pageSize=10&estimates.page=2&estimates.sort=name&estimates.direction=ascending",
      ),
    ),
  );
  render(<WorkspaceNavigationPrototype />);
  const opener = screen.getByRole("button", { name: "EST-1011 actions" });
  await user.click(opener);
  await user.click(screen.getByRole("menuitem", { name: "Open" }));
  expect(window.location.hash).toContain("/estimates/estimates-11");
  await user.click(screen.getByRole("radio", { name: "Activity" }));
  expect(window.location.hash).toContain("detail=activity");
  await user.click(screen.getByRole("button", { name: "Close record" }));
  expect(window.location.hash).not.toContain("detail=");
  expect(readWorkspace().query.page).toBe(2);
  expect(readWorkspace().query.pageSize).toBe(10);
  await waitFor(() => expect(opener.closest("tr")).toHaveFocus());
});
it("restores page and record navigation with browser Back/Forward", async () => {
  const user = userEvent.setup();
  render(<WorkspaceNavigationPrototype />);
  await user.click(screen.getByRole("button", { name: "EST-1001 actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Open" }));
  await user.click(screen.getByRole("radio", { name: "Activity" }));
  expect(screen.getByRole("radio", { name: "Activity" })).toBeChecked();
  act(() => window.history.back());
  await waitFor(() =>
    expect(screen.getByRole("radio", { name: "Overview" })).toBeChecked(),
  );
  act(() => window.history.forward());
  await waitFor(() =>
    expect(screen.getByRole("radio", { name: "Activity" })).toBeChecked(),
  );
});
it("supports every group and leaf URL including contacts, and rejects unavailable records/businesses", () => {
  for (const group of workspaceGroups) {
    expect(readWorkspace(workspaceHref(group.href)).notFound).toBeFalsy();
    for (const item of group.items)
      expect(readWorkspace(workspaceHref(item.href)).tab?.id).toBe(item.id);
  }
  expect(
    readWorkspace(
      workspaceHref(businessPath + "/customers/directory/directory-1"),
    ).record?.name,
  ).toBe("Alex Morgan");
  for (const bad of [
    path + "/missing",
    "/t/other-shop/app/work/estimates/estimates-1",
    path + "/estimates-1/extra",
    path + "/estimates-1?detail=invalid",
    path + "/estimates-1?revision=invalid",
  ])
    expect(readWorkspace(workspaceHref(bad)).notFound).toBeTruthy();
  window.history.replaceState(null, "", workspaceHref(path + "/missing"));
  render(<WorkspaceNavigationPrototype />);
  expect(
    screen.getByRole("heading", { name: "Destination unavailable" }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("warns about invalid table criteria, restores hash navigation, and keeps customer-related work contextual", async () => {
  const user = userEvent.setup();
  window.history.replaceState(
    null,
    "",
    workspaceHref(path, new URLSearchParams("estimates.page=0")),
  );
  render(<WorkspaceNavigationPrototype />);
  expect(
    screen.getByText("Invalid table criteria. Showing the default table view."),
  ).toBeInTheDocument();
  act(() => {
    window.history.replaceState(
      null,
      "",
      demoPrefix + businessPath + "/customers/directory/directory-1",
    );
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  const panel = screen.getByRole("dialog", { name: "Alex Morgan" });
  await user.click(within(panel).getByRole("radio", { name: "Related" }));
  await user.click(screen.getByRole("button", { name: "EST-1001 actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Open EST-1001" }));
  expect(screen.getByRole("dialog", { name: "EST-1001" })).toBeInTheDocument();
  expect(window.location.hash).toContain("/work/estimates/estimates-1");
});

it("restores nested customer contact/address links and retains historical document revisions", async () => {
  const user = userEvent.setup(),
    customerPath = businessPath + "/customers/directory/directory-1";
  window.history.replaceState(
    null,
    "",
    workspaceHref(customerPath + "/contacts/directory-1-secondary"),
  );
  const { unmount } = render(<WorkspaceNavigationPrototype />);
  expect(
    await screen.findByRole("dialog", { name: "Casey Morgan" }),
  ).toHaveTextContent("casey@example.test");
  unmount();
  render(<WorkspaceNavigationPrototype />);
  await screen.findByRole("dialog", { name: "Casey Morgan" });
  await user.click(screen.getByRole("button", { name: "Close detail" }));
  expect(window.location.hash).toContain("detail=contacts");
  expect(screen.getByRole("radio", { name: "Contacts" })).toBeChecked();
  await user.click(screen.getByRole("radio", { name: "Addresses" }));
  await user.click(
    screen.getByRole("button", { name: "Billing address actions" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "View address" }));
  expect(readWorkspace().subrecord?.id).toBe("directory-1-billing");
  expect(
    screen.getByRole("dialog", { name: "Billing address" }),
  ).toHaveTextContent("100 Example Lane");
  await user.click(screen.getByRole("button", { name: "Close detail" }));
  await user.click(screen.getByRole("radio", { name: "Related" }));
  await user.click(screen.getByRole("button", { name: "EST-1001 actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Open EST-1001" }));
  expect(readWorkspace()).toMatchObject({
    record: { name: "EST-1001" },
    revision: "2",
  });
  expect(screen.getByLabelText("Saved revision")).toHaveValue("2");
  expect(
    readWorkspace(
      workspaceHref(customerPath + "/contacts/directory-2-secondary"),
    ).notFound,
  ).toBe(true);
});
it("keeps customer archive visibility and secondary-contact search in the URL", async () => {
  const user = userEvent.setup();
  window.history.replaceState(
    null,
    "",
    workspaceHref(businessPath + "/customers/directory"),
  );
  render(<WorkspaceNavigationPrototype />);
  expect(
    screen.queryByRole("button", { name: "Riley Kim actions" }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("switch", { name: "Include archived customers" }),
  );
  expect(window.location.hash).toContain("includeArchived=1");
  expect(
    screen.getByRole("button", { name: "Riley Kim actions" }),
  ).toBeInTheDocument();
  await user.type(
    screen.getByRole("searchbox", { name: "Search Customers" }),
    "casey@example.test{Enter}",
  );
  expect(readWorkspace().query.search).toBe("casey@example.test");
  expect(
    screen.getByRole("button", { name: "Alex Morgan actions" }),
  ).toBeInTheDocument();
});
