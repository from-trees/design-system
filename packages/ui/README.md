# @from-trees/ui

Shared React 18.3/19 components, built with StyleX and React Aria. No application data or backend dependencies.

```tsx
import {ThemeProvider, Button, IconButton, MenuButton, Parameters} from '@from-trees/ui';
import '@from-trees/ui/styles.css';

<ThemeProvider theme="forest" density="compact">
  <Button icon="save" variant="primary" onPress={save}>Save</Button>
</ThemeProvider>
```

Compiled CSS and TypeScript declarations ship in the package. No consumer-side StyleX compilation is necessary. Themes: `forest`, `slate`, `dark`. Density: `comfortable`, `compact`.

React and React DOM are peers. React Aria, StyleX runtime, and Lucide icons are dependencies. Import CSS once; the package does not reset global element styles. Scope aggressive app-level CSS before adoption. Compiled component styles use no CSS layers, allowing independently compiled StyleX styles to compose consistently.

Documentation and interactive reference: https://from-trees.github.io/design-system/

Source, conventions and adoption guide: https://github.com/from-trees/design-system
