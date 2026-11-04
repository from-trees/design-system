import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ThemeProvider } from "@from-trees/ui";
import { CustomerJourneyPrototype } from "../src/CustomerJourneyPrototype";
const setup = () => {
  render(
    <ThemeProvider>
      <CustomerJourneyPrototype />
    </ThemeProvider>,
  );
  return userEvent.setup();
};
const scenario = () =>
  screen.getByRole("combobox", { name: "Review scenario" });
it("guides review to explicit consent and simulated confirmation without treating navigation as a signature", async () => {
  const user = setup();
  expect(
    screen.queryByRole("button", { name: /Deposit:/ }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Continue to approval" }),
  );
  expect(
    screen.getByRole("button", { name: "Review approval" }),
  ).toBeDisabled();
  await user.type(
    screen.getByRole("textbox", { name: "Full name" }),
    "Example Customer",
  );
  for (const check of screen.getAllByRole("checkbox")) await user.click(check);
  await user.click(screen.getByRole("button", { name: "Review approval" }));
  expect(
    screen.queryByRole("button", { name: "Continue to secure checkout" }),
  ).not.toBeInTheDocument();
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Simulate signature",
    }),
  );
  expect(
    screen.getByRole("button", { name: "Continue to secure checkout" }),
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: /Review estimate: Complete/ }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Review your estimate" }),
    ).toHaveFocus(),
  );
  await user.click(screen.getByRole("button", { name: /Deposit: Next step/ }));
  await user.click(
    screen.getByRole("button", { name: "Continue to secure checkout" }),
  );
  expect(screen.getByRole("dialog")).toHaveTextContent(
    "Closing checkout does not mark a deposit paid",
  );
});
it("does not offer another payment while processing or unresolved and never equates deposit with full payment", async () => {
  const user = setup();
  await user.selectOptions(scenario(), "Payment processing");
  expect(screen.getByText(/Do not submit another deposit/)).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Continue to secure checkout" }),
  ).not.toBeInTheDocument();
  await user.selectOptions(scenario(), "Payment needs review");
  expect(screen.getByText(/A new checkout is unavailable/)).toBeInTheDocument();
  await user.selectOptions(scenario(), "Deposit paid");
  expect(
    screen.getByText(/This does not mean the project balance is paid/),
  ).toBeInTheDocument();
  await user.selectOptions(scenario(), "Payment failed");
  expect(
    screen.getByRole("button", { name: "Try deposit payment again" }),
  ).toBeInTheDocument();
});
it("keeps blocked estimates readable and omits payment for approval-only flows", async () => {
  const user = setup();
  for (const state of ["Expired", "Superseded", "Preparing agreement"]) {
    await user.selectOptions(scenario(), state);
    expect(
      screen.getByRole("button", { name: "View estimate" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Continue to approval" }),
    ).not.toBeInTheDocument();
  }
  await user.selectOptions(scenario(), "Approval only");
  expect(
    within(
      screen.getByRole("navigation", { name: "Your estimate progress" }),
    ).queryByText("Deposit"),
  ).not.toBeInTheDocument();
  await user.selectOptions(scenario(), "No deposit required");
  expect(
    screen.queryByRole("button", { name: "Continue to secure checkout" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("Deposit $4,000 · Balance $8,000"),
  ).not.toBeInTheDocument();
});

it("shows all six stages without claiming future production or delivery updates", async () => {
  const user = setup();
  const nav = screen.getByRole("navigation", {
    name: "Your estimate progress",
  });
  expect(within(nav).getAllByRole("listitem")).toHaveLength(6);
  await user.selectOptions(scenario(), "Deposit paid");
  await user.click(
    screen.getByRole("button", { name: /Production queue: Next step/ }),
  );
  expect(
    screen.getByText(/A paid deposit alone does not confirm/),
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: /Production: Upcoming/ }),
  );
  expect(
    screen.getByText(/does not currently track production automatically/),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Delivery: Upcoming/ }));
  expect(
    screen.getByText(/does not currently track delivery automatically/),
  ).toBeInTheDocument();
});
