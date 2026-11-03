import type { IconName } from "@from-trees/ui";
export type PageId =
  | "overview"
  | "foundations"
  | "buttons"
  | "lists"
  | "menus"
  | "fields"
  | "help"
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
    id: "lists",
    title: "Lists",
    icon: "history",
    group: "Components",
    description:
      "The shared list owns every row: title, one metadata line, and a right-aligned status or action menu. Apps provide data and actions, not row markup.",
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
    id: "help",
    title: "Contextual help",
    icon: "info",
    group: "Components",
    description:
      "Keep labels concise. Put optional explanations behind an info control, available on hover, keyboard focus or tap.",
  },
  {
    id: "parameters",
    title: "Parameters",
    icon: "width",
    group: "Components",
    description:
      "App-defined parameters and groups, presented consistently. The app owns labels, units and order; shared controls handle editing, validation and optional help.",
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
      "One package, shared behavior, deliberate adoption. The catalog imports the native source package that applications will install.",
  },
];
export const behavior: Partial<Record<PageId, string[]>> = {
  lists: [
    "Title and metadata stay together on the left. A status or menu stays on the right at every width.",
    "Rows have no separators, card borders, extra padding or exposed action buttons. Even one action uses the row menu.",
    "Long strings truncate to one line; their full text remains available in the DOM and native title tooltip. Menus keep their full width.",
    "Applications supply plain strings and action callbacks. List owns the markup, typography, spacing and overflow behavior; it accepts no renderItem, children or style overrides.",
  ],
  help: [
    "Hover or keyboard-focus the info button to read optional detail. Click or tap toggles it; outside press, blur or Escape dismisses it.",
    "Move the pointer onto the explanation to keep reading. The tooltip is portaled, viewport-aware and inherits theme through overlays.",
    "Help is non-interactive text. Use a dialog for links, forms or actions. Labels, units and actionable validation errors stay visible.",
    "Parameters use this same component for reference and help text. Hidden descriptions remain associated with the input for assistive technology.",
  ],
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
    "Every editor uses the same ParameterRow layout. Compose Select, Switch, TextInput or an app-specific editor as a component child or control slot.",
    "Apps can reject parsed values with validate and a specific inline message. After commit, the displayed value follows the app, including unchanged snapped values.",
    "Optional reference/help text appears through the info control beside the label. Validation errors remain inline.",
    "The app supplies ordered groups and fields. Cabinet order lives in the catalog app’s CabinetParameters wrapper, not the shared package.",
    "Validation and updates wait until focus leaves the field. Enter blurs; Escape resets the draft. Temporary partial values remain editable.",
    "Decimals, simple fractions and mixed fractions are accepted. Units and origins come from the application.",
    "Changing a parameter’s external value resets the draft. Key the control by object identity when selection changes.",
  ],
  panels: [
    "Common dimensions are visible. Every choice in Appearance and Construction uses the same parameter row layout.",
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
  lists: `import {List, type ListItem} from '@from-trees/ui';

const items: ListItem[] = [
  {id: '4', title: 'Revision 4', metadata: 'Team member · Nov 2',
    status: {label: 'Current', tone: 'success'}},
  {id: '3', title: 'Revision 3', metadata: 'Team member · Nov 2',
    actions: [
      {id: 'inspect', label: 'Inspect', icon: 'view', onAction: inspect},
      {id: 'restore', label: 'Restore', icon: 'history', onAction: confirmRestore},
    ]},
];
<List label="Saved revisions" items={items} />`,
  help: `import {InfoTooltip} from '@from-trees/ui';

<InfoTooltip label="Wall offset">
  From the start of the parent wall.
</InfoTooltip>

<Parameters groups={[{
  id: 'placement', label: 'Placement', parameters: [{
    id: 'offset', value: offset, label: 'Offset from left', onChange: setOffset,
    reference: 'From the start of the parent wall.',
    help: 'Follows the wall direction, not the screen edge.',
  }],
}]} />`,
  buttons: `import {Button, IconButton} from '@from-trees/ui';\n\n<Button icon="save" variant="primary" onPress={save}>Save</Button>\n<IconButton icon="copy" label="Duplicate cabinet" onPress={duplicate} />`,
  menus: `<ActionGroup\n  primaryId="save"\n  actions={[\n    {id: 'save', label: 'Save', icon: 'save', onAction: save},\n    {id: 'copy', label: 'Duplicate', icon: 'copy', onAction: duplicate},\n    {id: 'delete', label: 'Delete', icon: 'delete',\n      destructive: true, separatorBefore: true, onAction: remove},\n  ]}\n/>`,
  fields: `<TextInput label="Project name" value={name}\n  onChange={event => setName(event.currentTarget.value)} />\n<Select label="Finish" value={finish}\n  onChange={event => setFinish(event.currentTarget.value)}>\n  <option value="oak">Natural oak</option>\n  <option value="paint">Paint</option>\n</Select>`,
  parameters: `import {Parameters, ParameterRow, Select, Switch, type ParameterGroup} from '@from-trees/ui';

// Define and reuse this policy in an application component.
const groups: ParameterGroup[] = [
  {id: 'output', label: 'Output', parameters: [
    {id: 'duration-ms', label: 'Duration', unit: 'ms', value: duration, onChange: setDuration},
    {id: 'gain-pct', label: 'Gain', unit: '%', value: gain, onChange: setGain},
    {id: 'enabled', label: 'Enabled', control: <Switch selected={enabled} onChange={setEnabled} />},
  ]},
];
<Parameters groups={groups} />

// Use the exact same row directly inside app-owned sections.
<ParameterRow label="Finish">
  <Select value={finish} onChange={e => setFinish(e.currentTarget.value)}>
    <option value="oak">Natural oak</option>
    <option value="paint">Paint</option>
  </Select>
</ParameterRow>

// Custom editors forward the provided accessible control attributes.
<ParameterRow label="Quality">{props => <input {...props} type="range" />}</ParameterRow>

// This catalog app supplies its own cabinet-specific wrapper:
// <CabinetParameters values={dimensions} onChange={changeDimension} />`,
  panels: `<Panel title="Base cabinet" actions={<MenuButton actions={actions} />}>\n  <Parameters groups={parameterGroups} />\n  <Section title="Appearance" collapsible>\n    <ParameterRow label="Finish">\n      <Select value={finish} onChange={e => setFinish(e.currentTarget.value)}>\n        <option value="oak">Natural oak</option>\n        <option value="paint">Paint</option>\n      </Select>\n    </ParameterRow>\n  </Section>\n  <Section title="Construction" collapsible modified>…</Section>\n</Panel>`,
  overlays: `<SidePanel title="History & sharing" open={open}\n  onOpenChange={setOpen} description={project.name}>\n  <ProjectHistory project={project} />\n</SidePanel>\n\n// Use Dialog for focused forms and confirmations.\n// The application guards unsaved changes before closing.`,
  feedback: `<Status tone="success">Link copied</Status>\n<Status tone="danger">Unable to save. Try again.</Status>\n<Badge tone="warning">Unsaved</Badge>`,
};
