# Visual swatch review

Captured from the local production catalog build with synthetic data:

- `style-material.png`: image swatches in the shared-style dialog.
- `style-profiles.png`: separate door/drawer profile drawings, inside the dialog.
- `cabinet-configuration.png`: six cabinet configuration drawings.
- `room-crown.png`: crown profile geometry, independent from finish.
- `room-surfaces.png`: representative stone choices in the isolated component example.
- `narrow-configuration.png`: 390 px viewport; popup stays inside the viewport.
- `dark-profiles.png`: themed popup, captions, selected state and focus indicator.

Focused verification: 14 component/catalog tests, lint, TypeScript, library/catalog builds, native-source package check. Browser checks covered modal popup Escape/focus return, room crown selection, configuration grids, narrow layout and dark theme. Material/profile samples are illustrative; real app geometry, availability and product libraries remain app-owned.

Cabinitron adoption is separate. Its Customize cabinet action must lead to the existing advanced cabinet customizer; the small catalog draft task only demonstrates the transition and save/cancel behavior.
