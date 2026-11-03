# Cabinitron whole-sidebar exploration

Open **Patterns → Designer sidebar** (`#sidebar`). This is a catalog application workflow, not an exported cabinet-specific component. It uses the actual shared Panel, Section, Parameters/ParameterRow, fields, menus, List, contextual help and overlays. Visual choices use the shared SwatchPicker; cabinet and room option data and preview artwork remain catalog-owned.

## Review boundary

Review organization, discoverability, wording and interaction before application adoption. The right-hand review controls stand in for plan/3D selection and access state; they do not belong in the proposed designer sidebar. All state is synthetic and local to the mounted example. Reloading resets it. No API, persistence, auth, geometry or fabrication operations are performed.

Measurement bounds and simplified rounding are illustrative. Cabinitron's existing geometry, production constraints and permissions remain authoritative. This example is not permission to change those rules during integration.

## Structure

- A context chooser exposes Selection, Room and Styles without three adjacent action buttons.
- The context chooser, object/context title, read-only/generated status and object menu stay outside the independently scrolling property body.
- Size and position come first. Optional properties use named expandable sections. Their controls use the same parameter rows, including selects and switches.
- Section indicators report modifications or attention. An actionable warning at the top opens the relevant focused task directly.
- Optional explanations and numeric limits live in contextual help. Validation and rounding wait for focus loss. Plain name-entry forms retain standalone text inputs.
- Assigning a style changes one object. Editing a shared style opens a dialog with the affected-object count. Only Save commits the draft; dismissal discards it.
- Rename, duplicate and confirmed removal work locally. Automatic panels expose their controlling cabinet instead of editing/removal actions. Read-only examples preserve inspection/navigation while preventing writes.
- Cabinet customization and countertop editing open focused panels. Save applies their drafts; closing discards them and restores the originating context. An invalid numeric draft blocks Save. Resolving a warning returns focus to the context chooser when its launch button disappears.
- Per-wall thickness overrides are separate from the room's default. Crown remains room-owned, with profile and finish separate.

## Coverage and implementation inventory

This table is a migration checklist, not a claim that every production control has been recreated.

| Area | Proposed home | Prototype coverage / remaining detail |
| --- | --- | --- |
| No selection | Selection | Empty state and Room entry point |
| Base, wall, tall, freestanding and custom cabinets | Selection | Common size/position, style assignment, configuration, generated panels, back override, customization task; exact type-specific configurations and construction eligibility remain app-owned |
| Open storage | Selection → Construction | Doors and finished back; fitted shelf/drawer/rod schedules and back styles need detailed follow-up |
| Room panels | Selection | Thickness/height/depth, position, independent material |
| Appliances | Selection → Appearance | Dimensions and object-specific front finish; panel-ready and hood-specific branches need detailed follow-up |
| Fixtures | Selection → Fixture | Representative glass-shower entry and side; sink, mirror and other fixture-specific branches need detailed follow-up |
| Doors, windows, doorless openings | Selection → Opening | Shared size/offset, sill as Height from floor, parent wall, representative door/hinge choices; swing and pocket/closet-specific branches need follow-up |
| Islands | Selection | Width/depth, X/Z position, orientation, seating and focused countertop editing; grouped movement belongs to the app |
| Imported models | Selection → Model source | Width scales the example's read-only height/depth, position, local reload feedback; real asset loading/material fidelity remain app-owned |
| Automatic finish panels | Selection | Derived dimensions, Generated status and controlling-cabinet navigation |
| Interior/perimeter walls | Room outline / Selection | Representative length/thickness/position and plan-selection stand-in; split, merge, recess and endpoint tools remain plan-mode operations |
| Room size/outline | Room | Common dimensions and outline mode; no replacement geometry engine |
| Walls, floors and countertop surfaces | Room → Surfaces | Visual texture/color choices; actual libraries and assets remain app-owned |
| Wall, toe-kick and countertop edge defaults | Room → Construction defaults | Numeric defaults, continuous frames and maple internals |
| Crown | Room → Crown | Visual profile cross sections and independent finish swatches; placement and business libraries remain app-owned |
| Positioning resolution | Room → Positioning | Increment chooser and blur-only example rounding; alignment and modifier behavior remain in Cabinitron |
| Shared materials, face profile, overlay, grain | Styles / shared-style dialog | Named styles, usage counts, add/edit drafts, assignment scope; visual material/color/front-profile/overlay/grain previews; sheen, business palettes and deletion/reassignment need follow-up |
| Cabinet countertop groups | Selection → Countertop task | Enable, thickness, overhang and resolving an attention state; membership, material/grain, edge shapes, sinks and support validation need detailed follow-up |
| Advanced cabinet fronts and construction | Selection → Appearance/Construction or focused customization | Group boundaries represented; continuous fronts, corner interiors, hinges, scribes and detailed profile controls must be inventoried against their actual eligibility during adoption |
| Custom cabinet parts | Focused customization editor | Entry point and draft/save/cancel example; part geometry, joinery, curves, hardware, import/export remain in the dedicated app editor |

## Review scenarios

1. Start with Base cabinet: find size/position without opening a section. Open Appearance and Construction and confirm every property uses the same row layout.
2. Assign Painted white, then edit its shared style. Check the affected-object count. Cancel one edit and save another; inspect the same style through Styles.
3. Clear a numeric field or enter zero/partial text. Confirm no interference while focused, validation on blur, Escape reset and fractional input. Enter an offset such as 12.01 and leave the field to see the stored rounded value.
4. Choose Cabinet needing attention. Review the top warning and collapsed Countertop indicator; fix the overhang through its focused task.
5. Open cabinet customization, change a draft, then close it. Confirm the selected cabinet is unchanged. Repeat and Save.
6. Rename, duplicate and remove a synthetic object through its menu. Confirm removal requires a focused confirmation.
7. Inspect every selection fixture, then repeat representative ones in Read-only mode. Generated panels should lead to their owner.
8. In Room, enter outline mode and set one wall's thickness. Switch the review wall selection and verify that its override and the room default remain distinct.
9. Check narrow widths, theme/density, keyboard menus, focus return and independent body scrolling. Selection/context changes reset the body to its common controls; edits within a context retain the current body position.

After this structure is confirmed, review any missing reusable picker or editor behavior in the design system, then adopt the final composition in separate Cabinitron diffs. Keep the existing common-parameter review independent.

## Visual choices and advanced customization

The shared-style dialog uses visual material, color/finish, door/drawer profile, overlay and grain choices. Room Surfaces and Crown use texture/color samples and profile geometry. Cabinet Configuration and the focused task's Front layout use cabinet-front diagrams. Each choice remains in the shared ParameterRow layout.

**In Cabinitron, Customize cabinet must open the existing advanced cabinet customizer.** The catalog's small draft editor demonstrates context, save/cancel and focus return only. It must not replace or limit the existing parts, fronts, joinery, hardware or geometry workflow during adoption.

Texture samples reuse Cabinitron's CC0 sources, with provenance kept beside the catalog assets. Profile/configuration diagrams and recolored samples are illustrative; exact geometry, product identity, construction eligibility and material rendering must come from the app. The generic picker has no cabinet-specific schema or assets.

Review the material and front-profile grids in the style dialog, change a room surface and crown profile/finish, and choose a cabinet configuration. Cancel a shared-style draft and confirm no changes leak. Repeat with keyboard, narrow layout and read-only access.
