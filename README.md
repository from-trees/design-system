# From Trees design system

A standalone React + StyleX component package and interactive static reference site. Cabinitron supplies the first workflows; no Cabinitron code, customer data, authentication or backend is imported.

- **Catalog:** https://from-trees.github.io/design-system/
- **Package:** `@from-trees/ui`
- **Runtime:** React 18.3 or 19; browser and SSR-compatible exports.
- **Styling:** StyleX compiled into an explicit stylesheet. Consumers do not need a StyleX compiler.

## Develop

Node 22.12+ (CI uses Node 24), npm workspaces.

```sh
npm ci
npm run build
npm run dev
```

The catalog intentionally imports the **built package**, not a source alias. After editing `packages/ui/src`, run `npm run build -w @from-trees/ui` to refresh the catalog's package dependency. Catalog source has normal Vite hot reload.

```sh
npm run check     # lint, types, interaction tests, both builds, package smoke check
```

## Evaluate before registry release

Download the package artifact from a successful GitHub Actions verification run, or use the initial prerelease tarball:

```sh
npm install https://github.com/from-trees/design-system/releases/download/v0.1.0/from-trees-ui-0.1.0.tgz
```

That tarball installs as `@from-trees/ui`. It includes declarations and compiled CSS, with runtime dependencies installed normally. No repository source build is required.

For GitHub Packages, map `@from-trees:registry=https://npm.pkg.github.com` in the consuming app's `.npmrc`, authenticate locally, then install an available version with `npm install @from-trees/ui@VERSION`. Never commit a token. Registry publication is an explicit maintainer workflow from main; a source PR does not automatically publish a package version.

## Consume

```tsx
import { ThemeProvider, Button, ActionGroup, Parameters } from "@from-trees/ui";
import "@from-trees/ui/styles.css";

export function App() {
  return (
    <ThemeProvider theme="forest" density="compact">
      <Button icon="save" variant="primary" onPress={() => save()}>
        Save
      </Button>
    </ThemeProvider>
  );
}
```

Import the stylesheet once, after existing global styles. This package adds no global element reset. Styles are emitted without CSS layers so separately compiled StyleX applications can coexist without atomic-class collisions. The package and catalog use distinct stable class-name prefixes. Applications should scope aggressive global selectors and validate their styles before migration.

## Structure

- `packages/ui`: public, domain-independent components, StyleX tokens, themes and tests.
- `apps/catalog`: working examples, behavior notes, code examples, theme/density controls and synthetic composed workflows.
- `docs`: usage contract, API, adoption checklist and roadmap.
- `.github/workflows`: verification, GitHub Pages deployment and deliberate package publication.

## Interaction conventions

- More than two adjacent actions become a shared menu; one primary action may remain visible.
- Familiar actions use icons with accessible names and tooltips; ambiguous actions keep concise labels.
- Parameters preserve Width → Height → Depth; Offset → Height from floor → Setback; Rotation.
- Common controls remain visible; uncommon details use named sections.
- Contextual tasks open a side panel or dialog and retain focus/scroll context.
- State, persistence, permissions, unsaved-change guards and geometry adapters belong to the consuming application.

## Release and review

All changes require a PR. Include real screenshots and behavior evidence for UI changes. `Verify components` checks PRs and produces a package tarball. `Publish catalog` deploys main automatically and supports explicit dispatch against an initial review branch. The live catalog may therefore demonstrate a review branch; use the deployment run/commit to identify its source.

Version the UI package and catalog dependency together. Registry publication runs only from main via `Release UI package`. Do not overwrite a published version. Mark breaking changes and provide migrations. The initial tarball is a prerelease for evaluation; no application migration has been performed.

See [component API](docs/components.md), [conventions](docs/conventions.md), [adoption](docs/adoption.md), and [roadmap](docs/roadmap.md).
