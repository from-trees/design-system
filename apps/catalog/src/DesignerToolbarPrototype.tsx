import { useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Button,
  CommandBar,
  WorkspaceHeader,
  TaskHeader,
  Select,
  SegmentedControl,
  Dialog,
  SidePanel,
  TextInput,
  InfoTooltip,
  List,
  Status,
  Shimmer,
  type Action,
  type CommandStatus,
} from "@from-trees/ui";
import { color } from "@from-trees/ui/tokens.stylex";
import { layout, gap } from "@from-trees/ui/utilities";
const styles = stylex.create({
  root: { width: "100%", minWidth: 0 },
  frame: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: color.surface,
    minWidth: 0,
  },
  bar: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  select: { width: 145, minWidth: 0 },
  wideSelect: { width: 190, minWidth: 0, maxWidth: "100%" },
  views: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2,minmax(0,1fr))",
      "@media (max-width: 700px)": "minmax(0,1fr)",
    },
  },
  single: { gridTemplateColumns: "minmax(0,1fr)" },
  pane: {
    minWidth: 0,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: color.border,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  canvas: {
    position: "relative",
    minHeight: 250,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: color.canvas,
    boxSizing: "border-box",
  },
  drawing: { width: "100%", maxWidth: 320, height: 220, display: "block" },
  elevationFigure: { margin: 0, fontSize: 13 },
  elevationSheet: { width: "100%", height: 160, display: "block" },
  caption: { fontSize: 12, color: color.muted, margin: 0 },
  stats: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.border,
    fontSize: 12,
    color: color.muted,
  },
  settings: {
    display: "flex",
    alignItems: "end",
    flexWrap: "wrap",
    gap: 16,
    paddingTop: 20,
  },
  place: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: color.subtle,
    color: color.ink,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 8,
    padding: 12,
    cursor: "crosshair",
    maxWidth: "100%",
  },
  preview: {
    width: "100%",
    minHeight: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.canvas,
  },
});
const statuses: Record<string, CommandStatus> = {
  saved: { label: "Saved", tone: "success" },
  unsaved: { label: "Unsaved", tone: "warning" },
  saving: { label: "Saving…" },
  error: {
    label: "Unable to save",
    description: "Unable to save. Reconnect, then retry from Project actions.",
    tone: "danger",
  },
};
const choose = (
  label: string,
  value: string,
  onChange: (value: string) => void,
  options: readonly (string | { value: string; label: string })[],
  wide = false,
  disabled = false,
) => (
  <span {...stylex.props(wide ? styles.wideSelect : styles.select)}>
    <Select
      aria-label={label}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    >
      {options.map((v) => {
        const option = typeof v === "string" ? { value: v, label: v } : v;
        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </Select>
  </span>
);
export function CommandBarsDemo() {
  const [preset, setPreset] = useState("Blank cabinet");
  const [state, setState] = useState("saved"),
    [notice, setNotice] = useState(""),
    [task, setTask] = useState(false);
  return (
    <div {...stylex.props(layout.stack, gap.xl, styles.root)}>
      <div {...stylex.props(styles.frame)}>
        <WorkspaceHeader
          title="Document name"
          metadata="Workspace · document context"
          label="Document commands"
          status={statuses[state]}
          primary={{
            id: "undo",
            label: "Undo",
            icon: "undo",
            onAction: () => setNotice("Undo selected"),
          }}
          menuLabel="Document actions"
          actions={[
            {
              id: "history",
              label: "History",
              icon: "history",
              onAction: () => setTask(true),
            },
            {
              id: "retry",
              label: "Retry saving",
              icon: "save",
              disabled: state !== "error",
              onAction: () => setState("saved"),
            },
          ]}
        />
        <div {...stylex.props(styles.bar)}>
          <CommandBar
            label="Viewport commands"
            menuLabel="Viewport actions"
            actions={[
              {
                id: "fit",
                label: "Fit view",
                icon: "fit",
                onAction: () => setNotice("Fit view selected"),
              },
              {
                id: "pan",
                label: "Pan",
                icon: "pan",
                onAction: () => setNotice("Pan selected"),
              },
            ]}
          >
            {choose("View", "Plan", () => {}, ["Plan"])}
          </CommandBar>
        </div>
      </div>
      <div {...stylex.props(styles.frame)}>
        <TaskHeader
          title="Edit document"
          description="Unsaved task draft"
          onCancel={() => setNotice("Draft discarded")}
          onSave={() => setNotice("Draft saved")}
        />
      </div>
      <div {...stylex.props(styles.frame)}>
        <WorkspaceHeader
          title="Cabinet workshop"
          metadata={preset}
          label="Workshop commands"
          menuLabel="Cabinet presets"
          menuIcon="parts"
          menuText="Presets"
          actions={[
            "Blank cabinet",
            "Vanity",
            "Closet",
            "Curved bookcase",
            "End shelves",
            "Stepped fronts",
          ].map((name) => ({
            id: name,
            label: name,
            onAction: () => setPreset(name),
          }))}
        />
      </div>
      <Select
        label="Save status"
        value={state}
        onChange={(e) => setState(e.currentTarget.value)}
      >
        {Object.keys(statuses).map((v) => (
          <option key={v}>{v}</option>
        ))}
      </Select>
      {notice && <Status>{notice}</Status>}
      <SidePanel title="History" open={task} onOpenChange={setTask}>
        <p>Application-owned history opens in a focused surface.</p>
      </SidePanel>
    </div>
  );
}
export function DesignerToolbarPrototype() {
  const [access, setAccess] = useState("Business project"),
    [saveState, setSaveState] = useState("saved"),
    [view, setView] = useState("Split"),
    [editMode, setEditMode] = useState("Objects"),
    [pending, setPending] = useState<string>(),
    [count, setCount] = useState(3),
    [undo, setUndo] = useState<number[]>([]),
    [redo, setRedo] = useState<number[]>([]),
    [notice, setNotice] = useState("");
  const [zoom, setZoom] = useState(100),
    [pan, setPan] = useState(false),
    [views, setViews] = useState([
      { id: "entry", name: "Entry view" },
      { id: "sink", name: "Sink view" },
    ]),
    [savedView, setSavedView] = useState("current"),
    [task, setTask] = useState<string>(),
    [draft, setDraft] = useState(""),
    [confirm, setConfirm] = useState<string>(),
    [revision, setRevision] = useState(4),
    [photo, setPhoto] = useState(false);
  const [advanced, setAdvanced] = useState(false),
    [advancedView, setAdvancedView] = useState("3D"),
    [tool, setTool] = useState("Orbit / pan"),
    [parts, setParts] = useState(8),
    [draftParts, setDraftParts] = useState(8),
    [snap, setSnap] = useState("1/8 in"),
    [selectedPart, setSelectedPart] = useState("Door"),
    [taskError, setTaskError] = useState("");
  const [draftPast, setDraftPast] = useState<number[]>([]),
    [draftFuture, setDraftFuture] = useState<number[]>([]);
  const [projectName, setProjectName] = useState("Kitchen renovation");
  const [elevationsOpen, setElevationsOpen] = useState(false);
  const [elevationResponse, setElevationResponse] = useState("ready");
  const [elevationState, setElevationState] = useState("loading");
  useEffect(() => {
    if (!elevationsOpen) return;
    // A synthetic delayed response lets the catalog exercise pending and failed requests.
    // App adoption supplies the real elevation loader and cancels stale requests.
    const timer = window.setTimeout(() => {
      if (elevationResponse !== "pending") setElevationState(elevationResponse);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [elevationsOpen, elevationResponse]);
  const showElevations = () => {
    setElevationState("loading");
    setElevationsOpen(true);
  };
  const nextViewId = useRef(3);
  const canvas = useRef<HTMLButtonElement>(null),
    readOnly = access.startsWith("Customer view"),
    staff = access === "Business project" || access === "Staff draft",
    isDraft = access === "Anonymous draft" || access === "Staff draft",
    busy = saveState === "saving",
    locked = readOnly || busy;
  useEffect(() => {
    if (pending) canvas.current?.focus();
  }, [pending]);
  const commit = (value: number) => {
    setUndo((p) => [...p, count]);
    setRedo([]);
    setCount(value);
    setSaveState("unsaved");
  };
  const action = (
    id: string,
    label: string,
    onAction: () => void,
    icon?: Action["icon"],
    disabled = false,
  ): Action => ({ id, label, onAction, icon, disabled });
  const open = (title: string, value = "") => {
    setDraft(value);
    setTask(title);
  };
  const changed = (message: string) => {
    setNotice(message);
    setSaveState("unsaved");
  };
  const undoAction = () => {
    const n = undo.at(-1);
    if (n != null) {
      setRedo((p) => [...p, count]);
      setCount(n);
      setUndo((p) => p.slice(0, -1));
      setSaveState("unsaved");
    }
  };
  const projectActions: Action[] = [
    action(
      "redo",
      "Redo",
      () => {
        const n = redo.at(-1);
        if (n != null) {
          setUndo((p) => [...p, count]);
          setCount(n);
          setRedo((p) => p.slice(0, -1));
        }
      },
      "redo",
      locked || !redo.length,
    ),
    ...(!readOnly && (staff || isDraft)
      ? [
          action(
            "history",
            isDraft ? "Room history" : "History & sharing",
            () => open(isDraft ? "Room history" : "History & sharing"),
            "history",
          ),
        ]
      : []),
    ...(isDraft
      ? [
          ...(staff
            ? [
                action(
                  "save",
                  "Save business project",
                  () => open("Save business project", "Kitchen renovation"),
                  "save",
                  busy,
                ),
              ]
            : []),
          action("new", "New room", () => setConfirm("New room"), "add", busy),
          action(
            "share",
            "Share room",
            () => open("Share room"),
            "share",
            busy,
          ),
          action(
            "price",
            "Price range",
            () => open("Price range"),
            "ruler",
            busy,
          ),
        ]
      : []),
    ...(access === "Business project"
      ? [
          action(
            "package",
            "Create customer package",
            () => open("Customer package"),
            "export",
            busy,
          ),
        ]
      : []),
    ...(access === "Customer view"
      ? [
          action(
            "copy",
            "Create editable copy",
            () => {
              setAccess("Editable customer copy");
              setProjectName((p) => `${p} copy`);
              setNotice("Synthetic editable copy created");
            },
            "copy",
          ),
        ]
      : []),
    action(
      "retry",
      "Retry saving",
      () => {
        setSaveState("saved");
        setNotice("Synthetic save recovered");
      },
      "save",
      readOnly || saveState !== "error",
    ),
    action(
      "workspace",
      staff ? "Business workspace" : "Staff sign in",
      () => open(staff ? "Business workspace" : "Staff sign in"),
      "external",
    ),
  ];
  const addActions: Action[] = (
    editMode === "Objects"
      ? ["Cabinet", "Fixture", "Library object", "Room panel"]
      : [
          "Wall",
          "Split wall",
          "Merge aligned walls",
          "Remove wall",
          "Door / opening",
          "Window",
          "Remove recess / alcove",
        ]
  ).map((label) =>
    action(
      label,
      label,
      () => {
        if (label === "Merge aligned walls" || label.startsWith("Remove"))
          setConfirm(label);
        else setPending(label);
      },
      label.startsWith("Remove") ? "delete" : "add",
      locked,
    ),
  );
  const navigation: Action[] = [
    action(
      "in",
      "Zoom in",
      () => setZoom((v) => Math.min(400, v + 25)),
      "zoomIn",
    ),
    action(
      "out",
      "Zoom out",
      () => setZoom((v) => Math.max(25, v - 25)),
      "zoomOut",
    ),
    action(
      "fit",
      "Fit view",
      () => {
        setZoom(100);
        setPan(false);
        setNotice("View fitted");
      },
      "fit",
    ),
    action("pan", pan ? "Stop panning" : "Pan", () => setPan((v) => !v), "pan"),
  ];
  const viewActions: Action[] = [
    action(
      "save-view",
      "Save current view",
      () => open("Save current view", `View ${views.length + 1}`),
      "add",
      locked || photo || views.length >= 50,
    ),
    action(
      "render",
      "Render options",
      () => open("Render options"),
      "settings",
      savedView === "current" || locked || photo,
    ),
    action(
      "first",
      "Set first customer view",
      () => {
        setViews((p) => [
          ...p.filter((v) => v.id === savedView),
          ...p.filter((v) => v.id !== savedView),
        ]);
        changed("First customer view updated");
      },
      "view",
      locked || savedView === "current" || views[0]?.id === savedView,
    ),
    {
      ...action(
        "delete-view",
        "Delete saved view",
        () => setConfirm("Delete saved view"),
        "delete",
        locked || photo || savedView === "current",
      ),
      destructive: true,
    },
  ];
  const drawing = (three = false) => (
    <svg
      viewBox="0 0 320 220"
      aria-hidden="true"
      {...stylex.props(styles.drawing)}
    >
      <g
        transform={`translate(160 110) scale(${zoom / 100}) translate(-160 -110)`}
      >
        <path
          d={
            three
              ? "M40 65L160 20L280 65V170L160 215L40 170Z"
              : "M35 25H285V195H35Z"
          }
          fill="#e7ece6"
          stroke="#87968a"
          strokeWidth="3"
        />
        {Array.from({ length: Math.min(count, 7) }, (_, i) => (
          <rect
            key={i}
            x={50 + i * 30}
            y={three ? 85 + i * 5 : 40}
            width="25"
            height={three ? 65 : 40}
            fill="#b8c7b5"
            stroke="#536b57"
          />
        ))}
      </g>
    </svg>
  );
  const viewport = (three: boolean) => (
    <section
      aria-label={three ? "3D viewport" : "Plan viewport"}
      {...stylex.props(styles.pane)}
    >
      <WorkspaceHeader
        title={three ? "3D" : "Plan"}
        level={3}
        compact
        menuIcon="pan"
        label={three ? "3D commands" : "Plan commands"}
        primary={
          three
            ? {
                id: "photo",
                label: photo ? "Photo in progress" : "Take photo",
                icon: "camera",
                busy: photo,
                onAction: () => {
                  setPhoto(true);
                  setNotice(
                    "Synthetic photo in progress. Complete it with the review control below.",
                  );
                },
              }
            : undefined
        }
        menuLabel={three ? "3D navigation" : "Plan navigation"}
        actions={
          three
            ? [
                ...navigation,
                action(
                  "settings",
                  "Photo settings",
                  () => open("Photo settings"),
                  "settings",
                  photo,
                ),
              ]
            : navigation
        }
      />
      {three ? (
        <div {...stylex.props(styles.bar)}>
          <CommandBar
            label="Saved view commands"
            menuLabel="Saved view actions"
            actions={viewActions}
          >
            {choose(
              "Saved view",
              savedView,
              setSavedView,
              [
                { value: "current", label: "Current view" },
                ...views.map((v) => ({ value: v.id, label: v.name })),
              ],
              true,
              photo,
            )}
            <InfoTooltip label="Saved views">
              Saved views retain their own identities. Up to 50 views; names use
              1–80 characters. Selecting a view does not edit its stored
              rendering options.
            </InfoTooltip>
          </CommandBar>
        </div>
      ) : (
        <div {...stylex.props(styles.bar)}>
          <CommandBar
            label="Plan editing commands"
            menuIcon={editMode === "Objects" ? "add" : "edit"}
            menuText={editMode === "Objects" ? "Add" : "Tools"}
            menuLabel={editMode === "Objects" ? "Add to room" : "Outline tools"}
            actions={pending ? undefined : addActions}
            primary={
              pending
                ? {
                    id: "cancel",
                    label: "Cancel placement",
                    icon: "close",
                    onAction: () => setPending(undefined),
                  }
                : undefined
            }
            status={
              pending
                ? { label: `Placing ${pending.toLowerCase()}` }
                : undefined
            }
          >
            {choose(
              "Plan editing mode",
              editMode,
              (value) => {
                setEditMode(value);
                setPending(undefined);
              },
              ["Objects", "Room outline"],
            )}
            {pending && (
              <InfoTooltip label="Placement">
                Click the plan to place this item. Escape cancels placement.
                This catalog illustrates command behavior, not real geometry.
              </InfoTooltip>
            )}
          </CommandBar>
        </div>
      )}
      <div {...stylex.props(styles.canvas)}>
        {!three && pending ? (
          <button
            type="button"
            {...stylex.props(styles.place)}
            ref={canvas}
            aria-label="Place item in plan"
            onKeyDown={(e) => {
              if (e.key === "Escape") setPending(undefined);
            }}
            onClick={() => {
              commit(count + 1);
              setNotice(`${pending} placed in synthetic plan`);
              setPending(undefined);
            }}
          >
            {drawing()}Place {pending.toLowerCase()}
          </button>
        ) : (
          drawing(three)
        )}
      </div>
    </section>
  );
  return (
    <div {...stylex.props(styles.root, layout.stack, gap.lg)}>
      <div {...stylex.props(styles.frame)}>
        {advanced ? (
          <>
            <TaskHeader
              title="Customize cabinet"
              description="Base cabinet · draft"
              onCancel={() => {
                setAdvanced(false);
                setPending(undefined);
                setNotice("Customization draft discarded");
              }}
              onSave={() => {
                setParts(draftParts);
                setAdvanced(false);
                changed("Cabinet configuration saved");
              }}
              error={taskError}
              disabled={!!taskError || locked}
            />
            <div {...stylex.props(styles.bar)}>
              <CommandBar
                label="Cabinet part commands"
                menuIcon="parts"
                menuText="Parts"
                menuLabel="Cabinet part actions"
                actions={[
                  action(
                    "add-part",
                    "Add part",
                    () => {
                      setDraftPast((p) => [...p, draftParts]);
                      setDraftFuture([]);
                      setDraftParts((p) => p + 1);
                      setNotice("Part added to task draft");
                    },
                    "add",
                    locked,
                  ),
                  action(
                    "parts",
                    "Cabinet parts",
                    () => open("Cabinet parts"),
                    "parts",
                  ),
                  action(
                    "undo-part",
                    "Undo draft part",
                    () => {
                      const n = draftPast.at(-1);
                      if (n != null) {
                        setDraftFuture((p) => [...p, draftParts]);
                        setDraftParts(n);
                        setDraftPast((p) => p.slice(0, -1));
                      }
                    },
                    "undo",
                    !draftPast.length,
                  ),
                  action(
                    "redo-part",
                    "Redo draft part",
                    () => {
                      const n = draftFuture.at(-1);
                      if (n != null) {
                        setDraftPast((p) => [...p, draftParts]);
                        setDraftParts(n);
                        setDraftFuture((p) => p.slice(0, -1));
                      }
                    },
                    "redo",
                    locked || !draftFuture.length,
                  ),
                ]}
              >
                {choose("Cabinet view", advancedView, setAdvancedView, [
                  "3D",
                  "Front",
                  "Side",
                  "Top",
                ])}
                {choose("Cabinet tool", tool, setTool, [
                  "Orbit / pan",
                  "Move part",
                  "Interact",
                ])}
                {choose("Cabinet snapping", snap, setSnap, [
                  "1/16 in",
                  "1/8 in",
                  "1/2 in",
                  "1 in",
                  "Off",
                ])}
              </CommandBar>
            </div>
            <div {...stylex.props(styles.preview)}>
              {drawing(advancedView === "3D")}
            </div>
            <div {...stylex.props(styles.stats)}>
              <span>
                {draftParts} parts · {selectedPart}
              </span>
              <CommandBar
                label="Cabinet navigation"
                menuIcon="pan"
                menuLabel="Cabinet view actions"
                actions={navigation}
              />
            </div>
          </>
        ) : (
          <>
            <WorkspaceHeader
              title={isDraft ? "Untitled room" : projectName}
              metadata={`From Trees · ${readOnly ? "Customer view" : isDraft ? "Draft" : access === "Editable customer copy" ? "Customer copy · Revision " + revision : "Revision " + revision}`}
              level={2}
              label="Project commands"
              status={readOnly ? { label: "View only" } : statuses[saveState]}
              primary={{
                id: "undo",
                label: "Undo",
                icon: "undo",
                disabled: locked || !undo.length,
                onAction: undoAction,
              }}
              menuLabel="Project actions"
              compact
              actions={[
                ...projectActions,
                action("elevations", "Elevations", showElevations, "view"),
                ...[
                  action(
                    "customize",
                    "Customize cabinet",
                    () => {
                      setDraftParts(parts);
                      setDraftPast([]);
                      setDraftFuture([]);
                      setTaskError("");
                      setAdvanced(true);
                    },
                    "settings",
                    locked,
                  ),
                  action(
                    "outline",
                    "Edit room outline",
                    () => {
                      setEditMode("Room outline");
                      setView("Plan");
                    },
                    "edit",
                    locked,
                  ),
                  action(
                    "levels",
                    "Plan levels",
                    () => open("Plan levels"),
                    "height",
                  ),
                  action(
                    "help",
                    "Designer help",
                    () => open("Designer help"),
                    "info",
                  ),
                ].map((item, index) => ({
                  ...item,
                  separatorBefore: index === 0,
                })),
              ]}
            >
              <SegmentedControl
                label="Workspace view"
                value={view}
                onChange={(value) => {
                  setView(value);
                  setPending(undefined);
                }}
                options={["Plan", "Split", "3D"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </WorkspaceHeader>
            <div
              {...stylex.props(styles.views, view !== "Split" && styles.single)}
            >
              {view !== "3D" && viewport(false)}
              {view !== "Plan" && viewport(true)}
            </div>
            <div {...stylex.props(styles.stats)}>
              <span>
                {count} objects · {zoom}% · {pan ? "Pan" : "Select"}
              </span>
              <InfoTooltip label="Design status">
                Concept only. Verify dimensions in the field. This example uses
                synthetic geometry and local state.
              </InfoTooltip>
            </div>
          </>
        )}
      </div>
      {notice && <Status>{notice}</Status>}
      <section
        aria-label="Toolbar review controls"
        {...stylex.props(styles.settings)}
      >
        <Select
          label="Access scenario"
          value={access}
          onChange={(e) => {
            setAccess(e.currentTarget.value);
            setPending(undefined);
            setAdvanced(false);
            setTask(undefined);
            setElevationsOpen(false);
          }}
        >
          {[
            "Business project",
            "Staff draft",
            "Anonymous draft",
            "Customer view",
            "Customer view · copies disabled",
            "Editable customer copy",
          ].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </Select>
        <Select
          label="Elevation response"
          value={elevationResponse}
          onChange={(e) => setElevationResponse(e.currentTarget.value)}
        >
          <option value="ready">Load after delay</option>
          <option value="pending">Keep loading</option>
          <option value="error">Fail after delay</option>
        </Select>
        <Select
          label="Save state"
          value={saveState}
          onChange={(e) => setSaveState(e.currentTarget.value)}
        >
          {Object.entries(statuses).map(([id, s]) => (
            <option key={id} value={id}>
              {s.label}
            </option>
          ))}
        </Select>
        <Button
          isDisabled={!photo}
          onClick={() => {
            setPhoto(false);
            setNotice("Synthetic photo complete");
          }}
        >
          Complete demo photo
        </Button>
        {advanced && (
          <Select
            label="Task validation"
            value={taskError ? "invalid" : "valid"}
            onChange={(e) =>
              setTaskError(
                e.currentTarget.value === "invalid"
                  ? "Fix the invalid cabinet dimensions before saving."
                  : "",
              )
            }
          >
            <option value="valid">Valid draft</option>
            <option value="invalid">Invalid draft</option>
          </Select>
        )}
      </section>
      <p {...stylex.props(styles.caption)}>
        Interactive command prototype. Room geometry, authorization, rendering
        and persistence stay in Cabinitron.
      </p>
      <SidePanel
        title={task ?? "Task"}
        open={!!task}
        onOpenChange={(open) => {
          if (!open) setTask(undefined);
        }}
        footer={
          task === "Save current view" || task === "Save business project" ? (
            <Button
              variant="primary"
              isDisabled={!draft.trim()}
              onClick={() => {
                if (task === "Save current view") {
                  const id = `view-${nextViewId.current++}`;
                  setViews((p) => [...p, { id, name: draft.trim() }]);
                  setSavedView(id);
                  changed("Saved view added");
                } else {
                  setProjectName(draft.trim());
                  setAccess("Business project");
                  changed("Business project created");
                }
                setTask(undefined);
              }}
            >
              Save
            </Button>
          ) : undefined
        }
      >
        {task === "Save current view" || task === "Save business project" ? (
          <TextInput
            label="Name"
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            maxLength={task === "Save current view" ? 80 : 120}
            help={
              task === "Save current view"
                ? "Use 1–80 characters. Up to 50 saved views. Names may repeat; each view keeps its own identity."
                : "Use 1–120 characters."
            }
          />
        ) : task === "Cabinet parts" ? (
          <List
            label="Cabinet parts"
            items={["Door", "Left side", "Shelf"].map((name) => ({
              id: name,
              title: name,
              metadata: "Synthetic part",
              actions: [
                action(
                  "select",
                  "Select part",
                  () => {
                    setSelectedPart(name);
                    setTask(undefined);
                  },
                  "view",
                ),
              ],
            }))}
          />
        ) : task === "History & sharing" || task === "Room history" ? (
          <List
            label="Design history"
            items={[revision, revision - 1, revision - 2].map((n, i) => ({
              id: String(n),
              title: `Revision ${n}`,
              metadata: "Example team member · Today",
              ...(i
                ? {
                    actions: [
                      action(
                        "view",
                        "View",
                        () => setNotice(`Viewing synthetic revision ${n}`),
                        "view",
                      ),
                      action(
                        "restore",
                        "Restore",
                        () => {
                          setConfirm(`Restore revision ${n}`);
                        },
                        "history",
                        readOnly,
                      ),
                    ],
                  }
                : { status: { label: "Current", tone: "success" as const } }),
            }))}
          />
        ) : (
          <Status>
            {task} opens a focused application task here. Existing application
            behavior is preserved during adoption.
          </Status>
        )}
      </SidePanel>
      <Dialog
        title="Elevations"
        description="Cabinetry-facing views"
        open={elevationsOpen}
        onOpenChange={setElevationsOpen}
        footer={
          <InfoTooltip label="Elevation dimensions">
            Concept only. Verify dimensions in the field. The catalog uses
            schematic sheets; Cabinitron supplies the real elevations.
          </InfoTooltip>
        }
      >
        {elevationState === "loading" ? (
          <div
            role="status"
            aria-label="Loading elevations"
            aria-busy="true"
            {...stylex.props(layout.stack, gap.lg)}
          >
            {["wall-a", "wall-b"].map((id) => (
              <div key={id} {...stylex.props(layout.stack, gap.sm)}>
                <Shimmer width="35%" height={18} />
                <Shimmer variant="block" height={160} />
              </div>
            ))}
          </div>
        ) : elevationState === "error" ? (
          <div {...stylex.props(layout.stack, gap.md)}>
            <Status tone="danger">Unable to load elevations.</Status>
            <Button
              onClick={() => {
                setElevationState("loading");
                setElevationResponse("ready");
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div {...stylex.props(layout.stack, gap.lg)}>
            {["Wall A", "Wall B"].map((wall) => (
              <figure
                key={wall}
                {...stylex.props(layout.stack, gap.sm, styles.elevationFigure)}
              >
                <figcaption>{wall}</figcaption>
                <svg
                  viewBox="0 0 420 180"
                  role="img"
                  aria-label={`${wall} elevation`}
                  {...stylex.props(styles.elevationSheet)}
                >
                  <path
                    d="M10 165H410 M30 165V30H390V165 M150 30V165 M270 30V165 M30 80H390 M30 95H390"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </figure>
            ))}
          </div>
        )}
      </Dialog>
      <Dialog
        title={`${confirm ?? "Confirm"}?`}
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(undefined);
        }}
        footer={
          <Button
            variant="primary"
            onClick={() => {
              if (confirm === "Delete saved view") {
                setViews((p) => p.filter((v) => v.id !== savedView));
                setSavedView("current");
              } else if (confirm === "New room") commit(0);
              else if (confirm?.startsWith("Restore"))
                setRevision((v) => v + 1);
              else setNotice(`${confirm} confirmed in synthetic room`);
              setConfirm(undefined);
              setSaveState("unsaved");
            }}
          >
            Confirm
          </Button>
        }
      >
        <p>
          {confirm} affects this synthetic example only. Cancel by closing the
          dialog.
        </p>
      </Dialog>
    </div>
  );
}
