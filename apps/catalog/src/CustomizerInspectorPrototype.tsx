import { useId, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Badge,
  Button,
  CommandBar,
  Dialog,
  InfoTooltip,
  List,
  MenuButton,
  Panel,
  ParameterRow,
  Parameters,
  Section,
  Select,
  SidePanel,
  Status,
  Switch,
  SwatchPicker,
  TaskHeader,
  TextInput,
  type Parameter,
  type ParameterGroup,
  type SwatchOption,
} from "@from-trees/ui";
import { color } from "@from-trees/ui/tokens.stylex";
import { layout, gap, padding } from "@from-trees/ui/utilities";
import { VisualChoice, swatches } from "./SwatchExamples";
import {
  createCabinet,
  createPart,
  equalHeights,
  resizeDrawer,
  type Cabinet,
  type DrawerOptions,
  type Part,
} from "./CustomizerInspectorModel";
const styles = stylex.create({
  root: { width: "100%", minWidth: 0 },
  frame: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: color.surface,
  },
  workbench: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(290px, 46%) minmax(0,1fr)",
      "@media (max-width: 800px)": "minmax(0,1fr)",
    },
    alignItems: "start",
  },
  inspector: {
    minWidth: 0,
    backgroundColor: color.subtle,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: color.border,
  },
  controls: { width: "100%", maxWidth: 160 },
  preview: {
    minWidth: 0,
    position: { default: "sticky", "@media (max-width: 800px)": "static" },
    top: 12,
  },
  figure: {
    margin: 0,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  drawing: { display: "block", width: "100%", height: 280 },
  readout: { margin: 0, color: color.muted, fontSize: 12, lineHeight: 1.5 },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  caption: { margin: 0, fontSize: 12, color: color.muted },
  review: { display: "flex", flexWrap: "wrap", alignItems: "end", gap: 16 },
  warning: { margin: 0, fontSize: 12, color: color.danger },
});
const kindOptions: Part["kind"][] = [
  "Door",
  "Drawer array",
  "Shelf",
  "Back panel",
  "Fixed front",
];
const inches = (v: number) => Number(v.toFixed(4));
function Choice({
  label,
  value,
  values,
  onChange,
  help,
  disabled = false,
}: {
  label: string;
  value: string;
  values: readonly string[];
  onChange: (value: string) => void;
  help?: string;
  disabled?: boolean;
}) {
  return (
    <ParameterRow label={label} help={help}>
      <Select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {values.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </Select>
    </ParameterRow>
  );
}
function Toggle({
  label,
  value,
  onChange,
  help,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  help?: string;
  disabled?: boolean;
}) {
  return (
    <ParameterRow label={label} help={help}>
      <Switch selected={value} disabled={disabled} onChange={onChange} />
    </ParameterRow>
  );
}
function length(
  id: string,
  label: string,
  value: number,
  onChange: (value: number) => void,
  options: Partial<Parameter> = {},
): Parameter {
  const min = options.min ?? -1000,
    max = options.max ?? 1000;
  return {
    id,
    label,
    value: inches(value),
    onChange,
    unit: "in",
    ...options,
    help: `${options.help ? options.help + " " : ""}Allowed range: ${min}–${max} in. Typed values keep their precision; validation runs when editing ends.`,
    min,
    max,
  };
}
function Fields({
  label,
  fields,
  help,
}: {
  label?: string;
  fields: Parameter[];
  help?: string;
}) {
  return (
    <Parameters
      groups={[
        {
          id: label ?? "fields",
          label,
          help,
          helpLabel: help ? "Entering measurements" : undefined,
          parameters: fields,
        },
      ]}
    />
  );
}
const measureHelp =
  "Use decimals or fractions. Enter or leaving the field commits; Escape resets the draft. Movement snapping affects dragging, not typed measurements.";
function edgePreview(shape: string) {
  return (
    <svg viewBox="0 0 100 65" width="100%" height="100%" aria-hidden="true">
      <path
        d={
          shape === "Square"
            ? "M22 50V15H78V50Z"
            : shape === "Outward"
              ? "M22 50Q0 15 25 15H75Q100 15 78 50Z"
              : "M22 50Q42 30 22 15H78Q58 30 78 50Z"
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}
const edges: SwatchOption[] = ["Square", "Outward", "Inward"].map((id) => ({
  id,
  label: id,
  preview: edgePreview(id),
}));
function EdgeChoice({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <ParameterRow label={label}>
      <SwatchPicker
        value={value}
        options={edges}
        onChange={onChange}
        disabled={disabled}
      />
    </ParameterRow>
  );
}
function Drawing({
  part,
  preview,
  drawer,
}: {
  part?: Part;
  preview: { material: string; color: string; face: string };
  drawer: number | null;
}) {
  const clip = useId().replaceAll(":", "");
  return (
    <svg
      viewBox="0 0 300 310"
      role="img"
      aria-label={
        part
          ? `${part.name}${drawer !== null ? ` · Drawer ${drawer + 1}` : ""} selection schematic`
          : "Cabinet selection schematic"
      }
      {...stylex.props(styles.drawing)}
    >
      <defs>
        <clipPath id={clip}>
          <path d="M38 48H235V275H38Z" />
        </clipPath>
      </defs>
      <path
        d="M38 48L80 25H270V250L235 275Z"
        fill={color.subtle}
        stroke={color.muted}
      />
      <image
        href={`./swatches/${preview.material === "Walnut" ? "walnut" : "oak"}.jpg`}
        x="38"
        y="48"
        width="197"
        height="227"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clip})`}
      />
      {preview.material === "Paint grade" && (
        <path
          d="M38 48H235V275H38Z"
          fill={
            preview.color === "Sage"
              ? "#7b8d76"
              : preview.color === "Charcoal"
                ? "#3c4142"
                : "#f4f0e7"
          }
        />
      )}
      <path
        d="M38 48H235V275H38Z M235 48L270 25"
        fill="none"
        stroke={color.ink}
        strokeWidth="2"
      />
      {part?.kind === "Drawer array" ? (
        part.heights.map((h, i) => {
          const total = part.heights.reduce((a, b) => a + b, 0);
          const y =
            55 +
            (part.heights.slice(0, i).reduce((a, b) => a + b, 0) / total) * 212;
          return (
            <g key={i}>
              <rect
                x="44"
                y={y}
                width="185"
                height={(h / total) * 212 - 3}
                fill={drawer === i ? color.accent : color.surface}
                opacity={drawer === i ? 0.8 : 0.55}
                stroke={color.ink}
              />
              <path
                d={`M119 ${y + 12}h33`}
                stroke={drawer === i ? color.onAccent : color.ink}
                strokeWidth="2"
              />
            </g>
          );
        })
      ) : (
        <>
          <path d="M137 50V273" stroke={color.ink} />
          {preview.face !== "Slab" && (
            <path
              d="M49 60H125V263H49Z M148 60H224V263H148Z"
              fill="none"
              stroke={color.ink}
            />
          )}
          <path
            d="M117 139v30 M155 139v30"
            stroke={color.ink}
            strokeWidth="3"
          />
          {part && (
            <rect
              x="43"
              y={
                part.kind === "Shelf"
                  ? 165
                  : part.kind === "Fixed front"
                    ? 54
                    : 53
              }
              width={part.kind === "Door" ? 89 : 187}
              height={
                part.kind === "Shelf"
                  ? 7
                  : part.kind === "Fixed front"
                    ? 38
                    : 218
              }
              fill="none"
              stroke={color.accent}
              strokeWidth="4"
            />
          )}
        </>
      )}
      <text x="38" y="300" fill={color.muted} fontSize="11">
        {part?.name ?? "Cabinet"}
        {drawer !== null ? ` · Drawer ${drawer + 1}` : ""}
      </text>
    </svg>
  );
}
export function CustomizerInspectorPrototype() {
  const [draft, setDraft] = useState(createCabinet),
    [saved, setSaved] = useState(createCabinet);
  const [past, setPast] = useState<Cabinet[]>([]),
    [future, setFuture] = useState<Cabinet[]>([]);
  const [context, setContext] = useState("Cabinet"),
    [selected, setSelected] = useState("part-1"),
    [row, setRow] = useState<number | null>(null);
  const [scenario, setScenario] = useState("Room cabinet"),
    [snap, setSnap] = useState("1/8 in"),
    [view, setView] = useState("3D"),
    [tool, setTool] = useState("Orbit / pan");
  const [preview, setPreview] = useState({
    material: "Oak",
    color: "Natural",
    face: "Shaker",
  });
  const [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [epoch, setEpoch] = useState(0),
    [task, setTask] = useState(""),
    [confirm, setConfirm] = useState("");
  const inspector = useRef<HTMLDivElement>(null),
    nextId = useRef(6);
  const locked = scenario === "Read only",
    envelopeLocked = scenario !== "Standalone";
  const part = draft.parts.find((p) => p.id === selected),
    dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const update = (change: (next: Cabinet) => void) => {
    if (locked) return;
    const next = structuredClone(draft);
    change(next);
    if (JSON.stringify(next) === JSON.stringify(draft)) return;
    setPast((p) => [...p, draft]);
    setFuture([]);
    setDraft(next);
    setNotice("");
    setError("");
  };
  const patch = (values: Partial<Part>) =>
    update((next) => {
      const target = next.parts.find((p) => p.id === selected);
      if (target) Object.assign(target, values);
    });
  const selectPart = (id: string) => {
    setSelected(id);
    setRow(null);
    setContext("Selected part");
    setError("");
  };
  const partNumber = (
    key: "width" | "height" | "depth" | "x" | "y" | "z",
    label: string,
    min: number,
    help?: string,
  ) =>
    length(key, label, part![key], (v) => patch({ [key]: v }), {
      min,
      disabled: locked,
      help,
    });
  const general: ParameterGroup[] = [
    {
      id: "identity",
      parameters: [
        {
          id: "name",
          label: "Name",
          help: "A name identifies this reusable configuration. It does not rename a business project.",
          control: (
            <TextInput
              value={draft.name}
              disabled={locked}
              onChange={(e) =>
                update((n) => {
                  n.name = e.currentTarget.value;
                })
              }
            />
          ),
        },
      ],
    },
    {
      id: "size",
      label: "Size",
      help: envelopeLocked
        ? "The room owns cabinet dimensions. Change size in the designer."
        : measureHelp,
      helpLabel: "Cabinet dimensions",
      parameters: (["width", "height", "depth"] as const).map((key) =>
        length(
          key,
          key[0].toUpperCase() + key.slice(1),
          draft[key],
          (v) =>
            update((n) => {
              n[key] = v;
            }),
          {
            min: key === "depth" ? 8 : 12,
            readOnly: envelopeLocked,
            disabled: locked,
            icon: key,
          },
        ),
      ),
    },
  ];
  const drawerOptions = (
    options: Partial<DrawerOptions>,
    set: (value: Partial<DrawerOptions>) => void,
    inherited: boolean,
  ) => {
    const effective = { ...part!.defaults, ...options };
    const setNumber = (
      key: keyof DrawerOptions,
      label: string,
      min: number,
      max: number,
      help: string,
    ) =>
      length(
        key,
        label,
        Number(effective[key]),
        (v) => set({ ...options, [key]: v }),
        { min, max, disabled: locked, help },
      );
    return (
      <>
        <Choice
          label="Opening method"
          value={
            options.method ??
            (inherited ? "Use array setting" : part!.defaults.method)
          }
          values={
            inherited
              ? ["Use array setting", "Pulls", "Finger profile", "Push-to-open"]
              : ["Pulls", "Finger profile", "Push-to-open"]
          }
          disabled={locked}
          help={`Currently ${effective.method.toLowerCase()}. A finger profile requires a straight slab front and reserves 5/8 in of finger space; the production app resolves actual front geometry.`}
          onChange={(method) => {
            const next = { ...options };
            if (method === "Use array setting") delete next.method;
            else next.method = method;
            set(next);
          }}
        />
        {effective.method === "Finger profile" && (
          <Fields
            fields={[
              setNumber(
                "fingerHeight",
                "Profile height",
                0.0625,
                1.5,
                "Rear bevel at the top edge.",
              ),
              setNumber(
                "fingerDepth",
                "Profile depth",
                0.0625,
                0.6875,
                "Measured into the rear of the front.",
              ),
            ]}
          />
        )}
        {inherited && (
          <Toggle
            label="Plumbing notch"
            value={effective.notch}
            disabled={locked}
            help="Rear U-shaped opening for this drawer only. Depth is measured forward from the box back."
            onChange={(notch) => set({ ...options, notch })}
          />
        )}
        {inherited && effective.notch && (
          <Fields
            fields={[
              setNumber(
                "notchWidth",
                "Notch width",
                0.125,
                1000,
                "Opening width.",
              ),
              setNumber(
                "notchDepth",
                "Notch depth",
                0.125,
                1000,
                "Measured forward from the box back.",
              ),
              setNumber(
                "notchOffset",
                "Notch offset",
                -1000,
                1000,
                "Horizontal displacement from the drawer center. Negative moves left.",
              ),
            ]}
          />
        )}
      </>
    );
  };
  const optionsForRow = part?.overrides[row ?? -1] ?? {};
  const setDrawerOptions = (options: Partial<DrawerOptions>) =>
    update((n) => {
      const target = n.parts.find((p) => p.id === selected)!;
      if (row === null) target.defaults = { ...target.defaults, ...options };
      else target.overrides[row] = options;
      const effective = {
        ...target.defaults,
        ...(row === null ? {} : options),
      };
      if (effective.method === "Finger profile") target.face = "Slab";
    });
  const profileOptions = part
    ? [
        {
          id: "inherit",
          label: "Use cabinet style",
          preview: swatches.front.find((s) => s.id === preview.face)?.preview,
        },
        ...swatches.front,
      ]
    : [];
  const sizeRows =
    part && part.kind !== "Drawer array" ? (
      <>
        <Fields
          label="Size"
          help={measureHelp}
          fields={[
            partNumber("width", "Width", 0.0625),
            partNumber("height", "Height", 0.0625),
            partNumber("depth", "Depth", 0.0625),
          ]}
        />
        <Fields
          label="Position"
          fields={[
            partNumber(
              "x",
              "From left",
              -1000,
              "Measured from the cabinet left.",
            ),
            partNumber(
              "y",
              "From bottom",
              0,
              "Measured from the cabinet bottom.",
            ),
            partNumber(
              "z",
              "Front setback",
              -1000,
              "Positive recesses the part; negative projects forward. Cabinitron keeps the rear edge anchored where applicable.",
            ),
          ]}
        />
      </>
    ) : null;
  const drawerCount = part
    ? Math.min(
        100,
        Math.floor((part.height + draft.reveal) / (2 + draft.reveal)),
      )
    : 1;
  const save = () => {
    const invalid = inspector.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    if (invalid) {
      setError("Correct the highlighted field before saving.");
      invalid.focus();
      return;
    }
    setSaved(structuredClone(draft));
    setPast([]);
    setFuture([]);
    setNotice("Configuration saved in this example.");
  };
  const inspectorTitle =
    context === "Cabinet"
      ? draft.name
      : context === "Preview"
        ? "Preview appearance"
        : part
          ? `${part.name}${row !== null ? ` · Drawer ${row + 1}` : ""}`
          : "No part selected";
  return (
    <div {...stylex.props(styles.root, layout.stack, gap.lg)}>
      <div {...stylex.props(styles.frame)}>
        <TaskHeader
          title="Customize cabinet"
          description={draft.name}
          onSave={save}
          disabled={locked}
          error={error}
          onCancel={() => {
            setDraft(structuredClone(saved));
            setPast([]);
            setFuture([]);
            setError("");
            setEpoch((n) => n + 1);
            setNotice("Draft discarded.");
            if (!saved.parts.some((p) => p.id === selected))
              setSelected(saved.parts[0]?.id ?? "");
            setRow(null);
          }}
        />
        <div {...stylex.props(padding.md)}>
          <CommandBar
            label="Cabinet commands"
            menuLabel="Cabinet part actions"
            menuText="Parts"
            menuIcon="parts"
            status={{
              label: locked ? "View only" : dirty ? "Modified" : "Saved",
              tone: dirty ? "warning" : "success",
            }}
            actions={[
              {
                id: "parts",
                label: "Choose part",
                icon: "parts",
                onAction: () => setTask("parts"),
              },
              {
                id: "add",
                label: "Add part",
                icon: "add",
                disabled: locked,
                onAction: () => setTask("add"),
              },
              {
                id: "undo",
                label: "Undo",
                icon: "undo",
                disabled: locked || !past.length,
                onAction: () => {
                  setFuture((f) => [draft, ...f]);
                  setDraft(past.at(-1)!);
                  if (!past.at(-1)!.parts.some((p) => p.id === selected))
                    setSelected(past.at(-1)!.parts[0]?.id ?? "");
                  setPast((p) => p.slice(0, -1));
                  setEpoch((n) => n + 1);
                  setRow(null);
                },
              },
              {
                id: "redo",
                label: "Redo",
                icon: "redo",
                disabled: locked || !future.length,
                onAction: () => {
                  setPast((p) => [...p, draft]);
                  setDraft(future[0]);
                  if (!future[0].parts.some((p) => p.id === selected))
                    setSelected(future[0].parts[0]?.id ?? "");
                  setFuture((f) => f.slice(1));
                  setEpoch((n) => n + 1);
                  setRow(null);
                },
              },
              {
                id: "transfer",
                label: "Definition transfer",
                icon: "export",
                onAction: () => setTask("transfer"),
              },
            ]}
          >
            <span {...stylex.props(styles.controls)}>
              <Select
                aria-label="Cabinet view"
                value={view}
                onChange={(e) => setView(e.currentTarget.value)}
              >
                {["3D", "Front", "Side", "Top"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </Select>
            </span>
            <span {...stylex.props(styles.controls)}>
              <Select
                aria-label="Cabinet tool"
                value={tool}
                onChange={(e) => setTool(e.currentTarget.value)}
              >
                {["Orbit / pan", "Move part", "Interact"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </Select>
            </span>
            <span {...stylex.props(styles.controls)}>
              <Select
                aria-label="Movement snapping"
                value={snap}
                onChange={(e) => setSnap(e.currentTarget.value)}
              >
                {["1/16 in", "1/8 in", "1/2 in", "1 in", "Off"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </Select>
            </span>
            <InfoTooltip label="Cabinet tools">
              Movement snapping is {snap}. Typed values are not snapped. This
              catalog schematic demonstrates selection and inspector
              organization; dragging, motion and geometry stay in Cabinitron.
            </InfoTooltip>
          </CommandBar>
        </div>
        <div {...stylex.props(styles.workbench)}>
          <aside
            aria-label="Customizer inspector"
            {...stylex.props(
              styles.inspector,
              padding.md,
              layout.stack,
              gap.md,
            )}
          >
            <Choice
              label="Inspect"
              value={context}
              values={["Cabinet", "Selected part", "Preview"]}
              onChange={setContext}
            />
            {context === "Selected part" && (
              <ParameterRow label="Part">
                <Select
                  value={selected}
                  onChange={(e) => selectPart(e.currentTarget.value)}
                >
                  {draft.parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </ParameterRow>
            )}
            <div ref={inspector} key={`${epoch}:${context}:${selected}:${row}`}>
              <Panel
                title={inspectorTitle}
                actions={
                  context === "Selected part" && part ? (
                    <MenuButton
                      label="Selected part actions"
                      actions={[
                        {
                          id: "duplicate",
                          label: "Duplicate part",
                          icon: "copy",
                          disabled: locked || part.kind === "Drawer array",
                          onAction: () => {
                            const id = `part-${nextId.current++}`;
                            update((n) => {
                              n.parts.push({
                                ...structuredClone(part),
                                id,
                                name: part.name + " copy",
                                y: part.y + 1,
                              });
                            });
                            selectPart(id);
                          },
                        },
                        {
                          id: "remove",
                          label: "Remove part",
                          icon: "close",
                          disabled: locked,
                          destructive: true,
                          onAction: () => setConfirm("part"),
                        },
                        {
                          id: "shared-edges",
                          label: "Use edges for cabinet",
                          icon: "copy",
                          disabled: locked || !part.independent,
                          onAction: () =>
                            update((n) => {
                              n.left = part.left;
                              n.right = part.right;
                              n.radius = part.radius;
                            }),
                        },
                        ...(row !== null
                          ? [
                              {
                                id: "reset",
                                label: "Reset drawer overrides",
                                icon: "undo" as const,
                                disabled:
                                  locked || !Object.keys(optionsForRow).length,
                                onAction: () => setDrawerOptions({}),
                              },
                            ]
                          : []),
                      ]}
                    />
                  ) : (
                    <Badge
                      tone={locked ? "neutral" : dirty ? "warning" : "neutral"}
                    >
                      {context === "Preview"
                        ? "Preview only"
                        : locked
                          ? "View only"
                          : "Draft"}
                    </Badge>
                  )
                }
              >
                {context === "Cabinet" ? (
                  <>
                    <Parameters groups={general} />
                    <Section
                      title="Construction"
                      collapsible
                      modified={!draft.bottom || draft.reveal !== saved.reveal}
                    >
                      <Fields
                        fields={[
                          length(
                            "reveal",
                            "Front reveal",
                            draft.reveal,
                            (v) =>
                              update((n) => {
                                n.reveal = v;
                                for (const p of n.parts)
                                  if (p.kind === "Drawer array")
                                    p.heights = equalHeights(
                                      p.height,
                                      v,
                                      p.heights.length,
                                    );
                              }),
                            {
                              min: 0.0625,
                              max: 1,
                              disabled: locked,
                              help: "Gap around fronts. Changing it rebalances this example’s drawer rows; production geometry remains app-owned.",
                            },
                          ),
                        ]}
                      />
                      <ParameterRow
                        label="Bottom panel"
                        help="Removing the bottom panel is a cabinet construction change. Undo can restore it."
                      >
                        <Button
                          icon="close"
                          isDisabled={locked || !draft.bottom}
                          onClick={() => setConfirm("bottom")}
                        >
                          {draft.bottom ? "Remove" : "Removed"}
                        </Button>
                      </ParameterRow>
                    </Section>
                    <Section
                      title="Shared shape"
                      collapsible
                      modified={
                        draft.left !== "Square" ||
                        draft.right !== "Square" ||
                        draft.curveScope !== "Straight" ||
                        draft.arch
                      }
                    >
                      <EdgeChoice
                        label="Left edge"
                        value={draft.left}
                        disabled={locked}
                        onChange={(left) =>
                          update((n) => {
                            n.left = left;
                          })
                        }
                      />
                      <EdgeChoice
                        label="Right edge"
                        value={draft.right}
                        disabled={locked}
                        onChange={(right) =>
                          update((n) => {
                            n.right = right;
                          })
                        }
                      />
                      {(draft.left !== "Square" ||
                        draft.right !== "Square") && (
                        <Fields
                          fields={[
                            length(
                              "edge-radius",
                              "Edge radius",
                              draft.radius,
                              (v) =>
                                update((n) => {
                                  n.radius = v;
                                }),
                              {
                                min: 0.0625,
                                max: Math.min(
                                  draft.width / 2,
                                  draft.depth - 0.75,
                                ),
                                disabled: locked,
                                help: "Limited to half the cabinet width and its depth minus 3/4 in.",
                              },
                            ),
                          ]}
                        />
                      )}
                      <Choice
                        label="Curve scope"
                        value={draft.curveScope}
                        values={["Straight", "Entire cabinet", "Front only"]}
                        disabled={locked}
                        help="The actual app resolves the shared outline and propagates it to linked parts. Dimensions are measured before curving."
                        onChange={(curveScope) =>
                          update((n) => {
                            n.curveScope = curveScope;
                          })
                        }
                      />
                      {draft.curveScope !== "Straight" && (
                        <>
                          <Choice
                            label="Curve profile"
                            value={draft.curveProfile}
                            values={[
                              "Arc",
                              "Rounded left end",
                              "Rounded right end",
                              "Rounded both ends",
                            ]}
                            disabled={locked}
                            onChange={(curveProfile) =>
                              update((n) => {
                                n.curveProfile = curveProfile;
                              })
                            }
                          />
                          <Choice
                            label="Curve direction"
                            value={draft.curveDirection}
                            values={["Outward", "Inward"]}
                            disabled={locked}
                            onChange={(curveDirection) =>
                              update((n) => {
                                n.curveDirection = curveDirection;
                              })
                            }
                          />
                          <Fields
                            fields={[
                              length(
                                "curve-radius",
                                "Curve radius",
                                draft.curveRadius,
                                (v) =>
                                  update((n) => {
                                    n.curveRadius = v;
                                  }),
                                { min: 0.0625, disabled: locked },
                              ),
                            ]}
                          />
                        </>
                      )}
                      <Toggle
                        label="Arched front"
                        value={draft.arch}
                        disabled={locked}
                        help="Applies to the cabinet front; production opening profiles and shared geometry stay app-owned."
                        onChange={(arch) =>
                          update((n) => {
                            n.arch = arch;
                          })
                        }
                      />
                    </Section>
                    <Section title="Sink attachment" collapsible>
                      <Status>
                        Retain Cabinitron’s existing sink selector, fit limits
                        and attachment geometry here during adoption.
                      </Status>
                    </Section>
                    <Section title="Business library" collapsible>
                      <Status>
                        Staff-only export keeps the existing library permissions
                        and export workflow.
                      </Status>
                    </Section>
                  </>
                ) : context === "Preview" ? (
                  <>
                    <VisualChoice
                      label="Material"
                      category="material"
                      value={preview.material}
                      onChange={(material) =>
                        setPreview((p) => ({ ...p, material }))
                      }
                    />
                    {preview.material === "Paint grade" && (
                      <VisualChoice
                        label="Color"
                        category="color"
                        value={preview.color}
                        onChange={(color) =>
                          setPreview((p) => ({ ...p, color }))
                        }
                      />
                    )}
                    <VisualChoice
                      label="Front profile"
                      category="front"
                      value={preview.face}
                      onChange={(face) => setPreview((p) => ({ ...p, face }))}
                    />
                    <InfoTooltip label="Preview appearance">
                      These choices affect only this catalog preview and never
                      mark the configuration Modified. The production app keeps
                      preview finishes separate from saved cabinet construction
                      and uses its actual swatches.
                    </InfoTooltip>
                  </>
                ) : part ? (
                  <>
                    <ParameterRow label="Name">
                      <TextInput
                        value={part.name}
                        disabled={locked}
                        onChange={(e) => patch({ name: e.currentTarget.value })}
                      />
                    </ParameterRow>
                    {part.kind === "Drawer array" ? (
                      <>
                        <ParameterRow label="Drawer">
                          <Select
                            value={row === null ? "array" : String(row)}
                            onChange={(e) =>
                              setRow(
                                e.currentTarget.value === "array"
                                  ? null
                                  : Number(e.currentTarget.value),
                              )
                            }
                          >
                            <option value="array">Array defaults</option>
                            {part.heights.map((_, i) => (
                              <option key={i} value={i}>
                                Drawer {i + 1}
                                {i === 0 ? " (top)" : ""}
                              </option>
                            ))}
                          </Select>
                        </ParameterRow>
                        {row === null ? (
                          <>
                            <Fields
                              label="Drawer layout"
                              help="Rows are top to bottom. Each row is at least 2 in high; changing one takes space from the bottom upward. Array size and position follow its opening."
                              fields={[
                                {
                                  id: "count",
                                  label: "Count",
                                  value: part.heights.length,
                                  min: 1,
                                  max: drawerCount,
                                  disabled: locked,
                                  unit: "",
                                  validate: (v) =>
                                    Number.isInteger(v)
                                      ? undefined
                                      : "Enter a whole drawer count.",
                                  help: `Whole numbers from 1 to ${drawerCount}. Each row needs 2 in plus the ${draft.reveal} in reveal; the app caps arrays at 100. Changing count equalizes the rows.`,
                                  onChange: (count) =>
                                    patch({
                                      heights: equalHeights(
                                        part.height,
                                        draft.reveal,
                                        count,
                                      ),
                                      overrides: Array.from(
                                        { length: count },
                                        (_, i) => part.overrides[i] ?? {},
                                      ),
                                    }),
                                },
                                ...part.heights.map((height, i) =>
                                  length(
                                    `drawer-${i}`,
                                    `Drawer ${i + 1}${i === 0 ? " (top)" : ""}`,
                                    height,
                                    (v) =>
                                      patch({
                                        heights: resizeDrawer(part, i, v),
                                      }),
                                    {
                                      min: 2,
                                      max:
                                        part.height -
                                        (part.heights.length - 1) *
                                          (2 + draft.reveal),
                                      readOnly: part.heights.length === 1,
                                      disabled: locked,
                                      help:
                                        part.heights.length === 1
                                          ? "The only row fills the entire opening."
                                          : "Listed top to bottom. Remaining height balances from the bottom upward.",
                                    },
                                  ),
                                ),
                              ]}
                            />
                            <Choice
                              label="Face placement"
                              value={part.placement}
                              values={["Internal", "External"]}
                              disabled={locked}
                              help="Production requires removal of a covering door before external fronts are allowed. Width and position follow the opening; the app validates collisions."
                              onChange={(placement) => patch({ placement })}
                            />
                            <Section
                              title="Front & box"
                              collapsible
                              modified={part.defaults.method !== "Pulls"}
                            >
                              {drawerOptions(
                                part.defaults,
                                setDrawerOptions,
                                false,
                              )}
                            </Section>
                            <Section
                              title="Stretchers"
                              collapsible
                              modified={part.stretchers}
                            >
                              <Toggle
                                label="Between drawers"
                                value={part.stretchers}
                                disabled={locked}
                                help="Adds a stretcher at each drawer gap in the production model."
                                onChange={(stretchers) => patch({ stretchers })}
                              />
                              {part.stretchers && (
                                <Fields
                                  fields={[
                                    length(
                                      "stretcher-thickness",
                                      "Thickness",
                                      part.stretcherThickness,
                                      (v) => patch({ stretcherThickness: v }),
                                      {
                                        min: 0.25,
                                        max: 0.75,
                                        disabled: locked,
                                      },
                                    ),
                                    length(
                                      "stretcher-depth",
                                      "Depth",
                                      part.stretcherDepth,
                                      (v) => patch({ stretcherDepth: v }),
                                      {
                                        min: 0.25,
                                        max: draft.depth - 0.75,
                                        disabled: locked,
                                        help: "Limited by cabinet depth minus 3/4 in.",
                                      },
                                    ),
                                    length(
                                      "stretcher-setback",
                                      "Setback",
                                      part.stretcherSetback,
                                      (v) => patch({ stretcherSetback: v }),
                                      {
                                        min: 0,
                                        max: draft.depth - 0.75,
                                        disabled: locked,
                                        help: "Measured behind the front, within cabinet depth minus 3/4 in.",
                                      },
                                    ),
                                  ]}
                                />
                              )}
                            </Section>
                          </>
                        ) : (
                          <>
                            <Badge
                              tone={
                                Object.keys(optionsForRow).length
                                  ? "warning"
                                  : "neutral"
                              }
                            >
                              {Object.keys(optionsForRow).length
                                ? "Override"
                                : "Inherited"}
                            </Badge>
                            <Fields
                              fields={[
                                length(
                                  `row-height-${row}`,
                                  `Drawer ${row + 1} height`,
                                  part.heights[row],
                                  (v) =>
                                    patch({
                                      heights: resizeDrawer(part, row, v),
                                    }),
                                  {
                                    min: 2,
                                    max:
                                      part.height -
                                      (part.heights.length - 1) *
                                        (2 + draft.reveal),
                                    readOnly: part.heights.length === 1,
                                    disabled: locked,
                                    help: "Changing this row balances the remaining height from the bottom upward.",
                                  },
                                ),
                              ]}
                            />
                            {drawerOptions(
                              optionsForRow,
                              setDrawerOptions,
                              true,
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      sizeRows
                    )}
                    {part.kind === "Door" && (
                      <Section
                        title="Operation"
                        collapsible
                        modified={part.mechanism !== "Side-hinged"}
                      >
                        <Choice
                          label="Mechanism"
                          value={part.mechanism}
                          values={[
                            "Side-hinged",
                            "Pocket door",
                            "Tambour / roll-up",
                            "Lift-up",
                            "Pull-down",
                          ]}
                          disabled={locked}
                          onChange={(mechanism) => patch({ mechanism })}
                        />
                        {["Side-hinged", "Pocket door"].includes(
                          part.mechanism,
                        ) && (
                          <Choice
                            label="Hinge side"
                            value={part.hinge}
                            values={["Left", "Right"]}
                            disabled={locked}
                            onChange={(hinge) => patch({ hinge })}
                          />
                        )}
                        {part.mechanism === "Pocket door" && (
                          <>
                            <Fields
                              fields={[
                                length(
                                  "pocket-travel",
                                  "Pocket travel",
                                  part.travel,
                                  (v) => patch({ travel: v }),
                                  {
                                    min: 0,
                                    disabled: locked,
                                    help: "Close the door before moving it. Retraction is limited by actual cabinet depth and hardware clearances.",
                                  },
                                ),
                              ]}
                            />
                            {part.width > draft.depth - 1.5 && (
                              <p
                                role="status"
                                {...stylex.props(styles.warning)}
                              >
                                Door width exceeds pocket depth.
                              </p>
                            )}
                          </>
                        )}
                        {part.mechanism === "Tambour / roll-up" && (
                          <>
                            <Choice
                              label="Slat direction"
                              value={part.slatDirection}
                              values={["Vertical", "Horizontal"]}
                              disabled={locked}
                              onChange={(slatDirection) =>
                                patch({ slatDirection })
                              }
                            />
                            <Fields
                              fields={[
                                length(
                                  "slat-size",
                                  "Slat size",
                                  part.slatSize,
                                  (v) => patch({ slatSize: v }),
                                  { min: 0.25, max: 6, disabled: locked },
                                ),
                              ]}
                            />
                          </>
                        )}
                        <InfoTooltip label="Door motion">
                          Opening a door in the actual model is preview motion,
                          not a saved construction edit. Hardware and clearances
                          still require verification.
                        </InfoTooltip>
                      </Section>
                    )}
                    {["Door", "Fixed front", "Drawer array"].includes(
                      part.kind,
                    ) && (
                      <Section
                        title="Appearance"
                        collapsible
                        modified={part.face !== "inherit"}
                      >
                        <ParameterRow
                          label="Front profile"
                          help="Use cabinet style inherits the preview’s front. An explicit override is stored with this part; finger profiles require Slab."
                        >
                          <SwatchPicker
                            value={part.face}
                            options={profileOptions}
                            disabled={locked}
                            onChange={(face) => patch({ face })}
                          />
                        </ParameterRow>
                        {part.kind === "Fixed front" && (
                          <Toggle
                            label="Pull hardware"
                            value={part.pull}
                            disabled={locked}
                            help="Decorative hardware on a fixed front; this panel does not open."
                            onChange={(pull) => patch({ pull })}
                          />
                        )}
                      </Section>
                    )}
                    {part.kind === "Back panel" && (
                      <Section title="Appearance" collapsible>
                        <ParameterRow
                          label="Back panel style"
                          help="Decorative seams change this panel only; stock and shelf geometry stay unchanged."
                        >
                          <SwatchPicker
                            value={part.backStyle}
                            disabled={locked}
                            onChange={(backStyle) => patch({ backStyle })}
                            options={[
                              "Flat",
                              "Vertical shiplap",
                              "Vertical plank / slat",
                            ].map((label, index) => ({
                              id: label,
                              label,
                              preview: (
                                <svg viewBox="0 0 60 60" aria-hidden="true">
                                  <rect width="60" height="60" fill="#d8c6ac" />
                                  {Array.from(
                                    {
                                      length:
                                        index === 0 ? 0 : index === 1 ? 3 : 7,
                                    },
                                    (_, i) => (
                                      <path
                                        key={i}
                                        d={`M${(i + 1) * (index === 1 ? 15 : 7.5)} 0v60`}
                                        stroke="#81705a"
                                        strokeWidth={index === 1 ? 1 : 3}
                                      />
                                    ),
                                  )}
                                </svg>
                              ),
                            }))}
                          />
                        </ParameterRow>
                      </Section>
                    )}
                    <Section
                      title="Independent shape"
                      collapsible
                      modified={part.independent}
                    >
                      <Toggle
                        label="Separate shape"
                        value={part.independent}
                        disabled={locked}
                        help="Default: follow the shared cabinet outline. Use a separate outline for attachments such as end shelves."
                        onChange={(independent) => patch({ independent })}
                      />
                      {part.independent && (
                        <>
                          <Choice
                            label="Shape"
                            value={part.shape}
                            values={[
                              "Rectangular",
                              "Rounded left end",
                              "Rounded right end",
                            ]}
                            disabled={locked}
                            help="Width controls the end projection; depth controls the full curve span. The app owns actual outlines."
                            onChange={(shape) => patch({ shape })}
                          />
                          <EdgeChoice
                            label="Left edge"
                            value={part.left}
                            disabled={locked}
                            onChange={(left) => patch({ left })}
                          />
                          <EdgeChoice
                            label="Right edge"
                            value={part.right}
                            disabled={locked}
                            onChange={(right) => patch({ right })}
                          />
                          {(part.left !== "Square" ||
                            part.right !== "Square") && (
                            <Fields
                              fields={[
                                length(
                                  "part-radius",
                                  "Edge radius",
                                  part.radius,
                                  (v) => patch({ radius: v }),
                                  { min: 0.0625, disabled: locked },
                                ),
                              ]}
                            />
                          )}
                        </>
                      )}
                    </Section>
                  </>
                ) : (
                  <Status>Choose a part from the Parts menu.</Status>
                )}
              </Panel>
            </div>
          </aside>
          <section
            aria-label="Customizer preview"
            {...stylex.props(styles.preview)}
          >
            <figure {...stylex.props(styles.figure)}>
              <div {...stylex.props(styles.header)}>
                <Badge>{view} · Schematic</Badge>
                <InfoTooltip label="Schematic preview">
                  Selection, drawer identity and preview finish update here.
                  This is not Cabinitron geometry. Production adoption must
                  retain its actual advanced editor and renderer.
                </InfoTooltip>
              </div>
              <Drawing
                part={context === "Selected part" ? part : undefined}
                preview={preview}
                drawer={context === "Selected part" ? row : null}
              />
              <figcaption {...stylex.props(styles.readout)}>
                {inspectorTitle}
                <br />
                {context === "Selected part" && part
                  ? `${inches(part.width)} × ${inches(part.height)} × ${inches(part.depth)}`
                  : `${draft.width} × ${draft.height} × ${draft.depth}`}{" "}
                in
              </figcaption>
            </figure>
          </section>
        </div>
      </div>
      {notice && <Status tone="success">{notice}</Status>}
      <div {...stylex.props(styles.review)}>
        <Select
          label="Review scenario"
          value={scenario}
          onChange={(e) => {
            setScenario(e.currentTarget.value);
            setEpoch((n) => n + 1);
            setError("");
          }}
        >
          {["Room cabinet", "Standalone", "Read only"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </Select>
        <InfoTooltip label="Review data">
          Synthetic local state. Save stores a catalog snapshot; Cancel restores
          it. App geometry, authorization, sink attachment and library export
          are not implemented here.
        </InfoTooltip>
      </div>
      <SidePanel
        title={
          task === "add"
            ? "Add part"
            : task === "parts"
              ? "Choose part"
              : "Definition transfer"
        }
        open={!!task}
        onOpenChange={(open) => {
          if (!open) setTask("");
        }}
      >
        {task === "parts" ? (
          <List
            label="Cabinet parts"
            items={draft.parts.map((p) => ({
              id: p.id,
              title: p.name,
              metadata: p.kind,
              actions: [
                {
                  id: "select",
                  label: "Select part",
                  icon: "view",
                  onAction: () => {
                    selectPart(p.id);
                    setTask("");
                  },
                },
              ],
            }))}
          />
        ) : task === "add" ? (
          <List
            label="Part types"
            items={kindOptions.map((kind) => ({
              id: kind,
              title: kind,
              metadata: "Add to this draft",
              actions: [
                {
                  id: "add",
                  label: "Add " + kind.toLowerCase(),
                  icon: "add",
                  disabled: locked,
                  onAction: () => {
                    const id = `part-${nextId.current++}`;
                    update((n) => {
                      n.parts.push(createPart(kind, id));
                    });
                    selectPart(id);
                    setTask("");
                  },
                },
              ],
            }))}
          />
        ) : (
          <Status>
            Keep Cabinitron’s real definition import/export, validation and
            business-library workflow during adoption. Catalog fixture data is
            not a compatible cabinet definition.
          </Status>
        )}
      </SidePanel>
      <Dialog
        title={confirm === "bottom" ? "Remove bottom panel?" : "Remove part?"}
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm("");
        }}
        footer={
          <>
            <Button onClick={() => setConfirm("")}>Cancel</Button>
            <Button
              variant="danger"
              isDisabled={locked}
              onClick={() => {
                if (confirm === "bottom")
                  update((n) => {
                    n.bottom = false;
                  });
                else {
                  update((n) => {
                    n.parts = n.parts.filter((p) => p.id !== selected);
                  });
                  setSelected(
                    draft.parts.find((p) => p.id !== selected)?.id ?? "",
                  );
                  setRow(null);
                }
                setConfirm("");
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        This changes the current draft. Undo remains available before Save.
      </Dialog>
    </div>
  );
}
