import { useState } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SendEmailDialog, ThemeProvider, type EmailDraft } from "../src/index";
function mount(
  send = vi
    .fn<(value: EmailDraft) => Promise<void>>()
    .mockResolvedValue(undefined),
  canSend = true,
) {
  const close = vi.fn();
  function Example() {
    const [value, setValue] = useState<EmailDraft>({
      cc: ["owner@example.test"],
      subject: "Estimate EST-1",
      message: "Please review.",
    });
    const [open, setOpen] = useState(true);
    return (
      <ThemeProvider>
        <button>Open composer</button>
        <SendEmailDialog
          open={open}
          onOpenChange={(next) => {
            close(next);
            setOpen(next);
          }}
          to={["customer@example.test"]}
          replyTo="owner@example.test"
          value={value}
          onChange={setValue}
          onSend={send}
          canSend={canSend}
        />
      </ThemeProvider>
    );
  }
  render(<Example />);
  return { send, close };
}
it("adds multiple Cc recipients on blur, removes duplicates and the main recipient, and supports no Cc", async () => {
  const { send } = mount();
  expect(screen.getByLabelText("To")).toHaveAttribute("readonly");
  const cc = screen.getByLabelText("Cc");
  fireEvent.change(cc, {
    target: {
      value: "alex@example.test; ALEX@example.test, customer@example.test",
    },
  });
  fireEvent.blur(cc);
  expect(
    screen.getByRole("button", { name: "Remove alex@example.test from Cc" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Remove ALEX@example.test from Cc" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", {
      name: "Remove customer@example.test from Cc",
    }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Remove owner@example.test from Cc" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Remove alex@example.test from Cc" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Send email" }));
  await waitFor(() =>
    expect(send).toHaveBeenCalledWith({
      cc: [],
      subject: "Estimate EST-1",
      message: "Please review.",
    }),
  );
});
it("commits pending recipients when sending and edits the subject and message", async () => {
  const { send } = mount();
  fireEvent.change(screen.getByLabelText("Cc"), {
    target: { value: "second@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Subject"), {
    target: { value: " Updated subject " },
  });
  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "Updated message" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send email" }));
  await waitFor(() =>
    expect(send).toHaveBeenCalledWith({
      cc: ["owner@example.test", "second@example.test"],
      subject: "Updated subject",
      message: "Updated message",
    }),
  );
});
it("validates Cc after blur or submit rather than during typing, and focuses the invalid field", async () => {
  const { send } = mount();
  const cc = screen.getByLabelText("Cc");
  fireEvent.change(cc, { target: { value: "invalid-address" } });
  expect(
    screen.queryByText(/Enter valid email addresses/),
  ).not.toBeInTheDocument();
  fireEvent.blur(cc);
  expect(screen.getByText(/Enter valid email addresses/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Send email" }));
  expect(send).not.toHaveBeenCalled();
  expect(cc).toHaveFocus();
  fireEvent.change(cc, { target: { value: "valid@example.test" } });
  fireEvent.keyDown(cc, { key: "Enter" });
  expect(
    screen.queryByText(/Enter valid email addresses/),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Remove valid@example.test from Cc" }),
  ).toBeVisible();
});
it("blocks overlapping sends and closing while pending, preserves edits on failure, and permits retry", async () => {
  let reject!: (reason: Error) => void;
  const send = vi
    .fn<(value: EmailDraft) => Promise<void>>()
    .mockImplementationOnce(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    )
    .mockResolvedValue(undefined);
  const { close } = mount(send);
  const button = screen.getByRole("button", { name: "Send email" });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(send).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("Cc")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await act(async () => reject(new Error("Private provider payload")));
  await screen.findByText("Email could not be sent. Please try again.");
  expect(
    screen.queryByText("Private provider payload"),
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("Subject")).toHaveValue("Estimate EST-1");
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(button);
  await waitFor(() => expect(close).toHaveBeenCalledWith(false));
  expect(send).toHaveBeenCalledTimes(2);
});
it("honors document-specific readiness and keeps the send callback untouched", () => {
  const { send } = mount(undefined, false);
  expect(screen.getByRole("button", { name: "Send email" })).toBeDisabled();
  expect(send).not.toHaveBeenCalled();
});
