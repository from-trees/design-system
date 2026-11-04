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
