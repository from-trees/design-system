import { VisualChoice, type swatches } from "./SwatchExamples";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Badge,
  Button,
  Dialog,
  IconButton,
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
  TextInput,
  type Parameter,
  type ParameterGroup,
} from "@from-trees/ui";
import { color } from "@from-trees/ui/tokens.stylex";
import { gap, layout } from "@from-trees/ui/utilities";

type Context = "selection" | "room" | "styles";
type Kind =
  | "base"
  | "upper"
  | "tall"
  | "storage"
  | "panel"
  | "appliance"
  | "fixture"
  | "door"
  | "window"
  | "opening"
  | "island"
  | "model"
  | "automatic"
  | "custom"
  | "wall";
type Item = {
  id: string;
  name: string;
  kind: Kind;
  placement: "wall" | "floor";
  width: number;
  height: number;
  depth: number;
  offset: number;
  z: number;
  wall: string;
  elevation: number;
  rotation: string;
  style: string;
  finish: string;
  configuration: string;
  doors: boolean;
  back: boolean;
  autoPanels: boolean;
  customBack: boolean;
  backThickness: number;
  countertop: boolean;
  overhang: number;
  thickness: number;
  seating: string;
  entry: string;
};
type SharedStyle = {
  id: string;
  name: string;
  material: string;
  color: string;
  face: string;
  overlay: string;
  grain: string;
};
const fixtures: [string, Kind][] = [
  ["Base cabinet", "base"],
  ["Wall cabinet", "upper"],
  ["Tall cabinet", "tall"],
  ["Open storage", "storage"],
  ["Room panel", "panel"],
  ["Appliance", "appliance"],
  ["Glass shower", "fixture"],
  ["Door", "door"],
  ["Window", "window"],
  ["Doorless opening", "opening"],
  ["Island", "island"],
  ["Imported model", "model"],
  ["Automatic finish panel", "automatic"],
  ["Custom cabinet", "custom"],
  ["Interior wall", "wall"],
];
const cabinetKinds: Kind[] = ["base", "upper", "tall", "storage", "custom"];
const makeItems = (): Item[] => [
  ...fixtures.map<Item>(([name, kind]) => ({
    id: kind,
    name,
    kind,
    placement: ["island", "model", "fixture", "wall"].includes(kind)
      ? "floor"
      : "wall",
    width:
      kind === "island"
        ? 48
        : kind === "panel" || kind === "automatic"
          ? 0.75
          : 30,
    height:
      kind === "tall"
        ? 84
        : kind === "upper"
          ? 30
          : kind === "fixture" || kind === "wall"
            ? 96
            : kind === "door" || kind === "opening"
              ? 80
              : 34.5,
    depth: kind === "upper" ? 12 : 24,
    offset: 12,
    z: 48,
    wall: "Back wall",
    elevation: kind === "upper" ? 54 : kind === "window" ? 36 : 0,
    rotation: "0",
    style: "oak",
    finish: "oak",
    configuration: "door-drawer",
    doors: true,
    back: true,
    autoPanels: true,
    customBack: false,
    backThickness: 0.5,
    countertop: kind === "island",
    overhang: 1,
    thickness: 1.5,
    seating: kind === "fixture" ? "front" : kind === "door" ? "left" : "none",
    entry: "door",
  })),
  {
    id: "attention",
    name: "Cabinet needing attention",
    kind: "base",
    placement: "wall",
    width: 30,
    height: 34.5,
    depth: 24,
    offset: 12,
    z: 48,
    wall: "Back wall",
    elevation: 0,
    rotation: "0",
    style: "white",
    finish: "oak",
    configuration: "door-drawer",
    doors: true,
    back: true,
    autoPanels: true,
    customBack: false,
    backThickness: 0.5,
    countertop: true,
    overhang: 28,
    thickness: 1.5,
    seating: "none",
    entry: "door",
  },
];
const initialItems = () => {
  const items = makeItems();
  return [
    ...items,
    {
      ...items[0],
      id: "floor-base",
      name: "Freestanding cabinet",
      placement: "floor" as const,
    },
  ];
};
const styles = stylex.create({
  workbench: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 320px) minmax(0, 1fr)",
      "@media (max-width: 1150px)": "minmax(0, 1fr)",
    },
    gap: 24,
    alignItems: "start",
    minWidth: 0,
  },
  inspector: { width: "100%", maxWidth: 320, minWidth: 0 },
  scroll: {
    boxSizing: "border-box",
    height: 500,
    overflowY: "auto",
    scrollbarGutter: "stable",
    paddingRight: 4,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  note: { fontSize: 12, lineHeight: 1.6, color: color.muted, margin: 0 },
  title: { fontSize: 14, fontWeight: 650, margin: 0, color: color.ink },
  controls: { display: "flex", flexDirection: "column", gap: 16, minWidth: 0 },
  inline: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
});
const measurementHelp =
  "Use decimals or fractions. Changes apply when focus leaves the field. Enter finishes editing; Escape resets the draft. Field info explains limits and snapping.";
function numeric(
  id: string,
  label: string,
  value: number,
  onChange: (value: number) => void,
  options: Partial<Parameter> = {},
): Parameter {
  const unit = options.unit ?? "in";
  const limits = [
    options.min != null && `Minimum: ${options.min}${unit ? ` ${unit}` : ""}.`,
    options.max != null && `Maximum: ${options.max}${unit ? ` ${unit}` : ""}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    id,
    label,
    value,
    onChange,
    ...options,
    help: [options.help, limits].filter(Boolean).join(" "),
  };
}
function NumericRows({
  fields,
  heading,
  guidance = false,
}: {
  fields: Parameter[];
  heading?: string;
  guidance?: boolean;
}) {
  const groups: ParameterGroup[] = [
    {
      id: heading ?? "fields",
      label: heading,
      parameters: fields,
      ...(guidance
        ? { help: measurementHelp, helpLabel: "Entering measurements" }
        : {}),
    },
  ];
  return <Parameters groups={groups} unit="in" />;
}
function Choice({
  label,
  value,
  options,
  onChange,
  disabled,
  help,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  help?: string;
}) {
  return (
    <ParameterRow label={label} help={help}>
      <Select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </ParameterRow>
  );
}
function Toggle({
  label,
  value,
  onChange,
  disabled,
  help,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  help?: string;
}) {
  return (
    <ParameterRow label={label} help={help}>
      <Switch selected={value} onChange={onChange} disabled={disabled} />
    </ParameterRow>
  );
}

/** Cabinitron-specific exploration lives only in the catalog app, not the package. */
export function DesignerSidebarPrototype() {
  const seeds = useRef(initialItems());
  const [items, setItems] = useState<Item[]>(seeds.current);
  const [selected, setSelected] = useState("base");
  const [context, setContext] = useState<Context>("selection");
  const [readOnly, setReadOnly] = useState(false);
  const [sharedStyles, setSharedStyles] = useState<SharedStyle[]>([
    {
      id: "oak",
      name: "Natural oak",
      material: "Oak",
      color: "Natural",
      face: "Shaker",
      overlay: "Full overlay",
      grain: "Automatic",
    },
    {
      id: "white",
      name: "Painted white",
      material: "Paint grade",
      color: "White",
      face: "Slab",
      overlay: "Inset",
      grain: "Automatic",
    },
  ]);
  const [room, setRoom] = useState({
    width: 144,
    height: 96,
    depth: 120,
    wall: 4.5,
    toe: 4,
    recess: 3,
    walls: "Warm plaster",
    floor: "Oak",
    countertopSurface: "White quartz",
    edgeOverhang: 0.125,
    frames: false,
    maple: false,
    crown: "None",
    crownFinish: "Oak",
    resolution: "0.125",
  });
  const [wallOverrides, setWallOverrides] = useState<Record<string, number>>(
    {},
  );
  const [outline, setOutline] = useState(false);
  const [selectedWall, setSelectedWall] = useState("Back wall");
  const [styleDraft, setStyleDraft] = useState<SharedStyle | null>(null);
  const [rename, setRename] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [task, setTask] = useState<"customize" | "countertop" | null>(null);
  const [taskDraft, setTaskDraft] = useState<Item | null>(null);
  const [message, setMessage] = useState("");
  const sequence = useRef(0);
  const inspectorRef = useRef<HTMLElement>(null);
  const taskBodyRef = useRef<HTMLDivElement>(null);
  const returnToContext = useRef(false);
  useEffect(() => {
    if (!task && returnToContext.current) {
      returnToContext.current = false;
      inspectorRef.current?.querySelector<HTMLSelectElement>("select")?.focus();
    }
  }, [task]);
  const storedItem = items.find((candidate) => candidate.id === selected);
  const owner = items.find((candidate) => candidate.id === "base");
  const item =
    storedItem?.kind === "automatic" && owner
      ? { ...storedItem, height: owner.height, depth: owner.depth }
      : storedItem?.kind === "wall"
        ? { ...storedItem, depth: wallOverrides["Interior wall"] ?? room.wall }
        : storedItem;
  const baseline =
    seeds.current.find((candidate) => candidate.id === selected) ?? item;
  const cabinet = item && cabinetKinds.includes(item.kind);
  const locked = readOnly || item?.kind === "automatic";
  const patch = (changes: Partial<Item>) =>
    setItems((current) =>
      current.map((candidate) =>
        candidate.id === selected ? { ...candidate, ...changes } : candidate,
      ),
    );
  const pick = (id: string) => {
    setSelected(id);
    setContext("selection");
    setMessage("");
    setTask(null);
    setTaskDraft(null);
  };
  const uses = (id: string) =>
    items.filter(
      (candidate) =>
        cabinetKinds.includes(candidate.kind) && candidate.style === id,
    ).length;
  const assigned = sharedStyles.find((style) => style.id === item?.style);
  const openStyle = (style: SharedStyle) => setStyleDraft({ ...style });
  const openTask = (next: "customize" | "countertop") => {
    if (!item) return;
    setTaskDraft({ ...item });
    setTask(next);
  };
  const commitTask = () => {
    if (
      !taskDraft ||
      readOnly ||
      taskBodyRef.current?.querySelector('[aria-invalid="true"]')
    )
      return;
    returnToContext.current =
      task === "countertop" &&
      (item?.overhang ?? 0) > 24 &&
      taskDraft.overhang <= 24;
    setItems((current) =>
      current.map((candidate) =>
        candidate.id === taskDraft.id ? taskDraft : candidate,
      ),
    );
    setTask(null);
    setTaskDraft(null);
  };
  const num = (
    key: "width" | "height" | "depth" | "offset" | "elevation" | "z",
    label: string,
    options: Partial<Parameter> = {},
  ) =>
    numeric(
      key,
      label,
      key === "height" && item && ["fixture", "wall"].includes(item.kind)
        ? room.height
        : item![key],
      (value) => {
        if (key === "depth" && item?.kind === "wall") {
          setWallOverrides((current) => ({
            ...current,
            "Interior wall": value,
          }));
          return;
        }
        if (key === "width" && item?.kind === "model") {
          const ratio = value / item.width;
          patch({
            width: value,
            height: item.height * ratio,
            depth: item.depth * ratio,
          });
          return;
        }
        const opening =
          item && ["door", "window", "opening"].includes(item.kind);
        patch({
          [key]:
            !opening && ["offset", "elevation", "z"].includes(key)
              ? Math.round(value / Number(room.resolution)) *
                Number(room.resolution)
              : value,
        });
      },
      { readOnly: locked, ...options },
    );
  const stepHelp = `Rounded to the nearest ${room.resolution} in after focus leaves the field. `;
  const positive = {
    validate: (value: number) =>
      value > 0 ? undefined : "Enter a value greater than zero.",
    help: "Must be greater than zero.",
  };
  const usageDescription = styleDraft
    ? `Shared style · affects ${uses(styleDraft.id)} ${uses(styleDraft.id) === 1 ? "object" : "objects"} in this example.`
    : "";
  let body: ReactNode;

  if (context === "styles") {
    body = (
      <>
        <p {...stylex.props(styles.note)}>
          Shared styles affect every object assigned to them.
        </p>
        <List
          label="Shared styles"
          items={sharedStyles.map((style) => ({
            id: style.id,
            title: style.name,
            metadata: `${uses(style.id)} assigned ${uses(style.id) === 1 ? "object" : "objects"}`,
            actions: [
              {
                id: "edit",
                label: readOnly ? "Inspect style" : "Edit shared style",
                icon: "edit",
                onAction: () => openStyle(style),
              },
            ],
          }))}
        />
        <Button
          icon="add"
          isDisabled={readOnly}
          onPress={() => {
            const id = `style-${++sequence.current}`;
            setStyleDraft({
              id,
              name: "New style",
              material: "Oak",
              color: "Natural",
              face: "Slab",
              overlay: "Full overlay",
              grain: "Automatic",
            });
          }}
        >
          Add style
        </Button>
      </>
    );
  } else if (context === "room") {
    body = (
      <>
        <NumericRows
          heading="Size"
          guidance
          fields={(["width", "height", "depth"] as const).map((key) =>
            numeric(
              key,
              key[0].toUpperCase() + key.slice(1),
              room[key],
              (value) => setRoom((current) => ({ ...current, [key]: value })),
              { min: 12, max: 10000, readOnly, icon: key },
            ),
          )}
        />
        <Button
          icon="edit"
          isDisabled={readOnly}
          onPress={() => setOutline((current) => !current)}
        >
          {outline ? "Finish outline editing" : "Edit room outline"}
        </Button>
        {outline && (
          <>
            <Status>Select a wall in the plan.</Status>
            <NumericRows
              heading={selectedWall}
              fields={[
                numeric(
                  "wall-thickness",
                  "Thickness",
                  wallOverrides[selectedWall] ?? room.wall,
                  (value) =>
                    setWallOverrides((current) => ({
                      ...current,
                      [selectedWall]: value,
                    })),
                  {
                    min: 1,
                    max: 24,
                    readOnly,
                    help: `Override for ${selectedWall} only. The room default is ${room.wall} in.`,
                  },
                ),
              ]}
            />
            <Button
              isDisabled={readOnly || wallOverrides[selectedWall] === undefined}
              onPress={() =>
                setWallOverrides((current) => {
                  const next = { ...current };
                  delete next[selectedWall];
                  return next;
                })
              }
            >
              Use room default
            </Button>
          </>
        )}
        <Section
          title="Surfaces"
          collapsible
          modified={
            room.walls !== "Warm plaster" ||
            room.floor !== "Oak" ||
            room.countertopSurface !== "White quartz"
          }
        >
          <VisualChoice
            label="Walls"
            category="walls"
            value={room.walls}
            disabled={readOnly}
            onChange={(walls) => setRoom((current) => ({ ...current, walls }))}
          />
          <VisualChoice
            label="Floor"
            category="floors"
            value={room.floor}
            disabled={readOnly}
            onChange={(floor) => setRoom((current) => ({ ...current, floor }))}
          />
          <VisualChoice
            label="Countertops"
            category="countertops"
            value={room.countertopSurface}
            disabled={readOnly}
            onChange={(countertopSurface) =>
              setRoom((current) => ({ ...current, countertopSurface }))
            }
          />
        </Section>
        <Section
          title="Construction defaults"
          collapsible
          modified={
            room.frames ||
            room.maple ||
            room.toe !== 4 ||
            room.recess !== 3 ||
            room.wall !== 4.5 ||
            room.edgeOverhang !== 0.125
          }
        >
          <NumericRows
            fields={[
              numeric(
                "edge-overhang",
                "Countertop edge overhang",
                room.edgeOverhang,
                (value) =>
                  setRoom((current) => ({ ...current, edgeOverhang: value })),
                {
                  min: 0,
                  max: 12,
                  readOnly,
                  help: "Default beyond the cabinet body. Island seating overhang is separate.",
                },
              ),

              numeric(
                "wall",
                "Wall thickness",
                room.wall,
                (value) => setRoom((current) => ({ ...current, wall: value })),
                { min: 1, max: 24, readOnly },
              ),
              numeric(
                "toe",
                "Toe-kick height",
                room.toe,
                (value) => setRoom((current) => ({ ...current, toe: value })),
                { min: 0.5, max: 12, readOnly },
              ),
              numeric(
                "recess",
                "Toe-kick recess",
                room.recess,
                (value) =>
                  setRoom((current) => ({ ...current, recess: value })),
                { min: 0, max: 12, readOnly },
              ),
            ]}
          />
          <Toggle
            label="Continuous face frames"
            value={room.frames}
            disabled={readOnly}
            onChange={(frames) =>
              setRoom((current) => ({ ...current, frames }))
            }
            help="Share compatible face frames across adjacent cabinets. This is a room default."
          />
          <Toggle
            label="Maple internals"
            value={room.maple}
            disabled={readOnly}
            onChange={(maple) => setRoom((current) => ({ ...current, maple }))}
          />
        </Section>
        <Section title="Crown" collapsible modified={room.crown !== "None"}>
          <VisualChoice
            label="Profile"
            category="crown"
            value={room.crown}
            disabled={readOnly}
            onChange={(crown) => setRoom((current) => ({ ...current, crown }))}
            help="Crown belongs to the room. Profile geometry and finish are separate decisions."
          />
          {room.crown !== "None" && (
            <VisualChoice
              label="Finish"
              category="finish"
              value={room.crownFinish}
              disabled={readOnly}
              onChange={(crownFinish) =>
                setRoom((current) => ({ ...current, crownFinish }))
              }
              help="Finish does not change the selected profile's geometry."
            />
          )}
        </Section>
        <Section
          title="Positioning"
          collapsible
          modified={room.resolution !== "0.125"}
        >
          <ParameterRow
            label="Grid increment"
            help="Choose 1/16, 1/8 or 1 in. Positions round to this increment when editing ends."
          >
            <Select
              value={room.resolution}
              disabled={readOnly}
              onChange={(event) =>
                setRoom((current) => ({
                  ...current,
                  resolution: event.currentTarget.value,
                }))
              }
            >
              <option value="0.0625">1/16 in</option>
              <option value="0.125">1/8 in</option>
              <option value="1">1 in</option>
            </Select>
          </ParameterRow>
        </Section>
      </>
    );
  } else if (!item) {
    body = (
      <>
        <Status>Select an object in the plan or 3D view.</Status>
        <Button icon="settings" onPress={() => setContext("room")}>
          Room settings
        </Button>
      </>
    );
  } else {
    const opening = ["door", "window", "opening"].includes(item.kind);
    const model = item.kind === "model";
    const automatic = item.kind === "automatic";
    const wall = item.kind === "wall";
    const topApplicable = item.kind === "base" || item.kind === "island";
    const attention = item.countertop && item.overhang > 24;
    body = (
      <>
        {automatic && (
          <>
            <p {...stylex.props(styles.note)}>Attached to Base cabinet.</p>
            <Button icon="external" onPress={() => pick("base")}>
              Select controlling cabinet
            </Button>
          </>
        )}
        {attention && (
          <Status tone="danger">
            Countertop needs attention.{" "}
            <Button isDisabled={locked} onPress={() => openTask("countertop")}>
              Review countertop
            </Button>
          </Status>
        )}
        <NumericRows
          heading="Size"
          guidance
          fields={[
            num(
              "width",
              item.kind === "panel" || automatic
                ? "Thickness"
                : wall
                  ? "Length"
                  : "Width",
              {
                ...positive,
                max: 10000,
                icon: "width",
                help: model
                  ? "Must be greater than zero. Width scales the whole imported model."
                  : positive.help,
              },
            ),
            num("height", "Height", {
              readOnly: locked || model || item.kind === "fixture" || wall,
              ...(opening
                ? { min: 1 }
                : !model && item.kind !== "fixture"
                  ? { min: 12, max: room.height - item.elevation }
                  : {}),
              icon: "height",
              help: model
                ? "Follows the imported model's proportions."
                : item.kind === "fixture"
                  ? "Follows the ceiling in this example."
                  : undefined,
            }),
            ...(!opening
              ? [
                  num("depth", wall ? "Thickness" : "Depth", {
                    readOnly: locked || model,
                    ...(!model
                      ? { min: wall ? 1 : 4, max: wall ? 24 : 60 }
                      : {}),
                    icon: "depth",
                    help: model
                      ? "Follows the imported model's proportions."
                      : undefined,
                  }),
                ]
              : []),
          ]}
        />
        {!automatic && (
          <NumericRows
            heading="Position"
            fields={[
              num(
                "offset",
                item.placement === "floor" ? "X position" : "Offset from left",
                {
                  min: 0,
                  max: 10000,
                  icon: "offset",
                  help: opening
                    ? "Opening offsets are not rounded by this editor."
                    : stepHelp,
                  reference:
                    item.placement === "floor"
                      ? "Measured along the room X axis."
                      : "From the start of the parent wall.",
                },
              ),
              ...(item.placement === "floor"
                ? [
                    num("z", "Z position", {
                      min: -10000,
                      max: 10000,
                      icon: "offset",
                      help: stepHelp,
                    }),
                  ]
                : []),
              ...(!["island", "wall", "door", "opening", "fixture"].includes(
                item.kind,
              )
                ? [
                    num("elevation", "Height from floor", {
                      min: 0,
                      max: room.height - item.height,
                      icon: "ground",
                      help: `${stepHelp} ${item.kind === "window" ? "Measured to the window sill." : "Measured to the object's bottom."}`,
                    }),
                  ]
                : []),
            ]}
          />
        )}
        {!automatic && item.placement === "floor" && !wall && (
          <Section
            title="Orientation"
            collapsible
            modified={item.rotation !== "0"}
          >
            <Choice
              label="Rotation"
              value={item.rotation}
              options={["0", "90", "180", "270"]}
              disabled={locked}
              onChange={(rotation) => patch({ rotation })}
              help="Available rotations are 0°, 90°, 180° and 270°."
            />
          </Section>
        )}
        {cabinet && (
          <>
            <Section
              title="Appearance"
              collapsible
              modified={item.style !== baseline?.style}
            >
              <ParameterRow
                label="Assigned style"
                help="Changes only this object's style assignment. Editing the shared style affects all objects using it."
              >
                <Select
                  value={item.style}
                  disabled={locked}
                  onChange={(event) =>
                    patch({ style: event.currentTarget.value })
                  }
                >
                  {sharedStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </Select>
              </ParameterRow>
              <div {...stylex.props(styles.inline)}>
                <span {...stylex.props(styles.note)}>
                  {assigned?.name} · {uses(item.style)}{" "}
                  {uses(item.style) === 1 ? "object" : "objects"}
                </span>
                <IconButton
                  icon="edit"
                  label="Edit assigned shared style"
                  onPress={() => assigned && openStyle(assigned)}
                />
              </div>
            </Section>
            <Section
              title="Construction"
              collapsible
              modified={
                item.autoPanels !== baseline?.autoPanels ||
                item.customBack !== baseline?.customBack ||
                item.backThickness !== baseline?.backThickness ||
                item.doors !== baseline?.doors ||
                item.back !== baseline?.back ||
                item.configuration !== baseline?.configuration
              }
            >
              <VisualChoice
                label="Configuration"
                category="configuration"
                value={item.configuration}
                disabled={locked}
                onChange={(configuration) => patch({ configuration })}
              />
              {item.kind === "storage" && (
                <>
                  <Toggle
                    label="Doors"
                    value={item.doors}
                    disabled={locked}
                    onChange={(doors) => patch({ doors })}
                  />
                  <Toggle
                    label="Finished back"
                    value={item.back}
                    disabled={locked}
                    onChange={(back) => patch({ back })}
                  />
                </>
              )}
              <Toggle
                label="Automatic finish panels"
                value={item.autoPanels}
                disabled={locked}
                onChange={(autoPanels) => patch({ autoPanels })}
              />
              <Toggle
                label="Custom back thickness"
                value={item.customBack}
                disabled={locked}
                onChange={(customBack) => patch({ customBack })}
              />
              {item.customBack && (
                <NumericRows
                  fields={[
                    numeric(
                      "back",
                      "Back thickness",
                      item.backThickness,
                      (value) => patch({ backThickness: value }),
                      {
                        min: 0.125,
                        max: 1.5,
                        readOnly: locked,
                        help: "Overrides the standard cabinet back thickness.",
                      },
                    ),
                  ]}
                />
              )}
              <Button
                icon="external"
                isDisabled={locked}
                onPress={() => openTask("customize")}
              >
                Customize cabinet
              </Button>
            </Section>
          </>
        )}
        {(item.kind === "panel" || item.kind === "appliance") && (
          <Section
            title="Appearance"
            collapsible
            modified={item.finish !== "oak"}
          >
            <VisualChoice
              label={item.kind === "appliance" ? "Front finish" : "Material"}
              category="object"
              value={item.finish}
              disabled={locked}
              onChange={(finish) => patch({ finish })}
              help="An object-specific finish. This does not edit a shared cabinet style."
            />
          </Section>
        )}
        {opening && (
          <Section
            title="Opening"
            collapsible
            modified={
              item.entry !== baseline?.entry || item.wall !== baseline?.wall
            }
          >
            <Choice
              label="Wall"
              value={item.wall}
              options={[
                "Back wall",
                "Left wall",
                "Right wall",
                "Interior wall",
              ]}
              disabled={locked}
              onChange={(wall) => patch({ wall })}
              help="The opening's parent wall."
            />
            {item.kind === "door" && (
              <>
                <Choice
                  label="Door type"
                  value={item.entry}
                  options={["door", "pocket", "sliding", "double"]}
                  disabled={locked}
                  onChange={(entry) => patch({ entry })}
                />
                <Choice
                  label="Hinge side"
                  value={item.seating}
                  options={["left", "right"]}
                  disabled={locked}
                  onChange={(seating) => patch({ seating })}
                />
              </>
            )}
          </Section>
        )}
        {item.kind === "fixture" && (
          <Section
            title="Fixture"
            collapsible
            modified={
              item.entry !== baseline?.entry || item.wall !== baseline?.wall
            }
          >
            <Choice
              label="Entry"
              value={item.entry}
              options={["door", "open"]}
              disabled={locked}
              onChange={(entry) => patch({ entry })}
            />
            <Choice
              label="Entry side"
              value={item.seating}
              options={["front", "left", "right"]}
              disabled={locked}
              onChange={(seating) => patch({ seating })}
              help="The entry side within the shower enclosure."
            />
          </Section>
        )}
        {item.kind === "island" && (
          <Section
            title="Seating"
            collapsible
            modified={item.seating !== "none"}
          >
            <Choice
              label="Side"
              value={item.seating}
              options={["none", "north", "south", "east", "west"]}
              disabled={locked}
              onChange={(seating) => patch({ seating })}
            />
          </Section>
        )}
        {topApplicable && (
          <Section
            title="Countertop"
            collapsible
            modified={
              item.countertop !== baseline?.countertop ||
              item.thickness !== baseline?.thickness ||
              item.overhang !== baseline?.overhang
            }
            hasError={attention}
          >
            {attention && (
              <Status tone="danger">
                Overhang exceeds 24 in. Edit the countertop to resolve it.
              </Status>
            )}
            <Toggle
              label="Enabled"
              value={item.countertop}
              disabled={locked}
              onChange={(countertop) => patch({ countertop })}
            />
            {item.countertop && (
              <Button
                icon="edit"
                isDisabled={locked}
                onPress={() => openTask("countertop")}
              >
                Edit countertop
              </Button>
            )}
          </Section>
        )}
        {model && (
          <Section title="Model source" collapsible>
            <p {...stylex.props(styles.note)}>
              sample-cabinet.glb · embedded materials
            </p>
            <Button
              icon="redo"
              isDisabled={locked}
              onPress={() =>
                setMessage(
                  "Example model reload completed. No asset was fetched.",
                )
              }
            >
              Reload model
            </Button>
          </Section>
        )}
      </>
    );
  }

  return (
    <>
      <div {...stylex.props(styles.workbench)}>
        <aside
          ref={inspectorRef}
          aria-label="Designer sidebar prototype"
          {...stylex.props(styles.inspector, layout.stack, gap.md)}
        >
          <Select
            label="Editing context"
            value={context}
            onChange={(event) => {
              setContext(event.currentTarget.value as Context);
              setMessage("");
            }}
          >
            <option value="selection">Selection</option>
            <option value="room">Room</option>
            <option value="styles">Styles</option>
          </Select>
          <Panel
            title={
              context === "selection"
                ? (item?.name ?? "No selection")
                : context === "room"
                  ? "Room"
                  : "Styles"
            }
            actions={
              <div {...stylex.props(styles.inline)}>
                {readOnly && <Badge>Read-only</Badge>}
                {context === "selection" && item?.kind === "automatic" && (
                  <Badge>Generated</Badge>
                )}
                {context === "selection" &&
                item &&
                item.kind !== "automatic" ? (
                  <MenuButton
                    label="Object actions"
                    actions={[
                      {
                        id: "rename",
                        label: "Rename",
                        icon: "edit",
                        disabled: locked,
                        onAction: () => setRename(item.name),
                      },
                      {
                        id: "duplicate",
                        label: "Duplicate",
                        icon: "copy",
                        disabled: locked,
                        onAction: () => {
                          const id = `copy-${++sequence.current}`;
                          const copy = {
                            ...item,
                            id,
                            name: `${item.name} copy`,
                          };
                          seeds.current.push({ ...copy });
                          setItems((current) => [...current, copy]);
                          pick(id);
                        },
                      },
                      {
                        id: "remove",
                        label: "Remove",
                        icon: "delete",
                        destructive: true,
                        separatorBefore: true,
                        disabled: locked,
                        onAction: () => setRemove(true),
                      },
                    ]}
                  />
                ) : undefined}
              </div>
            }
          >
            <div
              key={`${context}-${selected}`}
              {...stylex.props(styles.scroll)}
            >
              {body}
              {message && <Status>{message}</Status>}
            </div>
          </Panel>
        </aside>
        <section
          aria-label="Prototype review controls"
          {...stylex.props(styles.controls)}
        >
          <h3 {...stylex.props(styles.title)}>Review controls</h3>
          <Select
            label="Example selection"
            value={selected}
            onChange={(event) => pick(event.currentTarget.value)}
          >
            <option value="">No selection</option>
            {items.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </Select>
          <Select
            label="Access mode"
            value={readOnly ? "read" : "edit"}
            onChange={(event) =>
              setReadOnly(event.currentTarget.value === "read")
            }
          >
            <option value="edit">Editable</option>
            <option value="read">Read-only</option>
          </Select>
          {outline && (
            <Select
              label="Example plan wall selection"
              value={selectedWall}
              onChange={(event) => setSelectedWall(event.currentTarget.value)}
            >
              {["Back wall", "Left wall", "Interior wall"].map((wall) => (
                <option key={wall}>{wall}</option>
              ))}
            </Select>
          )}
          <p {...stylex.props(styles.note)}>
            These controls stand in for plan/3D selection. They are outside the
            proposed application sidebar.
          </p>
          <Status>
            Interactive prototype. All edits affect synthetic browser-local
            state only.
          </Status>
          <p {...stylex.props(styles.note)}>
            Explore contexts, collapsed sections, shared-style impact, object
            menus and focused tasks. Measurement limits are illustrative.
            Geometry, production constraints and fabrication remain in the app.
          </p>
        </section>
      </div>
      <Dialog
        title="Rename object"
        open={rename !== null}
        onOpenChange={(open) => !open && setRename(null)}
        footer={
          <Button
            variant="primary"
            isDisabled={readOnly || !rename?.trim()}
            onPress={() => {
              patch({ name: rename!.trim() });
              setRename(null);
            }}
          >
            Save name
          </Button>
        }
      >
        <TextInput
          label="Name"
          value={rename ?? ""}
          onChange={(event) => setRename(event.currentTarget.value)}
        />
      </Dialog>
      <Dialog
        title="Remove object?"
        description={item?.name}
        open={remove}
        onOpenChange={setRemove}
        footer={
          <Button
            variant="danger"
            isDisabled={readOnly}
            onPress={() => {
              setItems((current) =>
                current.filter((candidate) => candidate.id !== selected),
              );
              pick("");
              setRemove(false);
            }}
          >
            Remove object
          </Button>
        }
      >
        <p>This removes the object from this example only.</p>
      </Dialog>
      <Dialog
        title={readOnly ? "Shared style" : "Edit shared style"}
        description={usageDescription}
        open={!!styleDraft}
        onOpenChange={(open) => !open && setStyleDraft(null)}
        footer={
          !readOnly && (
            <Button
              variant="primary"
              isDisabled={!styleDraft?.name.trim()}
              onPress={() => {
                const saved = { ...styleDraft!, name: styleDraft!.name.trim() };
                setSharedStyles((current) =>
                  current.some((style) => style.id === saved.id)
                    ? current.map((style) =>
                        style.id === saved.id ? saved : style,
                      )
                    : [...current, saved],
                );
                setStyleDraft(null);
              }}
            >
              Save shared style
            </Button>
          )
        }
      >
        {styleDraft && (
          <div {...stylex.props(layout.stack, gap.lg)}>
            <Status>
              Changes apply to every assigned object, not just the current
              selection.
            </Status>
            <TextInput
              label="Style name"
              value={styleDraft.name}
              readOnly={readOnly}
              onChange={(event) =>
                setStyleDraft({
                  ...styleDraft,
                  name: event.currentTarget.value,
                })
              }
            />
            {(
              [
                ["material", "Material", "material"],
                ["color", "Color / finish", "color"],
                ["face", "Door / drawer profile", "front"],
                ["overlay", "Overlay", "overlay"],
                ["grain", "Grain", "grain"],
              ] as const
            ).map(([key, label, category]) => (
              <VisualChoice
                key={key}
                label={label}
                value={styleDraft[key]}
                category={category as keyof typeof swatches}
                disabled={readOnly}
                onChange={(value) =>
                  setStyleDraft({ ...styleDraft, [key]: value })
                }
              />
            ))}
          </div>
        )}
      </Dialog>
      <SidePanel
        title={task === "customize" ? "Customize cabinet" : "Edit countertop"}
        description={taskDraft?.name}
        open={!!taskDraft}
        onOpenChange={(open) => {
          if (!open) {
            setTask(null);
            setTaskDraft(null);
          }
        }}
        footer={
          <Button
            variant="primary"
            isDisabled={
              readOnly ||
              (task === "countertop" && (taskDraft?.overhang ?? 0) > 24)
            }
            onPress={commitTask}
          >
            Save changes
          </Button>
        }
      >
        {taskDraft && (
          <div ref={taskBodyRef} {...stylex.props(layout.stack, gap.xl)}>
            {task === "customize" ? (
              <>
                <NumericRows
                  heading="Body size"
                  guidance
                  fields={(["width", "height", "depth"] as const).map((key) =>
                    numeric(
                      key,
                      key[0].toUpperCase() + key.slice(1),
                      taskDraft[key],
                      (value) => setTaskDraft({ ...taskDraft, [key]: value }),
                      {
                        min:
                          key === "height"
                            ? 12
                            : key === "depth"
                              ? 4
                              : undefined,
                        max:
                          key === "height"
                            ? room.height - taskDraft.elevation
                            : key === "depth"
                              ? 60
                              : 10000,
                        ...(key === "width" ? positive : {}),

                        readOnly,
                      },
                    ),
                  )}
                />
                <VisualChoice
                  category="configuration"
                  label="Front layout"
                  value={taskDraft.configuration}
                  disabled={readOnly}
                  onChange={(configuration) =>
                    setTaskDraft({ ...taskDraft, configuration })
                  }
                />
                <Status>
                  Detailed parts, joinery and fabrication remain in the
                  application editor.
                </Status>
              </>
            ) : (
              <>
                <NumericRows
                  heading="Countertop"
                  guidance
                  fields={[
                    numeric(
                      "thickness",
                      "Thickness",
                      taskDraft.thickness,
                      (value) =>
                        setTaskDraft({ ...taskDraft, thickness: value }),
                      {
                        min: 0.5,
                        max: 4,
                        readOnly,
                      },
                    ),
                    numeric(
                      "overhang",
                      "Overhang",
                      taskDraft.overhang,
                      (value) =>
                        setTaskDraft({ ...taskDraft, overhang: value }),
                      {
                        min: 0,
                        max: 24,
                        readOnly,
                        help: "Measured beyond the cabinet edge.",
                      },
                    ),
                  ]}
                />
                {taskDraft.overhang > 24 && (
                  <Status tone="danger">
                    Reduce overhang to 24 in or less before saving.
                  </Status>
                )}
              </>
            )}
          </div>
        )}
      </SidePanel>
    </>
  );
}
