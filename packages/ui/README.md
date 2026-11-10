# @from-trees/ui

Native React + StyleX source package for From Trees applications. Components and tokens are compiled by the consuming app's shared StyleX setup.

```tsx
import {ThemeProvider, Button} from '@from-trees/ui';
import {color, metrics, space} from '@from-trees/ui/tokens.stylex';
```

Configure `fromTreesStylex` from `@from-trees/ui/vite` in Vite and Vitest. It compiles library and app source together and loads the compiler-generated stylesheet. There is no library CSS import or compiled distribution.

Themes: forest/slate/dark. Density: comfortable/compact. The application owns business logic and data. This package deliberately targets our React, TypeScript, StyleX and Vite stack.

https://from-trees.github.io/design-system/

Use the shared spacing/layout classes in applications:

```tsx
import {layout, gap, padding} from '@from-trees/ui/utilities';
<div {...stylex.props(layout.stack, gap.lg, padding.xl)}>…</div>
```

Spacing keys: none/xs/sm/md/lg/xl/xxl = 0/4/8/12/16/24/32 px. Gap, padding, margin and logical block/inline variants share the same tokens. Keep domain-specific and responsive styles local.

`List` owns standard title/metadata/status-or-menu rows. Supply item data and actions; do not rebuild the row in applications. See the catalog's Lists page and History & sharing workflow.

`InfoTooltip` provides optional non-interactive elaboration on hover, keyboard focus or tap. Parameters use it for reference/help details while validation remains inline. Review this behavior in the catalog before app adoption.

`Parameters` renders ordered app-defined groups and fields. Define the specific schema, grouping, order and units in an app wrapper, as the catalog's CabinetParameters does. The UI package provides no cabinet preset or default units.


### Workflow progress (0.8.0)

`WorkflowProgress` accepts app-defined `steps`, `selectedId`, `onSelect` and an accessible `label`. Steps provide `id`, `label`, `status`, `detail` and `available`. The app owns eligibility and completion. Navigation only changes the displayed stage; it does not sign, pay or advance production. See the Customer estimates catalog pattern before app adoption.

### Grouped workspace navigation (0.10.0 catalog review)

`WorkspaceLayout` supplies a grouped left navigation with independently scrolling navigation/content and a named navigation drawer at narrow container widths. `GroupedNavigation` and `Breadcrumbs` can also be used separately. All links retain real `href` values, accessible current-page state, keyboard activation and modified-click/new-tab behavior. Apps supply `NavigationGroup[]`, `activeId` and optionally `onNavigate`; the package does not parse or persist routes, authorize destinations, or load records.

```tsx
<WorkspaceLayout
  title={business.name}
  groups={authorizedGroups}
  activeId={route.pageId}
  onNavigate={({ href }) => router.navigate(href)}
>
  <Breadcrumbs items={route.breadcrumbs} onNavigate={navigate} />
  <RecordsPage />
</WorkspaceLayout>
```

Give the layout a bounded parent height for independent scrolling. Its mobile breakpoint follows its container width, so the same behavior works in the catalog and an application. Normal links work without a custom navigation callback. Do not turn application destinations into button rows or action menus.

The workspace catalog example owns its synthetic routing model. Review refresh, copied/deep links, Back/Forward, list criteria, exact saved revisions, customer/contact/address identity and unavailable destinations there before application adoption. Existing Cabinitron customer editing/preparation, permissions, immutable snapshots and backend APIs remain application responsibilities.

### Grouped swatch choices (0.12.0 catalog review)

`SwatchPicker` accepts either the existing flat `options` or `groups` containing an `id`, visible `label`, and `options`. Both modes keep one controlled selection and display its preview in the field and popup. Group and option IDs must be unique throughout the picker. Applications supply all preview artwork, names, eligibility, saved choices and grouping; the UI package does not load material libraries or change finishes.

```tsx
<SwatchPicker
  value={materialId}
  onChange={setMaterialId}
  groups={[
    {id: 'built-in', label: 'Built-In', options: builtInChoices},
    {id: 'library', label: 'Library', options: libraryChoices},
  ]}
/>
```

Groups have accessible headings. Keyboard navigation, typeahead, disabled choices, Escape cancellation and focus restoration apply across groups. An entirely empty picker stays disabled; callers can supply a disabled descriptive option when a group needs an empty-state message. Review the grouped material example in **Swatches & previews** before application adoption. The catalog uses illustrative wood/paint/library samples; it has no business data, pricing, sheen control or persistence migration.
