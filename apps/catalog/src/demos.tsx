import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  ActionGroup,
  Badge,
  Button,
  Dialog,
  Icon,
  IconButton,
  MenuButton,
  Panel,
  Parameters,
  Section,
  SegmentedControl,
  Select,
  SidePanel,
  Status,
  Switch,
  TextInput,
  type Action,
  type IconName,
  type ParameterKey,
} from "@from-trees/ui";
import { s } from "./styles";
import type { PageId } from "./content";
export type ExampleState = "default" | "disabled" | "error" | "loading";
function Stack({ children }: { children: React.ReactNode }) {
  return <div {...stylex.props(s.stack)}>{children}</div>;
}
const iconNames: IconName[] = [
  "add",
  "close",
  "copy",
  "delete",
  "save",
  "export",
  "share",
  "history",
  "settings",
  "undo",
  "redo",
  "more",
  "width",
  "height",
  "depth",
  "offset",
  "ground",
  "rotation",
];
export function Foundations() {
  return (
    <Stack>
      <div>
        <h2 {...stylex.props(s.heading)}>Semantic color</h2>
        <div {...stylex.props(s.grid)}>
          {[
            ["Accent", "#315d46"],
            ["Canvas", "#f6f7f5"],
            ["Ink", "#202c25"],
            ["Border", "#d8dfd7"],
          ].map(([label, value]) => (
            <div key={label}>
              <div {...stylex.props(s.swatch(value))} />
              <div {...stylex.props(s.row, s.between)}>
                <p {...stylex.props(s.small)}>{label}</p>
                <p {...stylex.props(s.small)}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 {...stylex.props(s.heading)}>One icon vocabulary</h2>
        <div {...stylex.props(s.iconGrid)}>
          {iconNames.map((name) => (
            <div key={name} {...stylex.props(s.iconTile)}>
              <Icon name={name} size={20} />
              {name}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 {...stylex.props(s.heading)}>Spacing & density</h2>
        <p {...stylex.props(s.text)}>
          4 · 8 · 12 · 16 · 24 · 32 px. Comfortable controls are 38 px high;
          compact controls are 32 px. Keep clear focus indicators and readable
          labels at either density.
        </p>
      </div>
    </Stack>
  );
}
export function ParameterDemo({
  state = "default",
  subset = false,
  objectType = "base",
}: {
  state?: ExampleState;
  subset?: boolean;
  objectType?: "base" | "wall";
}) {
  const [values, setValues] = useState<Record<ParameterKey, number>>({
    width: 30,
    height: objectType === "wall" ? 30 : 34.5,
    depth: objectType === "wall" ? 12 : 24,
    offset: 12,
    heightFromFloor: 0,
    setback: 0,
    rotation: 0,
  });
  const [changed, setChanged] = useState("");
  return (
    <Stack>
      <Parameters
        values={Object.fromEntries(
          (subset
            ? (["width", "height", "depth"] as ParameterKey[])
            : (Object.keys(values) as ParameterKey[])
          ).map((key) => [
            key,
            {
              value: values[key],
              min: ["width", "height", "depth"].includes(key) ? 1 : undefined,
              disabled: state === "disabled",
              readOnly: state === "loading",
              onChange: (value: number) => {
                setValues((v) => ({ ...v, [key]: value }));
                setChanged(
                  `${key === "heightFromFloor" ? "Height from floor" : key[0].toUpperCase() + key.slice(1)} updated`,
                );
              },
              ...(key === "offset"
                ? {
                    label: "Offset from left",
                    reference: "From the start of the parent wall.",
                  }
                : {}),
            },
          ]),
        )}
      />
      {state === "error" ? (
        <Status tone="danger">
          Try entering 0 for width to inspect validation.
        </Status>
      ) : changed ? (
        <Status tone="success">{changed}</Status>
      ) : (
        <p {...stylex.props(s.small)}>
          Try 30 1/2, 30.5 or 1/2. Enter to commit; Escape to reset.
        </p>
      )}
    </Stack>
  );
}
export function ButtonsDemo({ state }: { state: ExampleState }) {
  const [message, setMessage] = useState("");
  return (
    <Stack>
      <div>
        <p {...stylex.props(s.eyebrow)}>Primary & secondary</p>
        <div {...stylex.props(s.row)}>
          <Button
            icon="save"
            variant="primary"
            busy={state === "loading"}
            isDisabled={state === "disabled"}
            onPress={() => setMessage("Changes saved")}
          >
            Save
          </Button>
          <Button
            onPress={() => setMessage("Changes discarded")}
            isDisabled={state === "disabled"}
          >
            Cancel
          </Button>
        </div>
      </div>
      <div>
        <p {...stylex.props(s.eyebrow)}>Familiar actions</p>
        <ActionGroup
          label="Object actions"
          actions={(
            [
              {
                id: "copy",
                label: "Duplicate",
                icon: "copy",
                onAction: () => setMessage("Object duplicated"),
              },
              {
                id: "delete",
                label: "Delete",
                icon: "delete",
                destructive: true,
                onAction: () => setMessage("Object deleted"),
              },
              {
                id: "export",
                label: "Export",
                icon: "export",
                onAction: () => setMessage("Export requested"),
              },
            ] satisfies Action[]
          ).map((a) => ({ ...a, disabled: state === "disabled" }))}
        />
      </div>
      <div>
        <p {...stylex.props(s.eyebrow)}>Icon controls · hover or focus</p>
        <div {...stylex.props(s.row)}>
          <IconButton
            icon="undo"
            label="Undo"
            onPress={() => setMessage("Undone")}
            isDisabled={state === "disabled"}
          />
          <IconButton
            icon="redo"
            label="Redo"
            onPress={() => setMessage("Redone")}
            isDisabled={state === "disabled"}
          />
        </div>
      </div>
      {message && <Status tone="success">{message}</Status>}
    </Stack>
  );
}
export function MenusDemo({ state }: { state: ExampleState }) {
  const [message, setMessage] = useState("");
  const actions: Action[] = [
    {
      id: "save",
      label: "Save",
      icon: "save",
      onAction: () => setMessage("Changes saved"),
    },
    {
      id: "copy",
      label: "Duplicate",
      icon: "copy",
      onAction: () => setMessage("Duplicate created"),
    },
    {
      id: "share",
      label: "Share",
      icon: "share",
      onAction: () => setMessage("Sharing selected"),
    },
    {
      id: "delete",
      label: "Delete",
      icon: "delete",
      destructive: true,
      separatorBefore: true,
      onAction: () => setMessage("Delete selected"),
    },
  ].map((a) => ({ ...a, disabled: state === "disabled" })) as Action[];
  return (
    <Stack>
      <div {...stylex.props(s.row, s.between)}>
        <div>
          <h2 {...stylex.props(s.heading)}>Cabinet actions</h2>
          <p {...stylex.props(s.small)}>Four actions. Two visible controls.</p>
        </div>
        <ActionGroup
          actions={actions}
          primaryId="save"
          label="Cabinet actions"
        />
      </div>
      <div {...stylex.props(s.row, s.between)}>
        <p {...stylex.props(s.text)}>A row with no primary action</p>
        <MenuButton label="Design actions" actions={actions.slice(1)} />
      </div>
      {message && <Status tone="success">{message}</Status>}
    </Stack>
  );
}
export function FieldsDemo({ state }: { state: ExampleState }) {
  const [name, setName] = useState("Kitchen renovation");
  const [finish, setFinish] = useState("oak");
  const [overlay, setOverlay] = useState(true);
  const [view, setView] = useState("plan");
  return (
    <Stack>
      <TextInput
        label="Project name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        disabled={state === "disabled"}
        error={
          state === "error"
            ? "A project with this name already exists."
            : undefined
        }
        readOnly={state === "loading"}
      />
      <Select
        label="Finish"
        value={finish}
        onChange={(e) => setFinish(e.currentTarget.value)}
        disabled={state === "disabled"}
      >
        <option value="oak">Natural oak</option>
        <option value="walnut">Walnut</option>
        <option value="paint">Paint</option>
      </Select>
      <Switch
        label="Show dimensions"
        selected={overlay}
        onChange={setOverlay}
        disabled={state === "disabled"}
      />
      <div>
        <p {...stylex.props(s.eyebrow)}>
          View mode · a choice, not an action group
        </p>
        <SegmentedControl
          label="View mode"
          value={view}
          onChange={setView}
          options={[
            { value: "plan", label: "Plan" },
            { value: "split", label: "Split" },
            { value: "three", label: "3D" },
          ].map((o) => ({ ...o, disabled: state === "disabled" }))}
        />
      </div>
    </Stack>
  );
}
export function SidebarDemo({
  state,
  objectType = "base",
}: {
  state: ExampleState;
  objectType?: "base" | "wall";
}) {
  const [finish, setFinish] = useState("oak");
  const [custom, setCustom] = useState(true);
  return (
    <Panel
      title={objectType === "wall" ? "Wall cabinet" : "Base cabinet"}
      actions={
        <MenuButton
          label="Base cabinet actions"
          actions={[
            {
              id: "duplicate",
              label: "Duplicate",
              icon: "copy",
              onAction: () => setCustom(false),
            },
            {
              id: "delete",
              label: "Delete",
              icon: "delete",
              disabled: true,
              onAction: () => {},
            },
          ]}
        />
      }
    >
      <ParameterDemo state={state} subset objectType={objectType} />
      <Section title="Appearance" collapsible>
        <Select
          label="Finish"
          value={finish}
          onChange={(e) => setFinish(e.currentTarget.value)}
        >
          <option value="oak">Natural oak</option>
          <option value="walnut">Walnut</option>
        </Select>
      </Section>
      <Section title="Construction" collapsible modified={custom}>
        <Switch
          label="Custom back thickness"
          selected={custom}
          onChange={setCustom}
        />
        {custom && <TextInput label="Back thickness (in)" defaultValue="0.5" />}
      </Section>
    </Panel>
  );
}
export function OverlayDemo() {
  const [dialog, setDialog] = useState(false);
  const [panel, setPanel] = useState(false);
  const [name, setName] = useState("Kitchen renovation");
  const [message, setMessage] = useState("");
  return (
    <Stack>
      <div {...stylex.props(s.row)}>
        <Button icon="edit" onPress={() => setDialog(true)}>
          Rename
        </Button>
        <Button icon="history" onPress={() => setPanel(true)}>
          History & sharing
        </Button>
      </div>
      <p {...stylex.props(s.text)}>
        Open either surface, navigate with Tab, then close with Escape. The
        original trigger regains focus.
      </p>
      {message && <Status tone="success">{message}</Status>}
      <Dialog
        title="Rename project"
        description="A focused task without leaving your place."
        open={dialog}
        onOpenChange={setDialog}
        footer={
          <>
            <Button onPress={() => setDialog(false)}>Cancel</Button>
            <Button
              variant="primary"
              isDisabled={!name.trim()}
              onPress={() => {
                setDialog(false);
                setMessage(`Renamed to ${name}`);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <TextInput
          label="Project name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          autoFocus
        />
      </Dialog>
      <HistoryPanel open={panel} onOpenChange={setPanel} name={name} />
    </Stack>
  );
}
export function HistoryPanel({
  open,
  onOpenChange,
  name,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
}) {
  const [tab, setTab] = useState("history");
  const [current, setCurrent] = useState(4);
  const [revisions, setRevisions] = useState([4, 3, 2, 1]);
  const [restored, setRestored] = useState(false);
  const [created, setCreated] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<number | null>(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        "https://example.invalid/view/demo-project",
      );
      setMessage("Example link copied");
    } catch {
      setMessage("Copy unavailable. Select the example URL manually.");
    }
  };
  return (
    <>
      <SidePanel
        title="History & sharing"
        description={`${name} · revision ${current}`}
        open={open && confirm === null}
        onOpenChange={onOpenChange}
      >
        <Stack>
          <div {...stylex.props(s.notice)}>
            <Icon name="info" />
            Interactive example. Links and revisions exist only in this demo.
          </div>
          <SegmentedControl
            label="History and sharing section"
            value={tab}
            onChange={(v) => {
              setTab(v);
              setMessage("");
            }}
            options={[
              { value: "history", label: "History", icon: "history" },
              { value: "links", label: "Customer links", icon: "link" },
            ]}
          />
          {tab === "history" ? (
            <>
              <p {...stylex.props(s.text)}>
                Restoring creates a new current revision. Previous saves remain
                available.
              </p>
              {revisions.map((revision) => (
                <div key={revision} {...stylex.props(s.row, s.between)}>
                  <div>
                    <strong>Revision {revision}</strong>
                    <p {...stylex.props(s.small)}>
                      {revision === current && restored
                        ? "Restored just now"
                        : "Example team member · Nov 2"}
                    </p>
                  </div>
                  {revision === current ? (
                    <Badge tone="success">Current</Badge>
                  ) : (
                    <MenuButton
                      label={`Revision ${revision} actions`}
                      actions={[
                        {
                          id: "view",
                          label: "Inspect revision",
                          icon: "view",
                          onAction: () =>
                            setMessage(
                              `Revision ${revision} selected for inspection. Production integration supplies the viewer.`,
                            ),
                        },
                        {
                          id: "restore",
                          label: "Restore",
                          icon: "history",
                          onAction: () => setConfirm(revision),
                        },
                      ]}
                    />
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <p {...stylex.props(s.text)}>
                Customer links show the latest saved project and allow viewing
                only.
              </p>
              <Button
                icon="add"
                variant="primary"
                isDisabled={created && !revoked}
                onPress={() => {
                  setCreated(true);
                  setRevoked(false);
                  setMessage("Example customer link created");
                }}
              >
                Create link
              </Button>
              {created ? (
                <Panel
                  title="Customer link"
                  actions={
                    <Badge tone={revoked ? "neutral" : "success"}>
                      {revoked ? "Revoked" : "Active"}
                    </Badge>
                  }
                >
                  <TextInput
                    label="Example URL"
                    autoFocus
                    value="https://example.invalid/view/demo-project"
                    readOnly
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <ActionGroup
                    actions={[
                      {
                        id: "copy",
                        label: "Copy link",
                        icon: "copy",
                        disabled: revoked,
                        onAction: () => void copy(),
                      },
                      {
                        id: "revoke",
                        label: "Revoke",
                        icon: "delete",
                        destructive: true,
                        disabled: revoked,
                        onAction: () => {
                          setRevoked(true);
                          setMessage("Example link revoked");
                        },
                      },
                    ]}
                  />
                </Panel>
              ) : (
                <p {...stylex.props(s.small)}>No customer links yet.</p>
              )}
            </>
          )}
          {message && <Status tone="success">{message}</Status>}
        </Stack>
      </SidePanel>
      <Dialog
        title="Restore revision?"
        description={`Revision ${confirm} will become a new current revision.`}
        open={confirm !== null}
        onOpenChange={(value) => {
          if (!value) setConfirm(null);
        }}
        footer={
          <>
            <Button onPress={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="primary"
              icon="history"
              onPress={() => {
                setRevisions((previous) => [current + 1, ...previous]);
                setCurrent((n) => n + 1);
                setRestored(true);
                setMessage(`Revision ${confirm} restored as a new revision`);
                setConfirm(null);
              }}
            >
              Restore
            </Button>
          </>
        }
      >
        All previous saves remain available.
      </Dialog>
    </>
  );
}
export function Workflows() {
  const [panel, setPanel] = useState(false);
  const [project, setProject] = useState("Kitchen renovation");
  const [selection, setSelection] = useState("base");
  return (
    <Stack>
      <div {...stylex.props(s.previewLayout)}>
        <div {...stylex.props(s.drawing)}>
          <svg
            viewBox="0 0 320 260"
            width="100%"
            role="img"
            aria-label="Example cabinet elevation"
          >
            <path
              d="M30 225H290 M55 50H265V225H55Z M55 90H265 M160 50V225 M65 100H150V213H65Z M170 100H255V213H170Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.65"
            />
            <path
              d="M55 32H265 M55 26V38 M265 26V38"
              stroke="currentColor"
              opacity="0.4"
            />
            <text
              x="160"
              y="24"
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
            >
              30 in
            </text>
            <circle cx="140" cy="145" r="2" fill="currentColor" />
            <circle cx="180" cy="145" r="2" fill="currentColor" />
          </svg>
        </div>
        <div {...stylex.props(s.stack)}>
          <SegmentedControl
            label="Selected object"
            value={selection}
            onChange={setSelection}
            options={[
              { value: "base", label: "Base" },
              { value: "wall", label: "Wall" },
            ]}
          />
          <SidebarDemo
            key={selection}
            state="default"
            objectType={selection as "base" | "wall"}
          />
        </div>
      </div>
      <Panel title="Business designs">
        <div {...stylex.props(s.tableWrap)}>
          <table {...stylex.props(s.table)}>
            <thead>
              <tr>
                <th {...stylex.props(s.th)}>Project</th>
                <th {...stylex.props(s.th)}>Revision</th>
                <th {...stylex.props(s.th)}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {["Kitchen renovation", "Entry built-in", "Studio storage"].map(
                (name) => (
                  <tr key={name}>
                    <td {...stylex.props(s.td)}>{name}</td>
                    <td {...stylex.props(s.td)}>4</td>
                    <td {...stylex.props(s.td)}>
                      <MenuButton
                        label={`Actions for ${name}`}
                        actions={[
                          {
                            id: "history",
                            label: "History & sharing",
                            icon: "history",
                            onAction: () => {
                              setProject(name);
                              setPanel(true);
                            },
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </Panel>
      <HistoryPanel
        key={project}
        open={panel}
        onOpenChange={setPanel}
        name={project}
      />
    </Stack>
  );
}
export function Demo({ page, state }: { page: PageId; state: ExampleState }) {
  switch (page) {
    case "foundations":
      return <Foundations />;
    case "buttons":
      return <ButtonsDemo state={state} />;
    case "menus":
      return <MenusDemo state={state} />;
    case "fields":
      return <FieldsDemo state={state} />;
    case "parameters":
      return <ParameterDemo state={state} />;
    case "panels":
      return <SidebarDemo state={state} />;
    case "overlays":
      return <OverlayDemo />;
    case "feedback":
      return (
        <Stack>
          <div {...stylex.props(s.row)}>
            <Badge>Draft</Badge>
            <Badge tone="success">Saved</Badge>
            <Badge tone="warning">Unsaved</Badge>
          </div>
          <Status tone="success">Changes saved</Status>
          <Status tone="warning">
            Check the selected revision before exporting.
          </Status>
          <Status tone="danger">Unable to save. Try again.</Status>
          <Status>Preparing your export…</Status>
        </Stack>
      );
    default:
      return <Workflows />;
  }
}
