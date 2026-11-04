import {
  CommandBarsDemo,
  DesignerToolbarPrototype,
} from "./DesignerToolbarPrototype";
import { SwatchesDemo } from "./SwatchExamples";
import { DesignerSidebarPrototype } from "./DesignerSidebarPrototype";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  List,
  type ListItem,
  InfoTooltip,
  ActionGroup,
  Badge,
  Button,
  Dialog,
  Icon,
  IconButton,
  MenuButton,
  Panel,
  Parameters,
  ParameterRow,
  Section,
  SegmentedControl,
  Select,
  SidePanel,
  Status,
  Switch,
  TextInput,
  type Action,
  type IconName,
} from "@from-trees/ui";
import { s } from "./styles";
import {
  CabinetParameters,
  type CabinetParameterValues,
} from "./CabinetParameters";
import { layout, gap, padding, marginBlock } from "@from-trees/ui/utilities";
import type { PageId } from "./content";
export type ExampleState = "default" | "disabled" | "error" | "loading";
function Stack({ children }: { children: React.ReactNode }) {
  return <div {...stylex.props(layout.stack, gap.xl)}>{children}</div>;
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
      <section
        aria-label="Shared spacing utilities"
        {...stylex.props(layout.stack, gap.lg)}
      >
        <h2 {...stylex.props(s.heading, marginBlock.none)}>
          Spacing & layout utilities
        </h2>
        <p {...stylex.props(s.text, marginBlock.none)}>
          Compose shared StyleX classes on app elements. Use gaps between
          children, padding inside surfaces, and logical block/inline spacing.
          The same scale applies at both densities; control sizing follows
          density separately.
        </p>
        <div {...stylex.props(layout.stack, gap.md)}>
          {(["none", "xs", "sm", "md", "lg", "xl", "xxl"] as const).map(
            (size, index) => (
              <div key={size} {...stylex.props(layout.stack, gap.xs)}>
                <span {...stylex.props(s.small)}>
                  {size} · {[0, 4, 8, 12, 16, 24, 32][index]} px
                </span>
                <div
                  {...stylex.props(
                    layout.row,
                    gap[size],
                    padding.sm,
                    s.spacingTrack,
                  )}
                >
                  <span {...stylex.props(s.spacingChip)}>A</span>
                  <span {...stylex.props(s.spacingChip)}>B</span>
                  <span {...stylex.props(s.spacingChip)}>C</span>
                </div>
              </div>
            ),
          )}
        </div>
        <pre
          {...stylex.props(s.code)}
        >{`import {layout, gap, padding} from '@from-trees/ui/utilities';

<div {...stylex.props(layout.stack, gap.lg, padding.xl)}>
  <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>
    …
  </div>
</div>`}</pre>
      </section>
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
  const [values, setValues] = useState<CabinetParameterValues>({
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
      <CabinetParameters
        values={values}
        subset={subset}
        disabled={state === "disabled"}
        readOnly={state === "loading"}
        onChange={(key, value) => {
          setValues((previous) => ({ ...previous, [key]: value }));
          setChanged(
            `${key === "heightFromFloor" ? "Height from floor" : key[0].toUpperCase() + key.slice(1)} updated`,
          );
        }}
      />
      {state === "error" ? (
        <Status tone="danger">
          Try entering 0 for width to inspect validation.
        </Status>
      ) : changed ? (
        <Status tone="success">{changed}</Status>
      ) : null}
    </Stack>
  );
}
function GenericSettingsParameters() {
  const [gain, setGain] = useState(25);
  const [duration, setDuration] = useState(200);
  const [samples, setSamples] = useState(8);
  return (
    <Parameters
      groups={[
        {
          id: "output",
          label: "Output",
          parameters: [
            {
              id: "duration-ms",
              label: "Duration",
              unit: "ms",
              value: duration,
              min: 0,
              onChange: setDuration,
            },
            {
              id: "gain-pct",
              label: "Gain",
              unit: "%",
              value: gain,
              min: 0,
              max: 100,
              onChange: setGain,
            },
          ],
        },
        {
          id: "quality",
          label: "Quality",
          parameters: [
            {
              id: "sample-count",
              label: "Samples",
              value: samples,
              min: 1,
              onChange: setSamples,
            },
          ],
        },
      ]}
    />
  );
}
function ParameterRulesDemo() {
  const [size, setSize] = useState(12);
  const [offset, setOffset] = useState(8);
  return (
    <Stack>
      <Parameters
        unit="in"
        groups={[
          {
            id: "app-rules",
            label: "App-defined rules",
            parameters: [
              {
                id: "positive-size",
                label: "Size",
                value: size,
                onChange: setSize,
                validate: (value) =>
                  value > 0 ? undefined : "Enter a size greater than zero.",
              },
              {
                id: "snapped-offset",
                label: "Offset",
                value: offset,
                onChange: (value) => setOffset(Math.round(value)),
                help: "This example app rounds offsets to whole inches after editing ends. Try 8.25 or 8.75, then leave the field.",
              },
            ],
          },
        ]}
      />
      <output aria-label="Stored parameter values" {...stylex.props(s.small)}>
        Size {size} in · Offset {offset} in
      </output>
    </Stack>
  );
}
function MixedParameterEditors() {
  const [name, setName] = useState("Sample");
  const [mode, setMode] = useState("standard");
  const [enabled, setEnabled] = useState(true);
  const [size, setSize] = useState(12);
  return (
    <Parameters
      groups={[
        {
          id: "mixed-editors",
          label: "App-defined controls",
          parameters: [
            {
              id: "size",
              label: "Size",
              value: size,
              onChange: setSize,
              unit: "in",
            },
            {
              id: "name",
              label: "Name",
              control: (
                <TextInput
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
              ),
            },
            {
              id: "mode",
              label: "Mode",
              control: (
                <Select
                  value={mode}
                  onChange={(event) => setMode(event.currentTarget.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="custom">Custom</option>
                </Select>
              ),
            },
            {
              id: "enabled",
              label: "Enabled",
              help: "This switch is an app-supplied component in the same parameter layout.",
              control: <Switch selected={enabled} onChange={setEnabled} />,
            },
            {
              id: "quality",
              label: "Quality",
              help: "A custom editor receives the row label and description attributes. Its behavior belongs to the app.",
              control: (props) => (
                <input
                  {...props}
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="5"
                />
              ),
            },
          ],
        },
      ]}
    />
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
  const [thickness, setThickness] = useState(0.5);
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
        <ParameterRow label="Finish">
          <Select
            value={finish}
            disabled={state === "disabled"}
            onChange={(e) => setFinish(e.currentTarget.value)}
          >
            <option value="oak">Natural oak</option>
            <option value="walnut">Walnut</option>
          </Select>
        </ParameterRow>
      </Section>
      <Section title="Construction" collapsible modified={custom}>
        <ParameterRow
          label="Custom back thickness"
          help="Override the standard back thickness for this cabinet."
        >
          <Switch
            selected={custom}
            onChange={setCustom}
            disabled={state === "disabled"}
          />
        </ParameterRow>
        {custom && (
          <Parameters
            unit="in"
            groups={[
              {
                id: "back",
                label: "",
                parameters: [
                  {
                    id: "thickness",
                    label: "Back thickness",
                    value: thickness,
                    onChange: setThickness,
                    min: 0.125,
                    disabled: state === "disabled",
                  },
                ],
              },
            ]}
          />
        )}
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
              <List
                label="Saved revisions"
                items={revisions.map(
                  (revision): ListItem => ({
                    id: String(revision),
                    title: `Revision ${revision}`,
                    metadata:
                      revision === current && restored
                        ? "Restored just now"
                        : "Example team member · Nov 2",
                    ...(revision === current
                      ? {
                          status: { label: "Current", tone: "success" },
                        }
                      : {
                          actions: [
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
                          ],
                        }),
                  }),
                )}
              />
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
        <div {...stylex.props(layout.stack, gap.xl)}>
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
export function ListsDemo({ state = "default" }: { state?: ExampleState }) {
  const [message, setMessage] = useState("");
  const actions = (title: string): Action[] => [
    {
      id: "view",
      label: "Inspect",
      icon: "view",
      onAction: () => setMessage(`${title} selected for inspection.`),
    },
    {
      id: "restore",
      label: "Restore",
      icon: "history",
      disabled: state === "disabled" || state === "loading",
      onAction: () =>
        setMessage(
          `${title} selected for restoration. Apps supply confirmation.`,
        ),
    },
  ];
  return (
    <Stack>
      <List
        label="Revision list"
        items={[
          {
            id: "4",
            title: "Revision 4",
            metadata: "Example team member · Nov 2",
            status: { label: "Current", tone: "success" },
          },
          ...[3, 2, 1].map(
            (revision): ListItem => ({
              id: String(revision),
              title: `Revision ${revision}`,
              metadata: "Example team member · Nov 2",
              actions: actions(`Revision ${revision}`),
            }),
          ),
        ]}
      />
      {message && <Status tone="success">{message}</Status>}
      {state === "loading" && <Status>Loading revisions…</Status>}
      {state === "error" && (
        <Status tone="danger">
          Unable to refresh revisions. Existing rows stay available.
        </Status>
      )}
      <Section title="Long content & narrow layouts" defaultOpen>
        <List
          label="Long content example"
          items={[
            {
              id: "long",
              title:
                "Kitchen renovation with an intentionally long project title",
              metadata:
                "a.very.long.team.member.name@example.test · Nov 2, 7:40 PM",
              actions: actions("Long title"),
            },
            {
              id: "view-only",
              title: "View-only record",
              metadata: "No actions available",
            },
          ]}
        />
      </Section>
      <Section title="Empty list" defaultOpen>
        <List
          label="Empty revision list"
          items={[]}
          emptyMessage="No saved revisions yet."
        />
      </Section>
    </Stack>
  );
}
export function HelpDemo() {
  const [dialog, setDialog] = useState(false);
  return (
    <Stack>
      <div {...stylex.props(layout.row, layout.alignCenter, gap.xs)}>
        <span>Wall offset</span>
        <InfoTooltip label="Wall offset">
          From the start of the parent wall. The value follows that wall's
          direction, not the screen's left edge.
        </InfoTooltip>
      </div>
      <div {...stylex.props(layout.row, layout.alignCenter, gap.xs)}>
        <span>Measurement input</span>
        <InfoTooltip label="Measurement input">
          Use decimals or fractions, such as 30 1/2. Changes apply when focus
          leaves the field. Enter finishes editing; Escape resets the draft.
        </InfoTooltip>
      </div>
      <Button onPress={() => setDialog(true)}>Help inside a dialog</Button>
      <Dialog title="Parameter help" open={dialog} onOpenChange={setDialog}>
        <div {...stylex.props(layout.row, layout.alignCenter, gap.xs)}>
          <span>Height from floor</span>
          <InfoTooltip label="Height from floor">
            Measured to the bottom of the object. Escape dismisses this
            explanation before closing the dialog.
          </InfoTooltip>
        </div>
      </Dialog>
    </Stack>
  );
}
export function Demo({ page, state }: { page: PageId; state: ExampleState }) {
  switch (page) {
    case "swatches":
      return <SwatchesDemo />;
    case "toolbars":
      return <CommandBarsDemo />;
    case "designer-toolbars":
      return <DesignerToolbarPrototype />;
    case "sidebar":
      return <DesignerSidebarPrototype />;
    case "foundations":
      return <Foundations />;
    case "buttons":
      return <ButtonsDemo state={state} />;
    case "lists":
      return <ListsDemo state={state} />;
    case "menus":
      return <MenusDemo state={state} />;
    case "fields":
      return <FieldsDemo state={state} />;
    case "help":
      return <HelpDemo />;
    case "parameters":
      return (
        <Stack>
          <ParameterDemo state={state} />
          <Section title="Different app-defined schema" collapsible>
            <GenericSettingsParameters />
          </Section>
          <Section title="Mixed parameter editors" collapsible>
            <MixedParameterEditors />
          </Section>
          <Section title="App-defined validation & snapping" collapsible>
            <ParameterRulesDemo />
          </Section>
        </Stack>
      );
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
