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
it("applies exact numeric values on blur, synchronizes dragging, and rejects invalid entries", () => {
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
            onChange={setValue}
            aria-label="Margin"
            valueInput={{ label: "Exact margin", suffix: "%" }}
          />
        </ParameterRow>
      </ThemeProvider>
    );
  }
  render(<Example />);
  const input = screen.getByRole("textbox", { name: "Exact margin" }),
    slider = screen.getByRole("slider", { name: "Margin" });
  expect(input.id).not.toBe(slider.id);
  expect(input).toHaveAttribute("type", "text");
  expect(input).toHaveAttribute("inputmode", "decimal");
  fireEvent.change(input, { target: { value: "52.3" } });
  expect(slider).toHaveValue("47.8");
  fireEvent.blur(input);
  expect(slider).toHaveValue("52.3");
  fireEvent.change(slider, { target: { value: "60.1" } });
  expect(input).toHaveValue("60.1");
  for (const value of ["91", "-1", "", "abc", "0x10", "Infinity"]) {
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(slider).toHaveValue("60.1");
  }
  fireEvent.keyDown(input, { key: "Escape" });
  expect(input).toHaveValue("60.1");
  expect(input).not.toHaveAttribute("aria-invalid");
  fireEvent.change(input, { target: { value: "47.85" } });
  fireEvent.blur(input);
  expect(input).toHaveValue("47.9");
});
