# Designer headers and toolbars

Review **Components → Headers & toolbars** (`#toolbars`) and **Patterns → Designer toolbars** (`#designer-toolbars`) before Cabinitron adoption. These are React/StyleX components and local synthetic examples. Cabinitron source is unchanged in this review.

## Shared components

- `WorkspaceHeader`: one identity and command area. Title and metadata truncate without dropping their full text. Compact mode suits viewport headers. Avoid stacking host branding, document identity and a repeated marketing heading.
- `CommandBar`: leading input controls, a reserved status slot, and at most one direct action plus a menu. Use familiar icons for direct commands; use a named/icon menu such as **Add** or **Parts** where an ellipsis would conceal the purpose. Use segmented choices for workspace modes and native selects for other view/tool decisions. Children must not smuggle in another action row.
- `TaskHeader`: one task title and exactly Cancel/Save. Busy disables repeat commit and dismissal; invalid drafts disable Save and retain visible error text. Replace a task's old header; do not nest this under another dialog header.
- `MenuButton` adds optional `icon`/`text` triggers. Its existing ellipsis default remains unchanged for lists and ordinary overflow menus.

Applications own command eligibility, data, callbacks and persistence. None of these shared components contains a cabinet schema or permissions policy. The catalog's scenario switches are explicit synthetic fixtures, never an authorization implementation.

## Complete surface inventory

| Current Cabinitron surface | Proposed organization | Adoption obligations |
| --- | --- | --- |
| Public/embedded designer host header and business identity | One project identity, compact business/revision/access metadata, segmented views and merged project/workspace menu | Preserve workspace/site/sign-in links, embedded behavior and private customer-copy identity; suppress duplicate branding |
| Project action bar | Undo icon plus Project actions; fixed-width save status | Preserve saved-project promotion, customer-package eligibility, room share/range/history, New room, conflict recovery and retry; never shift controls when status text changes |
| Plan / Split / 3D / Elevation button row | Existing segmented view-mode control in the project header | Keep the current view/selection state and all geometry intact |
| Plan viewport header and navigation | Compact Plan identity and navigation menu | Zoom in/out, Fit and Pan remain reachable; preserve keyboard/mouse alternatives |
| Add cabinet / fixture / library / room-panel row | Named Add menu with the real libraries in focused selectors | Preserve existing generated 3D previews and all catalog categories; no illustrative geometry replaces them |
| Outline editing toolbar | Outline mode plus named Tools menu; short placement status and info help | Retain add/split/merge/remove walls, doors/windows/openings, recess removal, eligibility checks, previews, Command modifiers and Escape cancellation |
| 3D viewport header | Compact 3D identity, direct Photo icon, navigation menu | Keep photo settings reachable explicitly; preserve current capture, rendering, progress, cancellation and camera readiness behavior |
| Saved-camera toolbar and inline naming form | Saved-view selector plus one management menu; focused naming task | Keep stable view IDs even when names repeat; 50-view and 80-character app limits remain app-owned and appear in help; preserve render options, first customer view and deletion |
| Elevation worksheet heading | One compact Elevations header and contextual dimension guidance | Preserve the generated wall/island sheets and field-verification requirements; do not invent a new export capability |
| ConfigurationSheet header | One TaskHeader with Cancel and Save at the upper right | Continue to use the existing advanced customizer, validation, sink attachment and complete draft; preserve save errors and focus restoration |
| CustomUnitEditor standalone marketing/preset header | Compact workshop identity and named Presets menu (component example) | Preserve Blank, Vanity, Closet, Curved bookcase, End shelves and Stepped fronts using their actual definitions; keep this header absent when ConfigurationSheet owns it |
| Cabinet Add part / Parts row | Named Parts command menu and focused part list | Retain every actual part tool, identity, size and selection behavior; use the existing component geometry |
| Cabinet view / Fit / Undo / Redo row | View selector and command menu | Preserve 3D/Front/Side/Top, Fit, undo/redo and disabled states |
| Cabinet Orbit / Move / Interact and Snap row | Tool and snap selectors | Retain all existing snapping values, interaction/movement rules, Escape and keyboard help; input choices are controls, not long action rows |
| Photo/render settings, sharing, customer-package and library-selection task headers | Reuse the confirmed Dialog/SidePanel owning header and explicit footer actions | Audit every launched surface; preserve its real controls and errors. Do not put TaskHeader inside an overlay that already owns its header |
| Placement, dimensions and fit status strips | Compact app-derived status/readouts with optional info help | Preserve actionable errors and current measurements; avoid repeating permanent instructions |

## Review scenarios

1. Compare Plan, Split, 3D and Elevation. Their segmented choices retain state without pretending to edit geometry.
2. Open Add, start a synthetic placement, cancel with Escape, then place and Undo/Redo. Repeat in outline mode.
3. Change save state through Saved, Unsaved, Saving and the long error. Recover via Project actions. Direct command bounds must remain unchanged after fonts load.
4. Compare business project, staff draft, public anonymous draft, customer view with/without copy permission, and editable customer copy. Public customers must not gain staff commands by creating a copy.
5. Save/select/delete a synthetic view. Inspect first-customer-view and render-option eligibility. IDs are independent of display names.
6. Start a photo; saved-view changes and duplicate capture are disabled. Complete the demo using its review control.
7. Open customization. Confirm there is one task header, add a draft part, Undo/Redo, cancel, reopen, then save. Invalid draft review mode disables Save.
8. Review the standalone workshop Presets menu on the component page.
9. Repeat at 390 px and with dark/compact themes. Menus, inputs and task actions remain inside the viewport.

## Verification and boundaries

Focused tests exercise generic command grouping/keyboard behavior, unchanged existing menu/list behavior, status text, task commits, access scenarios, placement, saved views and customizer drafts. Browser evidence must include desktop, a contextual menu, narrow layout, customizer header, and stable save-status command bounds after `document.fonts.ready`.

The viewport drawings and object/part counts are schematic review aids. Photo completion is controlled manually. History, sharing, rendering options, customer packages and navigation open illustrative task surfaces; their existing app implementations are not recreated here. The app adoption must bind the confirmed chrome to real commands and keep the whole geometry/material/saved-revision model. Do not use this catalog's fixture state as product logic.

Follow-up delivery is a separate Cabinitron diff after the user confirms this catalog behavior. No package publication, Cabinitron integration or production release is part of this PR.

The project header owns the existing segmented view-mode control. There is no separate workspace selector/menu row. Workspace commands join the project menu after a separator; the segmented choices are modes, not command buttons. Regular widths keep this in one compact header; narrow screens reflow within that same header.
