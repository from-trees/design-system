# Public component API, v0.5.0

Import components from `@from-trees/ui`, tokens from `@from-trees/ui/tokens.stylex`, and common compiler setup from `@from-trees/ui/vite`. The consuming app compiles StyleX; there is no CSS entry point.

| Export           | Main props                                                            | Notes                                                                                |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| ThemeProvider    | theme, density, children                                              | forest/slate/dark; comfortable/compact; portaled descendants inherit theme           |
| Icon             | name, size                                                            | Curated Lucide vocabulary, decorative by default; label the enclosing control        |
| Button           | icon, variant, busy, isDisabled, onPress, children                    | primary/secondary/ghost/danger; React Aria button props, not native onClick-only API |
| IconButton       | label, icon, variant, busy, isDisabled, onPress                       | Accessible name and focus/hover tooltip                                              |
| MenuButton       | label, actions                                                        | Ellipsis trigger; React Aria menu, positioning and keyboard behavior                 |
| ActionGroup      | actions, primaryId, label                                             | 1–2 actions inline; 3+ collapse to a menu with optional primary                      |
| TextInput        | label, help, error, native input props                                | Label/description/error associations; controlled or uncontrolled                     |
| Select           | label, help, error, native select props, children                     | Native platform selection behavior                                                   |
| Switch           | label, selected, onChange, disabled                                   | Controlled binary choice                                                             |
| Parameters       | groups, unit                                                          | App-defined schema and order; see below                                                    |
| Panel            | title, actions, children                                              | Persistent surface with header and body                                              |
| Section          | title, collapsible, defaultOpen, modified, hasError, children         | Named grouping; optional initial expansion and status hints                          |
| Dialog           | title, description, open, onOpenChange, children, footer, dismissible | Focused modal task                                                                   |
| SidePanel        | same as Dialog                                                        | Contextual modal drawer; full width on narrow viewports                              |
| SegmentedControl | label, value, onChange, options                                       | Radio-group semantics for mutually exclusive modes                                   |
| Badge            | tone, children                                                        | neutral/success/warning/danger, non-announcing label                                 |
| Status           | tone, children                                                        | Error alert or polite status announcement                                            |
| parseMeasurement | raw string                                                            | Finite decimal/fraction parser; number or null                                       |

## Actions

`Action = {id, label, icon?, onAction, disabled?, destructive?, separatorBefore?}`. Identifiers must be unique. Synchronous callbacks may start asynchronous application tasks; the application supplies disabled/pending state and local feedback. No persistence is performed by menus.

## Parameters

`Parameters({groups, unit?})` is a generic numeric parameter editor. It does not define parameter IDs, labels, groups, order, icons, units or domain-specific bounds. It renders the supplied group/field arrays in order, omitting empty groups.

`ParameterGroup = {id, label, parameters: readonly Parameter[]}`.

`Parameter = {id, label, value, onChange, validate?, icon?, reference?, help?, min?, max?, readOnly?, disabled?, unit?}`. IDs are strings chosen by the app; group IDs and field IDs within a group must be unique and stable. Units have no default. A field unit overrides the optional container unit. Values must be finite; bounds are inclusive. The component accepts decimals and fractions, commits only on blur (Enter blurs), cancels a draft on Escape and resets on external value changes. It performs no unit conversion, domain normalization or precision rounding.

Each application should provide a specific wrapper that defines its available parameters, grouping, ordering, labeling, icons, units and constraints in one place. Reuse that wrapper throughout the app. The catalog's `apps/catalog/src/CabinetParameters.tsx` is an example: its Size/Position/Orientation schema is application code, not a library preset. Another catalog example uses unrelated Gain/Duration/Samples fields and units.

```tsx
import {Parameters, type ParameterGroup} from '@from-trees/ui';
const groups: ParameterGroup[] = [
  {id: 'output', label: 'Output', parameters: [
    {id: 'duration-ms', label: 'Duration', unit: 'ms', value: duration, onChange: setDuration},
    {id: 'gain-pct', label: 'Gain', unit: '%', value: gain, onChange: setGain},
  ]},
];
<Parameters groups={groups} />
```

The 0.4.0 API replaces the former `values` record. `ParameterKey` and `parameterOrder` are removed from the UI package. Migrate domain schemas into an app wrapper; there is no library fallback to the old cabinet schema.

## Segmented choices

`options = [{value, label, icon?, disabled?}]`. Choices retain visible labels. Keyboard arrow navigation comes from radio-group semantics. Use dedicated navigation tabs rather than this control when switching distinct page panels; a dedicated shared Tabs component is tracked separately.

## Composition

Examples in the catalog demonstrate public APIs. Synthetic History & sharing is a catalog pattern, not a package export; production history, restore and links must be supplied by the application. The restore confirmation deliberately replaces the drawer while active and returns to it after completion, rather than stacking overlays.

## StyleX utilities

Import from `@from-trees/ui/utilities` (also exported from the package root). All exports are native `stylex.create` objects, composed with `stylex.props` and compiled by the consuming app.

- `gap`, `padding`, `paddingBlock`, `paddingInline`, `margin`, `marginBlock`, `marginInline`: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl` map to 0, 4, 8, 12, 16, 24, 32 px using the shared `space` tokens.
- `layout`: `row`, `stack`, `wrap`, `alignCenter`, `alignStart`, `alignStretch`, `between`, `grow`. Row and stack set flex direction and allow shrinking; they do not set a gap or alignment.

Prefer gap for sibling spacing and padding for surface insets. Block/inline follow the writing direction. Spacing utilities are fixed across control densities; use density-aware `metrics` for component internals. Compose component-specific styles last when intentional overrides are needed. Use local StyleX for responsive layouts or domain-specific dimensions; do not add arbitrary pixel-size utility variants. ThemeProvider supplies shared tokens, including in overlays.

```tsx
import {layout, gap, paddingInline} from '@from-trees/ui/utilities';
<div {...stylex.props(layout.row, layout.wrap, layout.alignCenter, gap.sm, paddingInline.lg, localStyles.toolbar)} />
```

## Lists

`List` owns the complete standard list composition used by History & sharing. Supply `label`, `items` and optional `emptyMessage`. It renders a semantic list with consistent row spacing, title/metadata typography, text overflow and a right-aligned status or MenuButton. Do not reconstruct the row in an app.

`ListItem = {id, title, metadata}` plus **either** `{status: {label, tone?}}` **or** `{actions?, actionLabel?}`. Title and metadata are plain strings. Status tones match Badge. Actions use the shared Action API; their default accessible menu name is `${title} actions`. A row without actions or status is informational. IDs must be unique and stable.

There are no children, row renderers, class/style overrides, inline button variants or separator variants. Even a single action stays in the row menu. Keep concise metadata on one line; full strings remain in the DOM and the native title tooltip when truncated. Detailed records belong in the inspection workflow. Applications own date formatting, navigation callbacks, permissions and restore confirmations. Loading/error feedback sits beside the list, using shared Status, while existing data remains visible.

```tsx
import {List, type ListItem} from '@from-trees/ui';
const items: ListItem[] = [
  {id: '4', title: 'Revision 4', metadata: 'Team member · Nov 2', status: {label: 'Current', tone: 'success'}},
  {id: '3', title: 'Revision 3', metadata: 'Team member · Nov 2', actions: [
    {id: 'inspect', label: 'Inspect', icon: 'view', onAction: inspect},
    {id: 'restore', label: 'Restore', icon: 'history', onAction: confirmRestore},
  ]},
];
<List label="Saved revisions" items={items} />
```

The catalog's History & sharing workflow imports this component directly. Review long content, empty state, disabled actions, keyboard menus, themes and narrow layouts on the Lists page before app adoption.

## Contextual help

`InfoTooltip({label, children})` is the standalone info control. It displays the common 16px info icon in a 24px target, named `About ${label}` for assistive technology. Supply optional non-interactive explanatory content; use a dialog for actions, links or forms.

Hover opens after 350ms; keyboard focus opens immediately. The pointer can move into the tooltip without losing it. Click/tap toggles the explanation. Outside press, blur or Escape dismisses it. Escape dismisses help before its containing dialog. The portal uses its containing dialog when present, preserving modal accessibility; placement stays inside the viewport and inherits theme.

In Parameters, `reference` and `help` are combined in the info control beside the label. They do not add a visible paragraph or change row height. A hidden input description preserves that detail for assistive technology. The help button remains available when the parameter is disabled or read-only. Labels, values and units stay visible; validation errors remain inline and associated with the input. Do not hide an essential label or required action in help.

```tsx
import {InfoTooltip, Parameters} from '@from-trees/ui';
<InfoTooltip label="Wall offset">From the start of the parent wall.</InfoTooltip>
<Parameters groups={[{id: 'placement', label: 'Placement', parameters: [{
  id: 'offset', value: offset, onChange: setOffset, label: 'Offset from left',
  reference: 'From the start of the parent wall.',
  help: 'Follows the wall direction, not the screen edge.',
}]}]} />
```

This API is under catalog review. Cabinitron adoption follows user confirmation in a separate app change.

## App-owned numeric rules

`Parameter.validate(value)` optionally returns an error message for an otherwise parsed, finite value. Return `undefined` to accept it. The component shows that message inline, associates it with the input and does not call onChange for rejected values. Parsing and min/max checks run first. Keep validation synchronous and free of side effects; apps own the rule and its wording.

After a valid commit, the field displays the controlled `value`, including when an app normalizes a draft back to the same saved value. Later external-value updates still reset the field. This prevents a value such as 8.25 remaining displayed when the app snapped it back to an unchanged 8. The component does not supply a snap step, rounding rule or positive-only constraint.

```tsx
{ id: 'size', label: 'Size', value: size, onChange: setSize,
  validate: value => value > 0 ? undefined : 'Enter a size greater than zero.' }
{ id: 'offset', label: 'Offset', value: offset,
  onChange: value => setOffset(Math.round(value)) }
```

The catalog's **App-defined validation & snapping** example demonstrates these rules in app code. Review this behavior before app adoption.

Validation and normalization run only after focus leaves the input. Typing does not call validate or onChange, including empty, partial, temporary zero or out-of-range drafts. Enter blurs the input and therefore ends editing before committing. Returning to an invalid field clears its error while it is edited; validation runs again on blur. Escape restores the current value without a write. No active draft is clamped or rounded while the user types.

## Shared parameter rows and component editors

`ParameterRow` owns the same fixed label/editor columns used by numeric `Parameters`, plus optional icon, contextual `reference`/`help` and inline `error`. Use it for related property choices within an editing section, including the selects and switches in the Appearance and Construction examples. Sections organize those rows; they do not introduce another property layout. Standalone inputs remain appropriate for forms, search and other interactions that are not parameter editing. Do not rebuild the grid in app code.

Pass a component instance as its child. Shared `TextInput`, `Select` and `Switch` inherit the row label and descriptions through context, without rendering a second label. Outside a row, they retain their standalone layouts and require an accessible label. Provide disabled/read-only state to the editor itself. Optional detail belongs on the row's help control.

```tsx
<Section title="Appearance" collapsible>
  <ParameterRow label="Finish">
    <Select value={finish} onChange={e => setFinish(e.currentTarget.value)}>
      <option value="oak">Natural oak</option>
      <option value="paint">Paint</option>
    </Select>
  </ParameterRow>
</Section>
<ParameterRow label="Custom back thickness" help="Override the standard thickness.">
  <Switch selected={custom} onChange={setCustom} />
</ParameterRow>
```

For an app-specific editor, the child can be a function receiving `ParameterControlProps`: `id`, `aria-labelledby`, `aria-describedby`, and `aria-invalid`. Forward those attributes to the one editable control. The row does not inspect, clone or overwrite arbitrary component props; the custom editor owns its state, interaction, validation timing and styling within the editor slot.

```tsx
<ParameterRow label="Quality" help="App-owned quality setting.">
  {controlProps => <input {...controlProps} type="range" min="1" max="10" />}
</ParameterRow>
```

Schemas remain supported. A `CustomParameter` has the usual `id`, `label`, optional icon/help/reference/error, and a `control` containing a component instance or the same render function. Numeric entries retain `Parameter` and their existing focus-loss commit behavior. Group labels are optional when an enclosing Section already supplies the heading; applications still own group order and content.

```tsx
<Parameters groups={[{id: 'options', parameters: [
  {id: 'width', label: 'Width', value: width, onChange: setWidth, unit: 'in'},
  {id: 'enabled', label: 'Enabled', control: <Switch selected={enabled} onChange={setEnabled} />},
]}]} />
```

Keep exactly one editor in each row. The row owns layout and accessible labeling; it does not change a select or switch into a numeric input, or apply measurement parsing to custom controls. Review **Mixed parameter editors** on the Parameters page and the expanded **Appearance** and **Construction** sections on Panels & sections before app adoption.

Parameter groups accept optional `help` and `helpLabel`. The help icon sits at the right edge of the group heading, above the editor column. Use the first group for instructions shared by the whole parameter set, such as measurement syntax; keep per-property help beside its row label. The catalog app supplies that guidance, not the generic library.

## Visual choices

`SwatchPicker` is the shared single-choice visual selector. Its trigger shows the current preview and name; opening it shows a compact grid with named previews, selected checkmark, keyboard focus and disabled options. Arrow keys, Home/End and typeahead navigate; Enter selects; Escape dismisses without changing the value and returns focus to the trigger. It works inside shared overlays and native dialogs.

```tsx
<ParameterRow
  label="Material"
  help="Choose the material independently from the finish."
>
  <SwatchPicker
    value={materialId}
    options={materials.map((material) => ({
      id: material.id,
      label: material.name,
      preview: <img src={material.thumbnail} alt="" />,
      description: material.description,
      disabled: !material.available,
    }))}
    onChange={setMaterialId}
  />
</ParameterRow>
```

The picker inherits the row's label, contextual help and error description. Outside a row, supply `label`. Control the value in the caller; empty collections disable the trigger. Previews are decorative React nodes: applications own image loading/fallbacks, geometric drawings, option data, availability and persistence. Keep previews noninteractive and sized to fill the available space. Do not infer configuration or profile behavior from thumbnail geometry.

Use it for materials, colors, profiles, cabinet configurations and other choices distinguished visually. Keep ordinary selects for nonvisual choices. See **Swatches & previews** for the isolated component and **Designer sidebar** for shared-style drafts, room surfaces/crown and cabinet configurations. Catalog textures retain their CC0 provenance in `apps/catalog/public/swatches/provenance.json`; stone and finish samples are representative, not exact product or fabrication references.

## Headers and command bars

```tsx
<WorkspaceHeader
  title={document.name}
  metadata={workspace.name}
  label="Document commands"
  status={{ label: saveStatus, tone: saveFailed ? "danger" : "neutral" }}
  primary={{ id: "undo", label: "Undo", icon: "undo", disabled: !canUndo, onAction: undo }}
  menuLabel="Document actions"
  actions={documentActions}
/>
<CommandBar label="Editing commands" menuLabel="Add items" menuIcon="add" menuText="Add" actions={addActions}>
  <Select aria-label="View" value={view} onChange={changeView}>{viewOptions}</Select>
</CommandBar>
<TaskHeader title="Edit document" onCancel={discard} onSave={commit} disabled={!valid} busy={saving} error={error} />
```

`CommandBar` accepts input controls as children and owns its direct-action/menu layout. `inline` keeps its control and action groups together above 700 px, wrapping on narrow screens. `primary` extends the shared Action shape with optional `busy`. `menuIcon`/`menuText` make contextual menus discoverable; ordinary overflow uses the existing ellipsis trigger. `status` uses the existing `Badge` in a fixed-width slot aligned immediately beside the direct command. Keep its `label` concise; optional `description` carries full accessible/native-tooltip detail without moving actions. Tab reaches controls, arrow/Home/End keys move between enabled toolbar buttons, native select keys remain native, and menus retain their own focus behavior.

`WorkspaceHeader` supports title, optional metadata, heading `level` (1–3), `compact`, and the command-bar props. It places identity and commands in one desktop row and stacks them on narrow screens. Place mode choices in its children using the shared `SegmentedControl`; merge workspace commands into its action menu instead of adding another toolbar. `TaskHeader` owns exactly Cancel and Save, optional description/error and save label. A task must have one owning header; do not add it underneath the header of an existing overlay. The designer catalog prototype and its full adoption inventory live in [designer-toolbar-prototype.md](designer-toolbar-prototype.md).

## Shimmer loading placeholders

`Shimmer` is a decorative, theme-aware skeleton with `variant="line" | "block" | "circle"`, optional `width` (pixels or a CSS length) and `height` (pixels). Defaults are a full-width 14 px line, a full-width 160 px block or a 32 px circle. Compose placeholders to match the content that will replace them, keeping dimensions stable. Reduced-motion preferences disable the sweep.

```tsx
<div role="status" aria-label="Loading elevations" aria-busy="true">
  <Shimmer width="35%" height={18} />
  <Shimmer variant="block" height={160} />
</div>
```

Placeholders are hidden from assistive technology; the owning region supplies one loading announcement and busy state. Replace the entire loading region with real content when the request resolves; on failure, replace it with `Status tone="danger"` and a retry action. A shimmer is never proof that data exists or that a request has completed. Applications own loading, cancellation, retries and errors. See Status & feedback for the isolated shapes and Designer toolbars for the dialog composition.

The [advanced cabinet customizer inspector exploration](customizer-inspector-prototype.md) composes the existing parameter, panel, menu, list and swatch components around cabinet, part and drawer contexts. Its cabinet schema stays in the catalog; app adoption is a separate reviewed change.

## Workflow progress (0.8.0)

`WorkflowProgress` renders an app-defined sequence of steps with completion, current, upcoming and attention states. Apps provide step eligibility and authoritative status; clicking a step only calls `onSelect`. The selected view is independent of the current task. See [customer journey behavior and adoption requirements](customer-estimate-journey.md).
