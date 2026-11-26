import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ThemeProvider } from "@from-trees/ui";
import { CustomerNotePrototype } from "../src/CustomerNotePrototype";

async function openComposer() {
  render(<ThemeProvider><CustomerNotePrototype /></ThemeProvider>);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Cedar Row Studio" }));
  await user.click(screen.getByRole("button", { name: "Add note" }));
  return { user, editor: within(screen.getByRole("dialog", { name: "Add note" })) };
}

it("returns to Summary with the new note, Pacific follow-up and remaining attachment", async () => {
  const { user, editor } = await openComposer();
  const title = editor.getByRole("textbox", { name: "Note title" });
  await user.clear(title);
  await user.type(title, "Finish choices");
  await user.type(editor.getByRole("textbox", { name: "Note body" }), "Send two finish choices.");
  await user.click(editor.getByRole("switch", { name: "Schedule follow-up" }));
  await user.click(editor.getByRole("button", { name: "Save note" }));
  expect(screen.getByRole("dialog", { name: "Add note" })).toBeInTheDocument();
  fireEvent.change(editor.getByLabelText("Due date and time"), { target: { value: "2026-12-01T14:30" } });
  await user.type(editor.getByRole("textbox", { name: "Follow-up description" }), "Call about samples");
  await user.selectOptions(editor.getByRole("combobox", { name: "Assignee" }), "Jordan Lee");
  await user.click(editor.getByRole("button", { name: "Use sample PDF" }));
  await user.upload(editor.getByLabelText("Choose files to attach"), new File(["sample"], "site-photo.png", { type: "image/png" }));
  expect(editor.getByRole("list", { name: "Attached files" })).toHaveTextContent("site-photo.png");
  await user.click(editor.getByRole("button", { name: "Remove finish-options.pdf" }));
  await user.click(editor.getByRole("button", { name: "Save note" }));

  const summary = within(screen.getByRole("dialog", { name: "Cedar Row Studio" }));
  expect(summary.getByText("Summary")).toBeVisible();
  expect(summary.getByRole("status")).toHaveTextContent("Note saved and follow-up scheduled.");
  const newNote = within(summary.getAllByRole("article")[0]);
  expect(newNote.getByRole("heading", { name: "Finish choices" })).toBeVisible();
  expect(newNote.getByText("Call about samples")).toBeVisible();
  expect(newNote.getByText(/Dec 1, 2026.*2:30 PM PT · Jordan Lee/)).toBeVisible();
  expect(newNote.getByRole("list", { name: "Note attachments" })).toHaveTextContent("site-photo.png");
  expect(newNote.queryByText("finish-options.pdf")).not.toBeInTheDocument();
});

it("returns to the same Summary on cancel and opens a fresh draft next time", async () => {
  const { user, editor } = await openComposer();
  await user.type(editor.getByRole("textbox", { name: "Note body" }), "Unsaved note");
  await user.click(editor.getByRole("switch", { name: "Schedule follow-up" }));
  await user.click(editor.getByRole("button", { name: "Use sample PDF" }));
  await user.click(editor.getByRole("button", { name: "Cancel" }));

  const summary = within(screen.getByRole("dialog", { name: "Cedar Row Studio" }));
  expect(summary.getByText("Summary")).toBeVisible();
  expect(summary.getAllByRole("article")).toHaveLength(1);
  expect(summary.queryByRole("status")).not.toBeInTheDocument();
  await user.click(summary.getByRole("button", { name: "Add note" }));
  const fresh = within(screen.getByRole("dialog", { name: "Add note" }));
  expect(fresh.getByRole("textbox", { name: "Note body" })).toHaveValue("");
  expect(fresh.getByRole("switch", { name: "Schedule follow-up" })).not.toBeChecked();
  expect(fresh.queryByRole("list", { name: "Attached files" })).not.toBeInTheDocument();
});
