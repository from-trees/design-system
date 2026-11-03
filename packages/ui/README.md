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
