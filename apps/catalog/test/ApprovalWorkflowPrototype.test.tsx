import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import { ThemeProvider } from "@from-trees/ui";
import { ApprovalWorkflowPrototype } from "../src/ApprovalWorkflowPrototype";
beforeEach(() => localStorage.clear());
it("saves step one, resumes a closed draft, permits going back and blocks incomplete future steps", async () => {
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <ApprovalWorkflowPrototype />
    </ThemeProvider>,
  );
  const trigger = screen.getByRole("button", { name: "Create new approval" });
  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", {
    name: "New design approval",
  });
  expect(
    within(dialog).getByRole("button", { name: "Save and continue" }),
  ).toBeDisabled();
  expect(
    within(dialog).queryByRole("button", { name: /Connect designs:/ }),
  ).not.toBeInTheDocument();
  await user.type(screen.getByLabelText("Approval name"), "Bathroom vanity");
  await user.selectOptions(screen.getByLabelText("Customer"), "demo");
  await user.click(screen.getByRole("button", { name: "Save and continue" }));
  await screen.findByRole("heading", { name: "Connect designs" });
  expect(
    screen.getByRole("button", { name: "Continue to final review" }),
  ).toBeDisabled();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
  await user.click(
    screen.getByRole("button", { name: "Resume Bathroom vanity" }),
  );
  await screen.findByRole("heading", { name: "Connect designs" });
  await user.selectOptions(
    screen.getByLabelText("Add Cabinitron design"),
    "Natural oak vanity",
  );
  await user.selectOptions(
    screen.getByLabelText("Add Cabinitron design"),
    "Walnut vanity",
  );
  await user.click(
    screen.getByRole("button", { name: "Continue to packages" }),
  );
  expect(
    screen.getByRole("button", { name: "Continue to final review" }),
  ).toBeDisabled();
  expect(
    screen.queryByRole("button", { name: /Finalize approval request:/ }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getAllByRole("button", { name: "Generate customer package" })[0],
  );
  expect(
    screen.getByRole("button", { name: "Continue to final review" }),
  ).toBeDisabled();
  await user.click(
    screen.getByRole("button", { name: "Generate customer package" }),
  );
  await user.click(screen.getByRole("button", { name: "Back" }));
  await user.click(
    screen.getByRole("button", { name: /Start approval: Complete/ }),
  );
  expect(screen.getByLabelText("Approval name")).toHaveValue("Bathroom vanity");
  await user.click(
    screen.getByRole("button", { name: /Generate customer packages:/ }),
  );
  expect(screen.getAllByText("Customer package ready")).toHaveLength(2);
  await user.click(
    screen.getByRole("button", { name: "Continue to final review" }),
  );
  expect(
    screen.queryByRole("button", { name: /Send to customer:/ }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Save approval request" }),
  );
  expect(
    screen.getByRole("button", { name: "Send to customer" }),
  ).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "Send to customer" }));
  expect(
    await screen.findByRole("dialog", { name: "Send approval to customer" }),
  ).toBeVisible();
});

it("supports uploaded-only approvals and skips package generation in both directions", async () => {
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <ApprovalWorkflowPrototype />
    </ThemeProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Create new approval" }));
  await user.type(screen.getByLabelText("Approval name"), "External design");
  await user.selectOptions(screen.getByLabelText("Customer"), "demo");
  await user.click(screen.getByRole("button", { name: "Save and continue" }));
  expect(
    screen.getByRole("button", { name: "Continue to final review" }),
  ).toBeDisabled();
  await user.upload(
    screen.getByLabelText("Other design documents"),
    new File(["%PDF-1.7"], "Architect drawings.pdf", {
      type: "application/pdf",
    }),
  );
  await user.click(
    screen.getByRole("button", { name: "Continue to final review" }),
  );
  expect(
    screen.getByRole("heading", { name: "Finalize approval request" }),
  ).toBeVisible();
  expect(screen.getByText("Architect drawings.pdf")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: /Generate customer packages:/ }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(
    screen.getByRole("heading", { name: "Connect designs" }),
  ).toBeVisible();
  expect(screen.getByText("Architect drawings.pdf")).toBeVisible();
});
