# From Trees design system

Native React + StyleX components, tokens and build integration for our common application stack. Cabinitron is the first adopter; this repository contains no Cabinitron data or backend logic.

- Catalog: https://from-trees.github.io/design-system/
- Package: `@from-trees/ui`
- Styling: consuming apps compile library and app StyleX sources in one pipeline.
- No precompiled library CSS, CSS import, global reset or third-party compatibility layer.

## Develop

```sh
npm ci
npm run dev
npm run check
```

The catalog imports the native source package. Changes to library components have normal Vite hot reload; no library build step is needed to see them. Checks cover lint, types, catalog production build, interaction tests and source package contents.

## Install in our stack

```sh
pnpm add @stylexjs/stylex@0.19.1 https://github.com/from-trees/design-system/releases/download/v0.2.1/from-trees-ui-0.2.1.tgz
pnpm add -D @stylexjs/unplugin@0.19.1
```

Use the shared compiler configuration:

```ts
import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {fromTreesStylex} from '@from-trees/ui/vite';

export default defineConfig(({mode}) => ({
  plugins: fromTreesStylex({
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
    prefix: 'cabinitron',
    test: mode === 'test',
  }),
}));
```

The helper compiles both app and library, handles Vite development CSS updates, and loads compiler-generated production CSS even when an app has no CSS inputs. Tests use the compilation adapter without development-server timers. The helper currently targets our Vite HTML-entry apps; other hosts require their own integration before adoption.

```tsx
import {ThemeProvider, Button} from '@from-trees/ui';
import {color, space} from '@from-trees/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({content: {color: color.ink, padding: space.lg}});

export function App() {
  return <ThemeProvider density="compact">
    <div {...stylex.props(styles.content)}>
      <Button icon="save" variant="primary" onPress={save}>Save</Button>
    </div>
  </ThemeProvider>;
}
```

Never import `@from-trees/ui/styles.css`; that entry point was removed in 0.2.0. The package ships TypeScript/TSX and `.stylex.ts` token sources. The app owns compilation, generated CSS, geometry adapters, permissions, persistence and unsaved changes.

## Shared spacing and layout

```tsx
import {layout, gap, padding} from '@from-trees/ui/utilities';

<div {...stylex.props(layout.stack, gap.lg, padding.xl)}>
  <div {...stylex.props(layout.row, layout.wrap, gap.sm)}>…</div>
</div>
```

Apps should compose these shared classes instead of repeating spacing and flex definitions. See the Foundations catalog and [utility API](docs/components.md#stylex-utilities).

## Conventions and review

More than two adjacent actions use ActionGroup/MenuButton. Prefer recognizable icons and concise labels. Parameters follow stable size/position ordering. Keep common controls visible and uncommon settings in named sections. Use contextual side panels/dialogs instead of distant page updates.

Build shared UI changes in this repository and explore their behavior in the catalog first. Obtain the user's confirmation before implementing adoption in any app. App adoption is a separate change and review; do not develop both stages in parallel. See [adoption](docs/adoption.md).

All changes require a PR with screenshots and behavior evidence where relevant. Main publishes the catalog automatically. Evaluation tarballs can be attached to prereleases for coordinated app review; package registry publication is a separate explicit maintainer workflow from main. Do not overwrite published versions.

See [API](docs/components.md), [conventions](docs/conventions.md), [adoption](docs/adoption.md), and [roadmap](docs/roadmap.md).
