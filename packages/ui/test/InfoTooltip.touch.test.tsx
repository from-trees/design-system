import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect } from "vitest";
import { Dialog, InfoTooltip, ThemeProvider } from "../src/index";

// Touch suppresses emulated mouse hover globally, so use a separate DOM for touch checks.
const reference = "From the start of the parent wall.";
it("opens by touch and dismisses help before the containing dialog", async () => {
  function Example() {
    const [open, setOpen] = useState(true);
    return (
      <ThemeProvider>
        <Dialog title="Edit dimensions" open={open} onOpenChange={setOpen}>
          <InfoTooltip label="Offset">{reference}</InfoTooltip>
          <button>Other field</button>
        </Dialog>
      </ThemeProvider>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  const button = screen.getByRole("button", { name: "About Offset" });
  await user.pointer([
    { keys: "[TouchA>]", target: button },
    { keys: "[/TouchA]" },
  ]);
  expect(await screen.findByRole("tooltip")).toHaveTextContent(reference);
  await user.click(screen.getByRole("button", { name: "Other field" }));
  await waitFor(() =>
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
  );
  expect(screen.getByRole("dialog", { name: "Edit dimensions" })).toBeVisible();
  await user.click(button);
  expect(await screen.findByRole("tooltip")).toBeVisible();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
  );
  expect(screen.getByRole("dialog", { name: "Edit dimensions" })).toBeVisible();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
});
