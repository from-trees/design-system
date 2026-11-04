# Advanced cabinet customizer inspector

Review the **Cabinet customizer** catalog page (`#customizer`) before adopting this organization in Cabinitron. This is a local interactive exploration, not the product's geometry editor. All schemas and cabinet terminology live in catalog fixtures; the shared Parameters component remains generic.

## Organization

The task header owns Save and Cancel. The command menu owns part selection, addition, undo/redo and definition transfer. Cabinet view, interaction tool and movement snapping are editing-session state and never modify the saved configuration.

The inspector has three explicit contexts. **Cabinet** contains identity and dimensions, then Construction, Shared shape, Sink attachment and Business library. **Selected part** keeps part identity, size and position visible, followed by appropriate Operation, Appearance and Independent shape sections. **Preview** contains material, color and front-profile swatches and is separate from construction edits.

Every editable property uses ParameterRow or Parameters, including selects, switches and swatch pickers. Labels and values share columns; optional explanations stay in info help. Group-level measurement help appears beside the first group heading. Bounds are described on the individual field. Numeric text remains a draft while focused; Enter or blur commits, Escape resets, and invalid values prevent saving the visible inspector.

## Coverage and adoption mapping

| Existing customizer area | Catalog surface | Integration requirement |
| --- | --- | --- |
| Room-controlled envelope / standalone dimensions | Cabinet → Size; review scenarios | Preserve room ownership and the application's actual bounds. |
| Part identity, dimensions and position | Selected part → Name, Size, Position | Keep persistent part IDs, coordinate conventions and anchored-edge behavior. |
| Door mechanisms, hinge, pocket travel, tambour slats | Selected door → Operation | Retain real mechanisms, hardware clearances and movement. |
| Front style, fixed-front pull, back-panel seams | Selected part → Appearance | Use the application's existing swatch imagery and full option set. |
| Shared outline, curves and arched fronts | Cabinet → Shared shape | Retain actual geometry and propagation, including application-specific limits. |
| Independent part outline and copying edges | Selected part → Independent shape; part menu | Preserve independent attachments and copy-to-cabinet behavior. |
| Drawer count and row heights | Selected drawer array → Array defaults | Top-to-bottom presentation; retain real fitting and balancing math. |
| Opening method, finger profile, plumbing notch | Array defaults / individual drawer | Explicit inheritance and override identity. Plumbing notches remain individual drawer controls, matching the product. |
| Internal/external fronts and stretchers | Array defaults → Face placement, Stretchers | Retain collision checks, door restrictions and manufacturing rules. |
| Add, duplicate, remove, undo/redo | Parts menu and selected-part menu | Preserve existing eligibility rules; destructive actions confirm. Undo restores the synthetic fixture. |
| Preview material, finish, profile, camera/tool/snap | Preview context and command bar | Never save or version the design merely for changing these session controls. |
| Sink attachment, library and definition transfer | Named sections / command menu | Explicit integration placeholders; keep real dialogs, validation and permissions. |

## Review scenarios

- Room cabinet: dimensions are read-only; part controls remain editable.
- Standalone: dimensions are editable and expose limits through field help.
- Read only: construction controls and Save are disabled. Navigation and preview remain available.
- Drawer defaults versus individual drawer: change the array opening method, override drawer 1, inspect drawer 2, then reset drawer 1 through its action menu.
- Save and Cancel: Save snapshots valid local configuration; Cancel restores the last saved snapshot. A successful Save is only catalog-local feedback.

## Boundaries

The schematic identifies the selected part and drawer and illustrates preview swatches. It does not render dimensions, hardware motion, curves or construction changes accurately. View and tool selectors demonstrate control organization, not working cameras or manipulation tools. The fixture has representative parts, profiles and materials, not every production option. Its model and drawer balancing helpers must not be copied into the application's domain layer.

Numeric fixture limits are review inputs, not new product requirements. Production adoption must retain its actual constraints, explain each enforced rule in field help, and apply correction only when editing ends. Per-drawer index mapping must preserve the application's actual model order. Preview choices, selection, expansion, tool and camera changes must not enter autosave or revision comparisons.

Before app integration, confirm this behavior. Then create a separate Cabinitron diff using its real advanced customizer, renderer, geometry, options, swatches, authorization and saved revisions. Keep production pricing and exports outside this fixture.
