# Public component API, v0.3.0

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
| Parameters       | values, unit                                                          | Stable parameter order; see below                                                    |
| Panel            | title, actions, children                                              | Persistent surface with header and body                                              |
| Section          | title, collapsible, defaultOpen, modified, hasError, children         | Named grouping; optional initial expansion and status hints                          |
| Dialog           | title, description, open, onOpenChange, children, footer, dismissible | Focused modal task                                                                   |
| SidePanel        | same as Dialog                                                        | Contextual modal drawer; full width on narrow viewports                              |
| SegmentedControl | label, value, onChange, options                                       | Radio-group semantics for mutually exclusive modes                                   |
| Badge            | tone, children                                                        | neutral/success/warning/danger, non-announcing label                                 |
| Status           | tone, children                                                        | Error alert or polite status announcement                                            |
| parseMeasurement | raw string                                                            | Finite decimal/fraction parser; number or null                                       |
| parameterOrder   | readonly array                                                        | Canonical parameter order                                                            |

## Actions

`Action = {id, label, icon?, onAction, disabled?, destructive?, separatorBefore?}`. Identifiers must be unique. Synchronous callbacks may start asynchronous application tasks; the application supplies disabled/pending state and local feedback. No persistence is performed by menus.

## Parameters

`values` is a partial record keyed by `width`, `height`, `depth`, `offset`, `heightFromFloor`, `setback`, `rotation`.

Each entry accepts `{value, onChange, label?, reference?, min?, max?, readOnly?, disabled?, unit?}`. Units default to `in` for lengths and `°` for rotation. Display labels may clarify reference origins without changing the canonical ordering. Values must be finite numbers. Bounds are inclusive. No automatic unit conversion, geometry normalization, or precision rounding is applied.

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
