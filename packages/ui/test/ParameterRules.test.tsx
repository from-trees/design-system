import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import { Parameters, ThemeProvider } from "../src/index";

it("uses app validation without committing rejected zero or negative values", async () => {
  const committed = vi.fn();
  function Example() {
    const [value, setValue] = useState(12);
    return (
      <ThemeProvider>
        <Parameters
          groups={[
            {
              id: "size",
              label: "Size",
              parameters: [
                {
                  id: "width",
                  label: "Width",
                  value,
                  validate: (next) =>
                    next > 0 ? undefined : "Enter a width greater than zero.",
                  onChange: (next) => {
                    committed(next);
                    setValue(next);
                  },
                },
              ],
            },
          ]}
        />
      </ThemeProvider>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  const input = screen.getByRole("textbox", { name: "Width" });
  for (const invalid of ["0", "-1/2"]) {
    await user.clear(input);
    await user.type(input, `${invalid}{Enter}`);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a width greater than zero.",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Enter a width greater than zero.",
    );
    expect(committed).not.toHaveBeenCalled();
  }
  await user.clear(input);
  await user.type(input, "0.001{Enter}");
  expect(committed).toHaveBeenCalledExactlyOnceWith(0.001);
  expect(input).toHaveValue("0.001");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("shows the app-normalized value when snapping changes or preserves the saved value", async () => {
  const committed = vi.fn();
  function Example() {
    const [value, setValue] = useState(8);
    return (
      <ThemeProvider>
        <Parameters
          groups={[
            {
              id: "position",
              label: "Position",
              parameters: [
                {
                  id: "offset",
                  label: "Offset",
                  value,
                  onChange: (next) => {
                    committed(next);
                    setValue(Math.round(next));
                  },
                },
              ],
            },
          ]}
        />
        <output aria-label="Saved value">{value}</output>
      </ThemeProvider>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  const input = screen.getByRole("textbox", { name: "Offset" });
  for (const [draft, saved] of [
    ["8.25", "8"],
    ["8.75", "9"],
    ["8 1/4", "8"],
  ]) {
    await user.clear(input);
    await user.type(input, `${draft}{Enter}`);
    expect(input).toHaveValue(saved);
    expect(screen.getByLabelText("Saved value")).toHaveTextContent(saved);
  }
  expect(committed).toHaveBeenCalledTimes(3);
  await user.clear(input);
  await user.type(input, "100{Escape}");
  expect(input).toHaveValue("8");
  expect(committed).toHaveBeenCalledTimes(3);
});

it("keeps partial and temporary invalid drafts untouched until focus leaves the field", async () => {
  const committed = vi.fn();
  const validate = vi.fn((next: number) =>
    next > 0 ? undefined : "Enter a positive value.",
  );
  function Example() {
    const [value, setValue] = useState(8);
    return (
      <ThemeProvider>
        <Parameters
          groups={[
            {
              id: "position",
              label: "Position",
              parameters: [
                {
                  id: "offset",
                  label: "Offset",
                  value,
                  validate,
                  onChange: (next) => {
                    committed(next);
                    setValue(Math.round(next));
                  },
                },
              ],
            },
          ]}
        />
        <output aria-label="Saved value">{value}</output>
      </ThemeProvider>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  const input = screen.getByRole("textbox", { name: "Offset" });
  for (const draft of ["0", "-", "8.25"]) {
    await user.clear(input);
    await user.type(input, draft);
    expect(input).toHaveFocus();
    expect(input).toHaveValue(draft);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Saved value")).toHaveTextContent("8");
    expect(validate).not.toHaveBeenCalled();
    expect(committed).not.toHaveBeenCalled();
  }
  await user.tab();
  expect(input).not.toHaveFocus();
  expect(input).toHaveValue("8");
  expect(committed).toHaveBeenCalledExactlyOnceWith(8.25);
  await user.clear(input);
  await user.type(input, "0");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Enter a positive value.",
  );
  await user.click(input);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(input).toHaveValue("0");
  await user.keyboard("{Escape}");
  expect(input).toHaveValue("8");
  expect(committed).toHaveBeenCalledTimes(1);
});
