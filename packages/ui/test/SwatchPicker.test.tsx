import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import {
  Dialog,
  ParameterRow,
  SwatchPicker,
  ThemeProvider,
  type SwatchOption,
} from "../src/index";
const options: SwatchOption[] = [
  {
    id: "oak",
    label: "Oak",
    preview: (
      <svg aria-hidden="true">
        <rect width="20" height="20" />
      </svg>
    ),
    description: "Light wood sample.",
  },
  { id: "walnut", label: "Walnut", preview: <span>Visual sample</span> },
  {
    id: "paint",
    label: "Paint",
    preview: <span>Color sample</span>,
    disabled: true,
  },
];
it("inherits row labeling and keeps visual selection controlled", async () => {
  function Example() {
    const [value, setValue] = useState("oak");
    return (
      <ThemeProvider>
        <ParameterRow
          label="Material"
          help="Choose a material."
          error="Review this choice."
        >
          <SwatchPicker value={value} options={options} onChange={setValue} />
        </ParameterRow>
      </ThemeProvider>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  const trigger = screen.getByRole("button", {
    name: /^(?!About ).*Material$/,
  });
  await user.click(screen.getByText("Material", { selector: "label" }));
  expect(trigger).toHaveAccessibleDescription(
    expect.stringContaining("Choose a material. Review this choice."),
  );
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  expect(screen.getByRole("option", { name: "Oak" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(
    screen.getByRole("option", { name: "Oak" }),
  ).toHaveAccessibleDescription("Light wood sample.");
  expect(screen.getByRole("option", { name: "Paint" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await user.click(screen.getByRole("option", { name: "Walnut" }));
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(trigger).toHaveTextContent("Walnut");
  await waitFor(() => expect(trigger).toHaveFocus());
});
it("supports keyboard selection and Escape without committing a preview", async () => {
  const change = vi.fn();
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <SwatchPicker
        label="Finish"
        value="oak"
        options={options}
        onChange={change}
      />
    </ThemeProvider>,
  );
  const trigger = screen.getByRole("button", { name: /Finish/ });
  await user.tab();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("listbox")).toBeInTheDocument();
  await user.keyboard("{End}{Escape}");
  expect(change).not.toHaveBeenCalled();
  await waitFor(() => expect(trigger).toHaveFocus());
  await user.keyboard("{ArrowDown}{End}{Enter}");
  expect(change).toHaveBeenCalledExactlyOnceWith("walnut");
});
it("supports disabled and empty pickers without inventing a selection", () => {
  render(
    <ThemeProvider>
      <SwatchPicker
        label="Locked"
        value="oak"
        options={options}
        onChange={() => {}}
        disabled
      />
      <SwatchPicker
        label="Empty"
        value={null}
        options={[]}
        onChange={() => {}}
      />
    </ThemeProvider>,
  );
  expect(screen.getByRole("button", { name: /Locked/ })).toBeDisabled();
  expect(screen.getByRole("button", { name: /Empty/ })).toBeDisabled();
  expect(screen.getByRole("button", { name: /Empty/ })).toHaveTextContent(
    "No options",
  );
});
it("keeps popup options usable within an actual modal and restores focus", async () => {
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <Dialog title="Style" open onOpenChange={() => {}}>
        <ParameterRow label="Profile">
          <SwatchPicker value="oak" options={options} onChange={() => {}} />
        </ParameterRow>
      </Dialog>
    </ThemeProvider>,
  );
  const trigger = screen.getByRole("button", { name: /Profile/ });
  await user.click(trigger);
  expect(screen.getByRole("option", { name: "Walnut" })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("dialog", { name: "Style" })).toBeInTheDocument();
  await waitFor(() => expect(trigger).toHaveFocus());
});

it("keeps native-dialog pickers inside their modal and supports typeahead", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <ThemeProvider>
      <dialog open aria-label="Native style">
        <SwatchPicker
          label="Material"
          value="oak"
          options={options}
          onChange={change}
        />
      </dialog>
    </ThemeProvider>,
  );
  await user.click(screen.getByRole("button", { name: /Material/ }));
  expect(screen.getByRole("listbox").closest("dialog")).toBe(
    screen.getByRole("dialog", { name: "Native style" }),
  );
  await user.keyboard("wal{Enter}");
  expect(change).toHaveBeenCalledExactlyOnceWith("walnut");
});

it("keeps grouped swatches in one modal picker with previews and disabled choices", async () => {
  const user = userEvent.setup();
  const library = {
    id: "library-walnut",
    label: "Walnut PBR",
    preview: <img src="walnut.png" alt="" />,
  };
  function Example() {
    const [value, setValue] = useState("oak");
    return (
      <ThemeProvider>
        <dialog open aria-label="Grouped style">
          <ParameterRow label="Material">
            <SwatchPicker
              value={value}
              onChange={setValue}
              groups={[
                { id: "built-in", label: "Built-In", options },
                { id: "library", label: "Library", options: [library] },
              ]}
            />
          </ParameterRow>
        </dialog>
      </ThemeProvider>
    );
  }
  render(<Example />);
  const trigger = screen.getByRole("button", { name: /Material/ });
  const modal = screen.getByRole("dialog", { name: "Grouped style" });
  await user.click(trigger);
  expect(screen.getByRole("group", { name: "Built-In" })).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "Library" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Paint" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  expect(screen.getByRole("listbox").closest("dialog")).toBe(modal);
  await user.click(screen.getByRole("option", { name: "Walnut PBR" }));
  expect(trigger).toHaveTextContent("Walnut PBR");
  expect(trigger.querySelector("img")).toHaveAttribute("src", "walnut.png");
  await waitFor(() => expect(trigger).toHaveFocus());
  await user.keyboard("{ArrowDown}{Home}{Enter}");
  expect(trigger).toHaveTextContent("Oak");
  await waitFor(() => expect(trigger).toHaveFocus());
  await user.keyboard("{ArrowDown}{End}{Escape}");
  expect(trigger).toHaveTextContent("Oak");
  await waitFor(() => expect(trigger).toHaveFocus());
  await user.keyboard("{ArrowDown}{End}{Enter}");
  expect(trigger).toHaveTextContent("Walnut PBR");
});
it("disables an empty grouped picker without inventing a selected option", () => {
  render(
    <ThemeProvider>
      <SwatchPicker
        label="Empty groups"
        value={null}
        groups={[{ id: "library", label: "Library", options: [] }]}
        onChange={() => {}}
      />
    </ThemeProvider>,
  );
  expect(screen.getByRole("button", { name: /Empty groups/ })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: /Empty groups/ }),
  ).toHaveTextContent("No options");
});
