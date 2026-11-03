import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import {
  ParameterRow,
  Parameters,
  Select,
  Switch,
  TextInput,
  ThemeProvider,
} from "../src/index";

it("composes real editors with one row label and preserves their interactions", async () => {
  function Example() {
    const [finish, setFinish] = useState("oak");
    const [custom, setCustom] = useState(false);
    return (
      <ThemeProvider>
        <ParameterRow label="Finish">
          <Select
            value={finish}
            onChange={(e) => setFinish(e.currentTarget.value)}
          >
            <option value="oak">Oak</option>
            <option value="paint">Paint</option>
          </Select>
        </ParameterRow>
        <ParameterRow label="Custom back">
          <Switch selected={custom} onChange={setCustom} />
        </ParameterRow>
        {custom && (
          <ParameterRow label="Reference">
            <TextInput defaultValue="A" />
          </ParameterRow>
        )}
      </ThemeProvider>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  expect(screen.getAllByText("Finish")).toHaveLength(1);
  await user.click(screen.getByText("Finish"));
  expect(screen.getByRole("combobox", { name: "Finish" })).toHaveFocus();
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Finish" }),
    "paint",
  );
  expect(screen.getByRole("combobox", { name: "Finish" })).toHaveValue("paint");
  await user.click(screen.getByText("Custom back", { exact: true }));
  expect(screen.getByRole("switch", { name: "Custom back" })).toBeChecked();
  const reference = screen.getByRole("textbox", { name: "Reference" });
  await user.clear(reference);
  await user.type(reference, "B");
  expect(reference).toHaveValue("B");
});

it("accepts mixed schema controls and forwards row help and errors to custom editors", async () => {
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <Parameters
        groups={[
          {
            id: "mixed",
            label: "Settings",
            parameters: [
              { id: "size", label: "Size", value: 12, onChange: () => {} },
              {
                id: "mode",
                label: "Mode",
                help: "Choose an output mode.",
                error: "Choose a mode.",
                control: (
                  <Select defaultValue="">
                    <option value="">Select</option>
                    <option value="fast">Fast</option>
                  </Select>
                ),
              },
              {
                id: "custom",
                label: "Custom editor",
                help: "App-owned behavior.",
                control: (props) => <input {...props} defaultValue="test" />,
              },
              {
                id: "disabled",
                label: "Locked",
                control: <TextInput defaultValue="Fixed" disabled />,
              },
            ],
          },
        ]}
      />
    </ThemeProvider>,
  );
  const mode = screen.getByRole("combobox", { name: "Mode" });
  expect(mode).toHaveAttribute("aria-invalid", "true");
  expect(mode).toHaveAccessibleDescription(
    "Choose an output mode. Choose a mode.",
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Choose a mode.");
  const custom = screen.getByRole("textbox", { name: "Custom editor" });
  expect(custom).toHaveAccessibleDescription("App-owned behavior.");
  await user.click(screen.getByText("Custom editor"));
  expect(custom).toHaveFocus();
  expect(screen.getByRole("textbox", { name: "Locked" })).toBeDisabled();
  expect(screen.getAllByText("Mode")).toHaveLength(1);
});
