# Header and toolbar review evidence

All captures are from the local static catalog build with synthetic state. The drawings illustrate placement and hierarchy; they are not replacements for Cabinitron's geometry or previews.

- `desktop.png`: one project identity, fixed save-status area, segmented workspace modes in the same project header, compact viewport headers, named Add menu and saved-view management.
- `add-menu.png`: discoverable Add trigger and compact command menu.
- `error-project-menu.png`: full save failure retained accessibly and recovery in Project actions.
- `customizer.png`: one task header, Cancel/Save, view/tool/snap controls, named Parts menu and compact readout.
- `narrow.png`: 390 px viewport. Document scroll width was 390 px; project command buttons remained inside the viewport.
- `dark.png`: themed headers, menu triggers, selectors and readouts.

After `document.fonts.ready`, changing Saved to the long error message gave identical direct-command bounds at the desktop review width: Undo x=864, Project actions x=912; both 38 × 38, y=100.3984375. These are local catalog measurements, not production telemetry.

Validation: focused shared-header/prototype tests plus existing menu/list tests; lint, type checks, library/catalog build and native package check. Full tests remain in CI. See ../../designer-toolbar-prototype.md for the complete application surface inventory and the division between real component behavior and synthetic workflow state.

The compact-header adjustment removes the separate workspace-selector toolbar and combines its commands into Project actions. `before-compact-header.png` preserves the prior desktop catalog capture for comparison.
