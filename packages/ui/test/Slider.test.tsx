import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ParameterRow, Slider, ThemeProvider } from "../src/index";
it("composes parameter labeling and preserves decimal slider values with a formatted output", () => {
  function Example() {
    const [value, setValue] = useState(47.8);
    return (
      <ThemeProvider>
        <ParameterRow label="Gross margin" help="0–90% in 0.1% increments">
          <Slider
            value={value}
            min={0}
            max={90}
            step={0.1}
            formatValue={(n) => `${n.toFixed(1)}%`}
            onChange={setValue}
          />
        </ParameterRow>
      </ThemeProvider>
    );
  }
  render(<Example />);
  const slider = screen.getByRole("slider", { name: "Gross margin" });
  expect(slider).toHaveAttribute("step", "0.1");
  expect(slider).toHaveAttribute("aria-valuetext", "47.8%");
  fireEvent.change(slider, { target: { value: "50.1" } });
  expect(slider).toHaveAttribute("aria-valuetext", "50.1%");
  expect(screen.getByText("50.1%")).toBeVisible();
});
