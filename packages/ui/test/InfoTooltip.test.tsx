import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InfoTooltip, Parameters, ThemeProvider } from "../src/index";

const reference = "From the start of the parent wall.";
describe("contextual help", () => {
  it("keeps optional detail accessible without changing labels or hiding validation", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Parameters
          groups={[
            {
              id: "placement",
              label: "Placement",
              parameters: [
                {
                  id: "offset",
                  value: 12,
                  min: 0,
                  label: "Offset from left",
                  reference,
                  help: "Follows the wall direction.",
                  onChange: change,
                },
              ],
            },
          ]}
        />
      </ThemeProvider>,
    );
    const input = screen.getByRole("textbox", { name: "Offset from left" });
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining(reference),
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.tab();
    const button = screen.getByRole("button", {
      name: "About Offset from left",
    });
    expect(button).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(reference);
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Follows the wall direction.",
    );
    // First activation must not immediately close help already opened by focus.
    await user.keyboard("{Enter}");
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
    expect(button).toHaveFocus();
    await user.click(input);
    await user.clear(input);
    await user.type(input, "-1{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter 0");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining("Enter 0"),
    );
    expect(change).not.toHaveBeenCalled();
  });

  it("stays open while the pointer moves from the trigger into the explanation", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <InfoTooltip label="Offset">{reference}</InfoTooltip>
      </ThemeProvider>,
    );
    await user.hover(document.body);
    await user.hover(screen.getByRole("button", { name: "About Offset" }));
    const tooltip = await screen.findByRole("tooltip");
    await user.hover(tooltip);
    // Cross the trigger's 150ms close delay to verify hover transfer keeps it open.
    await act(() => new Promise((resolve) => setTimeout(resolve, 200)));
    expect(tooltip).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
  });
});
