import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, IconButton } from "./Button";
import { Dialog } from "./Overlay";
import { TextInput } from "./Field";
import { Status } from "./Feedback";
import { layout, gap } from "./utilities";
import { color, metrics } from "./tokens.stylex";

export type EmailDraft = { cc: string[]; subject: string; message: string };
export type SendEmailDialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  title?: string;
  to: readonly string[];
  replyTo?: string;
  value: EmailDraft;
  onChange(value: EmailDraft): void;
  onSend(value: EmailDraft): Promise<void>;
  sendLabel?: string;
  canSend?: boolean;
  /** Document-specific summaries, readiness notices and confirmations remain app-owned. */
  summary?: ReactNode;
  notice?: ReactNode;
  error?: string;
};
const styles = stylex.create({
  text: {
    margin: 0,
    fontSize: metrics.small,
    lineHeight: 1.5,
    color: color.muted,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: metrics.small,
    color: color.muted,
  },
  message: {
    boxSizing: "border-box",
    width: "100%",
    minHeight: 130,
    resize: "vertical",
    padding: 10,
    font: "inherit",
    color: color.ink,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 2,
  },
  recipient: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    paddingInline: 8,
    paddingBlock: 2,
    backgroundColor: color.canvas,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
  },
  address: { overflowWrap: "anywhere", minWidth: 0, fontSize: metrics.small },
});
const addressPattern = /^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/;
const unique = (values: readonly string[], to: readonly string[]) => {
  const seen = new Set(to.map((address) => address.trim().toLowerCase()));
  return values
    .map((address) => address.trim())
    .filter((address) => {
      const key = address.toLowerCase();
      if (!address || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

/** Presentation and editing only. Apps authorize recipients and own immutable delivery/retry identity. */
export function SendEmailDialog({
  open,
  onOpenChange,
  title = "Send email",
  to,
  replyTo,
  value,
  onChange,
  onSend,
  sendLabel = "Send email",
  canSend = true,
  summary,
  notice,
  error,
}: SendEmailDialogProps) {
  const [entry, setEntry] = useState("");
  const [ccError, setCcError] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [sendError, setSendError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false),
    mounted = useRef(true),
    openRef = useRef(open);
  const ccId = useId(),
    subjectId = useId();
  const messageId = useId();
  openRef.current = open;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (open) {
      setEntry("");
      setCcError("");
      setSubjectError("");
      setSendError("");
    }
  }, [open]);
  const commit = () => {
    const additions = entry
      .split(/[,;\r\n]+/)
      .map((address) => address.trim())
      .filter(Boolean);
    if (
      [...value.cc, ...additions].some(
        (address) => !addressPattern.test(address.trim()),
      )
    ) {
      setCcError(
        "Enter valid email addresses, separated by commas or semicolons.",
      );
      return null;
    }
    const next = { ...value, cc: unique([...value.cc, ...additions], to) };
    setEntry("");
    setCcError("");
    onChange(next);
    return next;
  };
  const send = async () => {
    if (pending.current || !canSend || !to.length) return;
    const next = commit();
    if (!next) {
      document.getElementById(ccId)?.focus();
      return;
    }
    if (!next.subject.trim() || /[\r\n]/.test(next.subject)) {
      setSubjectError("Enter a single-line subject.");
      document.getElementById(subjectId)?.focus();
      return;
    }
    pending.current = true;
    setBusy(true);
    setSendError("");
    setSubjectError("");
    try {
      await onSend({ ...next, subject: next.subject.trim() });
      if (mounted.current && openRef.current) onOpenChange(false);
    } catch {
      if (mounted.current)
        setSendError("Email could not be sent. Please try again.");
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <Dialog
      title={title}
      description="Review the recipients and message before sending."
      open={open}
      onOpenChange={(next) => {
        if (!pending.current) onOpenChange(next);
      }}
      dismissible={!busy}
      footer={
        <>
          <Button isDisabled={busy} onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            busy={busy}
            isDisabled={busy || !canSend || !to.length || !value.subject.trim()}
            onPress={() => void send()}
          >
            {sendLabel}
          </Button>
        </>
      }
    >
      <div {...stylex.props(layout.stack, gap.md)}>
        <TextInput label="To" value={to.join(", ")} readOnly />
        <div {...stylex.props(layout.stack, gap.sm)}>
          <TextInput
            id={ccId}
            label="Cc"
            value={entry}
            disabled={busy}
            error={ccError}
            help="Optional. Add email addresses separated by commas or semicolons."
            onChange={(event) => setEntry(event.target.value)}
            onBlur={() => {
              if (!pending.current) commit();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              }
            }}
          />
          {value.cc.length > 0 && (
            <div
              role="list"
              aria-label="Cc recipients"
              {...stylex.props(layout.row, layout.wrap, gap.sm)}
            >
              {value.cc.map((address) => (
                <div
                  key={address}
                  role="listitem"
                  {...stylex.props(styles.recipient)}
                >
                  <span {...stylex.props(styles.address)}>{address}</span>
                  <IconButton
                    label={`Remove ${address} from Cc`}
                    icon="close"
                    isDisabled={busy}
                    onPress={() =>
                      onChange({
                        ...value,
                        cc: value.cc.filter((item) => item !== address),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {replyTo && (
          <p {...stylex.props(styles.text)}>Replies go to {replyTo}.</p>
        )}
        <TextInput
          id={subjectId}
          label="Subject"
          value={value.subject}
          disabled={busy}
          error={subjectError}
          onChange={(event) =>
            onChange({ ...value, subject: event.target.value })
          }
          onBlur={() => {
            if (!value.subject.trim()) setSubjectError("Enter a subject.");
            else setSubjectError("");
          }}
        />
        <label htmlFor={messageId} {...stylex.props(styles.label)}>
          Message
          <textarea
            id={messageId}
            {...stylex.props(styles.message)}
            value={value.message}
            disabled={busy}
            onChange={(event) =>
              onChange({ ...value, message: event.target.value })
            }
          />
        </label>
        {summary}
        {notice}
        {(error || sendError) && (
          <Status tone="danger">{error || sendError}</Status>
        )}
      </div>
    </Dialog>
  );
}
