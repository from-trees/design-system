import type { IconName } from "@from-trees/ui";
export type PageId =
  | "workspace-navigation"
  | "overview"
  | "foundations"
  | "buttons"
  | "tables"
  | "lists"
  | "menus"
  | "fields"
  | "swatches"
  | "help"
  | "parameters"
  | "panels"
  | "overlays"
  | "feedback"
  | "toolbars"
  | "designer-toolbars"
  | "customer-journey"
  | "estimate-options"
  | "estimate-workflow"
  | "customizer"
  | "sidebar"
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
    id: "tables",
    title: "Tables",
    icon: "table",
    group: "Components",
    description:
      "Search, filter, sort and navigate records in one consistent table. One action column, predictable formatting and server-owned pagination.",
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
    id: "swatches",
    title: "Swatches & previews",
    icon: "view",
    group: "Components",
    description:
      "Choose by appearance. Compact parameter fields open labeled visual grids for materials, colors, profiles and configurations. Applications provide the previews.",
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
    id: "toolbars",
    title: "Headers & toolbars",
    icon: "more",
    group: "Components",
    description:
      "A clear identity, stable status and at most one direct command plus a menu. Task headers keep Save and Cancel together.",
  },
  {
    id: "designer-toolbars",
    title: "Designer toolbars",
    icon: "settings",
    group: "Patterns",
    description:
      "A complete Cabinitron header and toolbar prototype: project actions, plan tools, viewport navigation, saved views, elevations and cabinet customization.",
  },
  {
    id: "estimate-workflow",
    title: "Create estimates",
    icon: "receipt",
    group: "Patterns",
    description:
      "Prepare an estimate in six resumable steps: customer, direct line items and choices, documents, terms, finalization and delivery.",
  },
  {
    id: "estimate-options",
    title: "Estimate options",
    icon: "check",
    group: "Patterns",
    description:
      "Compare section tables, open each design, and select options to turn a valid price range into an exact estimate.",
  },
  {
    id: "customer-journey",
    title: "Customer estimates",
    icon: "check",
    group: "Patterns",
    description:
      "From estimate review to delivery: a clear next action, visible progress and focused customer tasks.",
  },
  {
    id: "customizer",
    title: "Cabinet customizer",
    icon: "parts",
    group: "Patterns",
    description:
      "The advanced cabinet inspector: consistent parameter rows, explicit part and drawer identity, common controls first and focused construction details.",
  },
  {
    id: "sidebar",
    title: "Designer sidebar",
    icon: "settings",
    group: "Patterns",
    description:
      "A whole-sidebar Cabinitron prototype: common properties first, focused contexts and deliberate disclosure. Review organization and behavior before application adoption.",
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
    id: "workspace-navigation",
    title: "Workspace navigation",
    icon: "folder",
    group: "Patterns",
    description:
      "Grouped workspace navigation with direct links to pages, records and record sections. Refresh and browser history restore the same view.",
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
  "estimate-workflow": [
    "Save the initial name, customer and expiration as a resumable draft.",
    "Create sections and choices before adding their rows; imported design groups are read-only and refresh explicitly.",
    "Generate packages for the pinned design revisions, attach external files, and review terms before finalizing.",
    "Tax lookup requires an explicit Update action. Sending is a separate confirmed final step. This catalog uses synthetic records and local draft storage.",
  ],
  "workspace-navigation": [
    "Four visible groups: Work, Customers, Libraries and Settings. Group headings link to their default page; leaf links open pages directly. Navigation uses anchors and aria-current, rather than action menus or tab roles.",
    "The shared WorkspaceLayout, GroupedNavigation and Breadcrumbs own presentation and the narrow navigation drawer. Applications supply destinations, selection and navigation callbacks; business identity, permissions and persistence stay app-owned.",
    "The catalog uses a hash route after #workspace-navigation to survive GitHub Pages refreshes. Production adoption will use business-scoped paths with equivalent page/record/query state; the component does not require hash routing or a particular router.",
    "Copy any page or record URL, refresh, use Back/Forward, or open a link in a new tab. Record section, saved revision and namespaced table criteria are restored from the URL. Navigation never saves or completes business actions.",
    "Closing a record returns to its list with search, filters, sort and pagination intact. Unavailable business/page/record links show an explicit unavailable state; invalid table criteria show a warning rather than silently selecting another record.",
    "Website setup and Brand & embed share Website & branding. Cabinitron subscription billing remains distinct from customer invoices. Customer/contact records and related work share one source of truth in application adoption.",
    "Customer navigation reflects Cabinitron approved main 5b45b169: lifecycle and archive visibility, multiple contacts and billing/project-site addresses, saved document revisions, projects and inquiries. Customer/contact/address links are business-scoped; historical documents do not resolve identity from mutable directory details.",
    "Approve this exploration before a separate Cabinitron integration. No customer directory, permissions model, financial workflow or settings backend is implemented by this prototype.",
  ],
  "customer-journey": [
    "The shared WorkflowProgress component receives app-defined steps, availability and completion. Navigation never completes approval or payment.",
    "Keep the estimate identity, total and progress above the active stage. Show one focused stage and a short next action, with saved documents available for review.",
    "Review is a local navigation acknowledgment. Signature and payment completion must come from server-confirmed records for this exact estimate revision.",
    "The full path continues through Production queue, Final design confirmation, Production, Final Production Payment Due and Delivery. Future shop stages remain visible without invented dates or automatic completion.",
    "Card and ACH checkout stay in the existing provider flow. Processing, failure and unresolved payment states must not be presented as paid.",
    "Approval-only estimates omit the payment step. Expired and superseded estimates remain readable, with signing and payment unavailable.",
    "This synthetic catalog flow does not implement legal consent, identity verification, document generation or payment. Preserve those app capabilities in a separate adoption review.",
  ],
  customizer: [
    "Cabinet, Selected part and Preview are explicit inspector contexts. Size and position stay visible; uncommon controls live in named sections.",
    "Numeric drafts remain untouched while typing. Enter or blur commits; Escape resets. Each constrained field explains its limits in info help.",
    "Drawer rows are top to bottom. Defaults and individual overrides have separate identity; inherited values follow array settings and Reset restores inheritance.",
    "Preview finishes never dirty the configuration. Save and Cancel exercise local catalog snapshots; domain geometry and permission enforcement stay app-owned.",
    "Review Room cabinet, Standalone and Read only. Actual app adoption preserves real swatches, sink/library tasks, geometry and saved revisions.",
  ],
  swatches: [
    "The field shows the current preview and label. The popup shows a visual grid with selected and keyboard-focus indicators.",
    "SwatchPicker inherits ParameterRow labeling, help and errors; applications supply option identity, labels, preview components and eligibility.",
    "The material example combines complete named materials under Built-In and Library headings in one picker. Each choice carries its finish; front and crown profiles remain independent geometry choices.",
    "Keyboard navigation, typeahead, Escape cancellation, disabled choices and modal focus follow accessible select behavior. Catalog artwork is illustrative; applications can supply real material images.",
  ],
  toolbars: [
    "CommandBar owns action grouping: at most one direct command plus one menu. Children are input controls, not additional action rows.",
    "WorkspaceHeader supplies one identity and command area. TaskHeader supplies one task title and exactly Cancel/Save; do not duplicate a surrounding overlay header.",
    "Status text has reserved width, truncates visually and retains its full accessible text and native tooltip. Its changing length does not shift commands.",
    "Tab reaches controls; Left/Right and Home/End navigate enabled toolbar buttons. Native select keys and menu keyboard behavior remain intact.",
  ],
  "designer-toolbars": [
    "One project header replaces duplicated host/document identity. Project actions retain their business-project, anonymous-draft and customer-view eligibility.",
    "Plan/Split/3D use the existing segmented control inside the project header. Elevations opens from its menu in a dialog with shimmer placeholders, errors and retry. The existing save badge sits beside Undo.",
    "Photo capture is a direct icon action. Saved-view selection has one management menu, including render options, first customer view and deletion.",
    "Customization owns a single Save/Cancel task header, a view/tool/snap command bar and focused part selection. This prototype does not replace the existing advanced editor.",
    "Review controls exercise save failures, read-only access, drafts and busy photos. All operations use synthetic local state; real geometry and external tasks are not implemented.",
  ],
  sidebar: [
    "Cabinitron-specific schemas and workflows live in this catalog example. The shared package remains domain-neutral.",
    "Selection, Room and Styles are distinct contexts. Heading and actions remain visible while the property body scrolls.",
    "Size and position are immediately available; uncommon settings use named expandable sections with Modified or Needs attention indicators.",
    "Assigned style changes one object. Shared style editing explicitly identifies how many objects are affected and commits only on Save.",
    "Numeric validation and rounding wait for focus loss. Rules are explained in field help. Dialog and task drafts are discarded when dismissed.",
    "The external review controls represent plan selection. No geometry engine, production constraints, persistence or network mutations are implemented.",
  ],
  tables: [
    "Search applies on Enter or the search icon. The contract supports eq, contains, in and noteq per field. Initially Status uses in and every other field uses eq; single-operator fields hide the picker. Status opens with multi-selection: selected statuses match with OR; different fields combine with AND. Applying filters resets page one.",
    "Arrow keys navigate cells; Enter opens a record when available. One sticky Actions column holds shared menus, including Open. Closing details restores focus to the same row/menu.",
    "The table owns spacing, alignment and formatting: text/metadata, integer or decimal numbers, integer minor-unit money, date-only dates, timestamp dates and status badges. No app-defined cell layout or extra action columns.",
    "Numbered pagination includes First, Previous, Next, Last and 10/25/50/100 rows per page. Server totals describe the filtered dataset, not just the visible page.",
    "Text columns may add 48px decorative thumbnails beside their names and metadata. Images shimmer while downloading; loading also covers app-generated artwork. Missing or failed images use an icon. Preview loading never disables the row or changes its accessible name.",
    "Shimmer rows match column structure while loading. Errors, no records and no matches are separate states. Responses echo their normalized query; mismatched results never appear under a new query.",
    "The catalog simulates a paginated endpoint over synthetic records with delay, failure/retry and request cancellation. Apps own authorization, SQL allowlists, search fields, endpoints, URL state and stale-response protection. Confirm this example before Cabinitron API adoption.",
  ],
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
    "Shimmer placeholders match the incoming content. The owning region announces loading; reduced-motion preferences disable animation. Replace placeholders with content or an error and retry.",
  ],
  patterns: [
    "All state is synthetic and browser-local. No customer records or external share links are created.",
    "History & sharing opens against the selected project; restoring keeps the panel open.",
    "Changing selection remounts parameter drafts. Closing a side panel preserves the underlying page position.",
  ],
};
export const snippets: Partial<Record<PageId, string>> = {
  tables: `import {DataTable, tableQueryKey, type TableQuery, type TablePage} from '@from-trees/ui';

// App owns fetch, abort/stale-response protection and route state.
const response = await fetch('/api/invoices?' + tableQueryKey(query), {signal});
const page: TablePage<Invoice> = await response.json();
// Commit only if this is still the active request.

<DataTable label="Invoices" columns={invoiceColumns}
  query={query} onQueryChange={setQuery} page={page}
  loading={loading} error={error} onRetry={reload}
  filters={invoiceFilters} getRowId={row => row.id}
  getRowLabel={row => row.number}
  onOpenRow={openInvoice} rowActions={invoiceActions} />`,
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
  feedback: `<Status tone="success">Link copied</Status>\n<Status tone="danger">Unable to save. Try again.</Status>\n<Badge tone="warning">Unsaved</Badge>\n<div role="status" aria-label="Loading preview" aria-busy="true">\n  <Shimmer width="40%" />\n  <Shimmer variant="block" />\n</div>`,
};

// URL handling is application code; the shared components accept normal links.
snippets["workspace-navigation"] = `<WorkspaceLayout
  title={business.name}
  groups={authorizedGroups}
  activeId={route.pageId}
  onNavigate={({ href }) => router.navigate(href)}
>
  <Breadcrumbs items={route.breadcrumbs} onNavigate={navigate} />
  <RecordsPage query={route.tableQuery} />
</WorkspaceLayout>

// Example app URL (catalog uses a hash route for static hosting):
// /t/sample-shop/app/work/estimates/estimates-1?detail=activity&revision=2
// App router owns parsing, canonical URLs, history, auth and record lookup.`;
