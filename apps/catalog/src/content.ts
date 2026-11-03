import type { IconName } from "@from-trees/ui";
export type PageId =
  | "overview"
  | "foundations"
  | "buttons"
  | "menus"
  | "fields"
  | "parameters"
  | "panels"
  | "overlays"
  | "feedback"
  | "patterns"
  | "adoption";
export const pages: {
  id: PageId;
  title: string;
  icon: IconName;
  group: string;
  description: string;
}[] = [
  {
    id: "overview",
    title: "Overview",
    icon: "view",
    group: "Start here",
    description:
      "A shared language for tools that feel considered. Real components, working interactions, and a clear path from prototype to product.",
  },
  {
    id: "foundations",
    title: "Foundations",
    icon: "ruler",
    group: "Start here",
    description:
      "Quiet surfaces, clear hierarchy, and recognizable icons. Shared tokens keep the family consistent; themes give each application room to belong.",
  },
  {
    id: "buttons",
    title: "Buttons & icons",
    icon: "add",
    group: "Components",
    description:
      "Make the action clear. Use familiar icons for frequent tasks, short labels when context matters, and one primary action per group.",
  },
  {
    id: "menus",
    title: "Action menus",
    icon: "more",
    group: "Components",
    description:
      "More than two adjacent actions belong in a menu. Keep a frequent primary action visible and give everything else a predictable home.",
  },
  {
    id: "fields",
    title: "Fields & choices",
    icon: "settings",
    group: "Components",
    description:
      "Short labels, useful validation, and consistent spacing. Choose controls by the decision being made, rather than styling every choice as an action.",
  },
  {
    id: "parameters",
    title: "Parameters",
    icon: "width",
    group: "Components",
    description:
      "Dimensions and placement in the same order, wherever they appear. Show applicable parameters and make the measurement reference explicit.",
  },
  {
    id: "panels",
    title: "Panels & sections",
    icon: "view",
    group: "Components",
    description:
      "Put common controls within reach. Group related details and reveal uncommon settings progressively without losing discoverability.",
  },
  {
    id: "overlays",
    title: "Dialogs & side panels",
    icon: "external",
    group: "Components",
    description:
      "Keep tasks where people are working. Open focused dialogs or contextual side panels instead of updating content several scrolls away.",
  },
  {
    id: "feedback",
    title: "Status & feedback",
    icon: "info",
    group: "Components",
    description:
      "Show what happened beside the task. Distinguish progress, success, warnings and errors without relying on color alone.",
  },
  {
    id: "patterns",
    title: "Composed workflows",
    icon: "history",
    group: "Patterns",
    description:
      "Review components together before integrating them. These synthetic workflows exercise selection controls, history, sharing and local feedback.",
  },
  {
    id: "adoption",
    title: "Install & contribute",
    icon: "export",
    group: "Patterns",
    description:
      "One package, shared behavior, deliberate adoption. The catalog imports the compiled package that applications will install.",
  },
];
export const behavior: Partial<Record<PageId, string[]>> = {
  buttons: [
    "Icon buttons expose a visible tooltip on hover or keyboard focus and an accessible name.",
    "Busy buttons prevent repeat activation. Disabled controls retain their place in the layout.",
    "Use icon-only actions for familiar tasks. Keep parameter labels visible.",
  ],
  menus: [
    "Enter, Space or Arrow Down opens the menu. Arrow keys navigate; typing finds actions.",
    "Escape dismisses and restores focus. Popovers stay inside the viewport and work inside overlays.",
    "ActionGroup automatically collapses three or more actions; a primaryId keeps one action visible.",
  ],
  fields: [
    "Labels are programmatically associated with fields. Help and errors are associated descriptions.",
    "Use a select for a list, a switch for a binary setting, and segmented choices for a small set of modes.",
    "Keep validation adjacent. Disabled and read-only have distinct meanings.",
  ],
  parameters: [
    "Stable order: Width, Height, Depth; Offset, Height from floor, Setback; Rotation.",
    "Commit on Enter or blur. Escape restores the last value. Invalid input never calls onChange.",
    "Decimals, simple fractions and mixed fractions are accepted. Units and origins come from the application.",
    "Changing a parameter’s external value resets the draft. Key the control by object identity when selection changes.",
  ],
  panels: [
    "Common dimensions are visible. Appearance and construction have predictable sections.",
    "Collapsed sections can indicate Modified or Needs attention.",
    "Use explicit names for uncommon groups; avoid a miscellaneous advanced drawer.",
  ],
  overlays: [
    "Focus moves into the overlay, remains inside it and returns on close. Background scrolling is locked.",
    "Escape and outside click dismiss by default; dismissible=false supports a guarded task.",
    "Side panels retain context and fill narrow screens. Header and footer stay outside the scrolling body.",
    "Applications own unsaved-change confirmation, request cancellation and permission checks.",
  ],
  feedback: [
    "Errors use alert announcements. Status updates use polite announcements.",
    "Messages belong beside their action. Badges carry a text label as well as color.",
  ],
  patterns: [
    "All state is synthetic and browser-local. No customer records or external share links are created.",
    "History & sharing opens against the selected project; restoring keeps the panel open.",
    "Changing selection remounts parameter drafts. Closing a side panel preserves the underlying page position.",
  ],
};
export const snippets: Partial<Record<PageId, string>> = {
  buttons: `import {Button, IconButton} from '@from-trees/ui';\n\n<Button icon="save" variant="primary" onPress={save}>Save</Button>\n<IconButton icon="copy" label="Duplicate cabinet" onPress={duplicate} />`,
  menus: `<ActionGroup\n  primaryId="save"\n  actions={[\n    {id: 'save', label: 'Save', icon: 'save', onAction: save},\n    {id: 'copy', label: 'Duplicate', icon: 'copy', onAction: duplicate},\n    {id: 'delete', label: 'Delete', icon: 'delete',\n      destructive: true, separatorBefore: true, onAction: remove},\n  ]}\n/>`,
  fields: `<TextInput label="Project name" value={name}\n  onChange={event => setName(event.currentTarget.value)} />\n<Select label="Finish" value={finish}\n  onChange={event => setFinish(event.currentTarget.value)}>\n  <option value="oak">Natural oak</option>\n  <option value="paint">Paint</option>\n</Select>`,
  parameters: `<Parameters key={selectedObject.id} unit="in" values={{\n  width: {value: width, min: 1, onChange: setWidth},\n  height: {value: height, min: 1, onChange: setHeight},\n  depth: {value: depth, min: 1, onChange: setDepth},\n  offset: {value: offset, label: 'Offset from left',\n    reference: 'From the start of the parent wall.',\n    onChange: setOffset},\n}} />`,
  panels: `<Panel title="Base cabinet" actions={<MenuButton actions={actions} />}>\n  <Parameters values={parameters} />\n  <Section title="Appearance" collapsible>…</Section>\n  <Section title="Construction" collapsible modified>…</Section>\n</Panel>`,
  overlays: `<SidePanel title="History & sharing" open={open}\n  onOpenChange={setOpen} description={project.name}>\n  <ProjectHistory project={project} />\n</SidePanel>\n\n// Use Dialog for focused forms and confirmations.\n// The application guards unsaved changes before closing.`,
  feedback: `<Status tone="success">Link copied</Status>\n<Status tone="danger">Unable to save. Try again.</Status>\n<Badge tone="warning">Unsaved</Badge>`,
};
