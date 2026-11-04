import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ThemeProvider, WorkflowProgress, type WorkflowStep } from "../src";
it("announces app-owned progress and only permits eligible navigation", async () => {
  const user = userEvent.setup(),
    onSelect = vi.fn();
  const steps: WorkflowStep[] = [
    { id: "review", label: "Review", status: "complete", available: true },
    { id: "sign", label: "Sign", status: "current", available: true },
    {
      id: "pay",
      label: "Pay",
      status: "upcoming",
      available: false,
      detail: "After signing",
    },
  ];
  const { container, rerender } = render(
    <ThemeProvider>
      <WorkflowProgress
        label="Progress"
        steps={steps}
        selectedId="sign"
        onSelect={onSelect}
      />
    </ThemeProvider>,
  );
  expect(
    screen.getByRole("navigation", { name: "Progress" }),
  ).toBeInTheDocument();
  expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  expect(screen.queryByRole("button", { name: /Pay/ })).not.toBeInTheDocument();
  expect(
    screen.getByText("After signing").closest('[aria-disabled="true"]'),
  ).toBeInTheDocument();
  await user.tab();
  await user.keyboard("{Enter}");
  expect(onSelect).toHaveBeenCalledWith("review");
  expect(steps[1].status).toBe("current");
  rerender(
    <ThemeProvider>
      <WorkflowProgress
        label="Progress"
        steps={[{ ...steps[0], status: "attention", detail: "Needs review" }]}
        selectedId="review"
        onSelect={onSelect}
      />
    </ThemeProvider>,
  );
  expect(
    screen.getByRole("button", { name: /Needs attention/ }),
  ).toBeInTheDocument();
});
