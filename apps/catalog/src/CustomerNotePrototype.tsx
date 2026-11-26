import { useId, useRef, useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Badge,
  Button,
  IconButton,
  NavigableSidePanel,
  Panel,
  Select,
  Status,
  Switch,
  TextArea,
  TextInput,
} from "@from-trees/ui";
import { color, metrics, space } from "@from-trees/ui/tokens.stylex";
import { layout, gap } from "@from-trees/ui/utilities";

const customer = "Cedar Row Studio";
const assignees = ["Maya Chen", "Jordan Lee"];
const maxFileBytes = 100 * 1024 * 1024;
const sampleFile = { id: "sample", name: "finish-options.pdf" };

type Attachment = { id: string; name: string };
type FollowUp = { due: string; description: string; assignee: string };
type Note = {
  id: number;
  title: string;
  body: string;
  files: Attachment[];
  followUp?: FollowUp;
};
const existingNote: Note = {
  id: 0,
  title: "Finish sample request",
  body: "Maya asked to see a lighter white oak finish before approving the kitchen cabinetry.",
  files: [],
};

const styles = stylex.create({
  heading: { margin: 0, color: color.ink, fontSize: metrics.font },
  text: { margin: 0, color: color.ink, overflowWrap: "anywhere" },
  muted: { margin: 0, color: color.muted, fontSize: metrics.small },
  body: { whiteSpace: "pre-wrap" },
  toolbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: space.sm,
  },
  details: {
    padding: space.md, borderWidth: 1, borderStyle: "solid", borderColor: color.border,
    borderRadius: metrics.radius, backgroundColor: color.subtle,
  },
  list: { listStyle: "none", margin: 0, padding: 0 },
  listRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: space.sm,
    paddingBlock: space.xs, borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: color.border,
  },
});

const dueFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric",
  hour: "numeric", minute: "2-digit", timeZone: "UTC",
});

function formatPacificWallTime(due: string) {
  // The input is already Pacific wall time. Use UTC for formatting without converting it.
  return `${dueFormatter.format(new Date(`${due}Z`))} PT`;
}

function NoteComposer({ formId, onSave }: {
  formId: string;
  onSave: (note: Omit<Note, "id">) => void;
}) {
  const [title, setTitle] = useState("Note");
  const [body, setBody] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [due, setDue] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState("");
  const picker = useRef<HTMLInputElement>(null);

  function addFiles(attachments: Attachment[]) {
    setFiles((current) => {
      const byId = new Map(current.map((file) => [file.id, file]));
      for (const file of attachments) byId.set(file.id, file);
      return [...byId.values()];
    });
  }

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !body.trim() || (scheduling && (!due || !description.trim()))) return;
    onSave({
      title: title.trim(),
      body: body.trim(),
      files,
      followUp: scheduling ? { due, description: description.trim(), assignee } : undefined,
    });
  };

  return (
    <form id={formId} onSubmit={save} {...stylex.props(layout.stack, gap.lg)}>
      <TextInput label="Note title" required value={title} onChange={(event) => setTitle(event.target.value)} />
      <TextArea
        label="Note body"
        required
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <div {...stylex.props(layout.stack, gap.md)}>
        <Switch label="Schedule follow-up" selected={scheduling} onChange={setScheduling} />
        {scheduling && (
          <div {...stylex.props(layout.stack, gap.md, styles.details)}>
            <TextInput
              label="Due date and time"
              help="Pacific time"
              type="datetime-local"
              required
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />
            <TextInput
              label="Follow-up description"
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Select label="Assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)}>
              <option value="">Unassigned</option>
              {assignees.map((person) => <option key={person}>{person}</option>)}
            </Select>
          </div>
        )}
      </div>
      <div {...stylex.props(layout.stack, gap.sm)}>
        <h3 {...stylex.props(styles.heading)}>Attachments</h3>
        <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
          <Button icon="add" onPress={() => picker.current?.click()}>Attach files</Button>
          <Button variant="ghost" onPress={() => addFiles([sampleFile])} isDisabled={files.some((file) => file.id === sampleFile.id)}>
            Use sample PDF
          </Button>
        </div>
        <input
          ref={picker}
          type="file"
          hidden
          multiple
          aria-label="Choose files to attach"
          onChange={(event) => {
            const selected = Array.from(event.currentTarget.files ?? []);
            const oversized = selected.filter((file) => file.size > maxFileBytes);
            setFileError(oversized.length ? `${oversized.map((file) => file.name).join(", ")} could not be added. The limit is 100 MB per file.` : "");
            addFiles(selected.filter((file) => file.size <= maxFileBytes).map((file) => ({
              id: JSON.stringify([file.name, file.size, file.lastModified]),
              name: file.name,
            })));
            event.currentTarget.value = "";
          }}
        />
        {fileError && <Status tone="danger">{fileError}</Status>}
        <p aria-live="polite" {...stylex.props(styles.muted)}>
          {files.length === 0 ? "No attachments yet." : `${files.length} ${files.length === 1 ? "file" : "files"} attached.`}
        </p>
        {files.length > 0 && (
          <ul aria-label="Attached files" {...stylex.props(styles.list)}>
            {files.map((file) => (
              <li key={file.id} {...stylex.props(styles.listRow)}>
                <span {...stylex.props(styles.text)}>{file.name}</span>
                <IconButton icon="close" label={`Remove ${file.name}`} onPress={() => setFiles((current) => current.filter((entry) => entry.id !== file.id))} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}

export function CustomerNotePrototype() {
  const [page, setPage] = useState<"closed" | "summary" | "add-note">("closed");
  const [notes, setNotes] = useState<Note[]>([existingNote]);
  const [saved, setSaved] = useState<{ followUp: boolean }>();
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [failed, setFailed] = useState<{ noteId: number; file: Attachment }[]>([]);
  const formId = useId();
  const composing = page === "add-note";
  const returnToSummary = () => setPage("summary");

  return (
    <>
      <Panel title="Customers">
        <div {...stylex.props(styles.toolbar)}>
          <Button variant="ghost" onPress={returnToSummary}>{customer}</Button>
          <Badge tone="success">Active</Badge>
        </div>
        <Switch
          label="Simulate an attachment upload failure"
          selected={simulateFailure}
          onChange={setSimulateFailure}
        />
      </Panel>
      <NavigableSidePanel
        open={page !== "closed"}
        onOpenChange={(open) => { if (!open) setPage(composing ? "summary" : "closed"); }}
        title={composing ? "Add note" : customer}
        description={composing ? customer : "Summary"}
        pageKey={page}
        back={composing ? { label: "Back to Summary", onPress: returnToSummary } : undefined}
        footer={composing ? (
          <>
            <Button onPress={returnToSummary}>Cancel</Button>
            <Button variant="primary" icon="save" type="submit" form={formId}>Save note</Button>
          </>
        ) : undefined}
      >
        {composing ? (
          <NoteComposer formId={formId} onSave={(note) => {
            const failedFile = simulateFailure ? note.files.at(-1) : undefined;
            const noteId = notes.length;
            setNotes((current) => [{
              ...note,
              id: noteId,
              files: failedFile ? note.files.slice(0, -1) : note.files,
            }, ...current]);
            if (failedFile) setFailed((current) => [...current, { noteId, file: failedFile }]);
            setSaved({ followUp: Boolean(note.followUp) });
            returnToSummary();
          }} />
        ) : (
          <div {...stylex.props(layout.stack, gap.lg)}>
            {saved && failed.length === 0 && (
              <Status tone="success">{saved.followUp ? "Note saved and follow-up scheduled." : "Note saved."}</Status>
            )}
            <div {...stylex.props(styles.toolbar)}>
              <h3 {...stylex.props(styles.heading)}>Recent notes</h3>
              <Button variant="primary" icon="add" onPress={() => {
                setSaved(undefined);
                setPage("add-note");
              }}>Add note</Button>
            </div>
            {notes.map((note) => (
              <article key={note.id} {...stylex.props(layout.stack, gap.sm, styles.details)}>
                <h4 {...stylex.props(styles.heading)}>{note.title}</h4>
                <p {...stylex.props(styles.text, styles.body)}>{note.body}</p>
                {note.followUp && (
                  <div {...stylex.props(layout.stack, gap.xs)}>
                    <div><Badge tone="success">Follow-up scheduled</Badge></div>
                    <p {...stylex.props(styles.text)}>{note.followUp.description}</p>
                    <p {...stylex.props(styles.muted)}>{formatPacificWallTime(note.followUp.due)} · {note.followUp.assignee || "Unassigned"}</p>
                  </div>
                )}
                {failed.filter((entry) => entry.noteId === note.id).map((entry) => (
                  <div key={entry.file.id} {...stylex.props(layout.stack, gap.sm)}>
                    <Status tone="warning">Note saved. {entry.file.name} could not be uploaded.</Status>
                    <div>
                      <Button onPress={() => {
                        setNotes((current) => current.map((item) =>
                          item.id === entry.noteId
                            ? { ...item, files: [...item.files, entry.file] }
                            : item,
                        ));
                        setFailed((current) => current.filter((pending) => pending !== entry));
                      }}>Retry attachment</Button>
                    </div>
                  </div>
                ))}
                {note.files.length > 0 && (
                  <ul aria-label="Note attachments" {...stylex.props(styles.list)}>
                    {note.files.map((file) => <li key={file.id} {...stylex.props(styles.text)}>{file.name}</li>)}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </NavigableSidePanel>
    </>
  );
}
