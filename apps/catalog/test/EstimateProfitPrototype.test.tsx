import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import { ThemeProvider } from "@from-trees/ui";
import { EstimateProfitPrototype } from "../src/EstimateProfitPrototype";
beforeEach(() => localStorage.clear());
it("reprices only its section, saves independent margins and hides every internal control in customer preview", async () => {
  const user = userEvent.setup();
  const { unmount } = render(
    <ThemeProvider>
      <EstimateProfitPrototype />
    </ThemeProvider>,
  );
  const kitchen = screen.getByRole("slider", {
    name: "ADU kitchen gross margin",
  });
  expect(kitchen).toHaveAttribute("max", "90");
  expect(kitchen).toHaveValue("47.8");
  const laundry = screen.getByRole("slider", { name: "Laundry gross margin" });
  fireEvent.change(kitchen, { target: { value: "50" } });
  expect(laundry).toHaveValue("47.8");
  expect(screen.getAllByText("$700.00")[0]).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Save prices" }));
  unmount();
  render(
    <ThemeProvider>
      <EstimateProfitPrototype />
    </ThemeProvider>,
  );
  expect(
    screen.getByRole("slider", { name: "ADU kitchen gross margin" }),
  ).toHaveValue("50");
  await user.click(screen.getByRole("button", { name: "Customer preview" }));
  const preview = screen.getByRole("dialog", {
    name: "Customer estimate preview",
  });
  expect(within(preview).queryByRole("slider")).not.toBeInTheDocument();
  expect(
    within(preview).queryByRole("columnheader", { name: "Cost" }),
  ).not.toBeInTheDocument();
  expect(
    within(preview).queryByRole("columnheader", { name: "Profit %" }),
  ).not.toBeInTheDocument();
});
