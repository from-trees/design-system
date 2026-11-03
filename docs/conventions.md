# Component conventions

## Responsibilities

Shared components own semantics, styling and reusable interaction behavior. Applications own data fetching, geometry, business identity, permissions, save/undo boundaries, persistence, unsaved-change policy and navigation. The reference site uses synthetic data only.

Use StyleX for component styling. Compile package and app sources together with the shared Vite helper and one app prefix. Do not author CSS files or global resets; apply explicit StyleX classes to elements. Use semantic tokens from `tokens.stylex.ts`; add theme values centrally. Do not add arbitrary application-specific overrides to shared primitives. Theme and density changes must also reach portaled menus, tooltips and overlays.

## Spacing and layout

Use the native utility objects from `@from-trees/ui/utilities` for common spacing and layout in components and apps. Compose `layout.stack`/`layout.row` with `gap`, `padding` and logical block/inline variants through `stylex.props`; avoid duplicating these definitions locally. Prefer container gaps to child margins. Use the shared 0/4/8/12/16/24/32 scale; keep domain measurements and responsive behavior in local StyleX. Utilities share `space` tokens and do not change with control density. Place intentional local overrides last.

## Actions and choices

An action group may show at most two adjacent buttons. Use `ActionGroup` for dynamic collections so three or more actions collapse automatically. `primaryId` retains one primary action plus a menu. A group of three or more icon buttons is still an action group and must collapse. Tabs, switches and segmented choices are selection controls, not action groups.

Use icon-only controls for recognizable actions; supply a short, specific accessible label. Use short icon+text buttons when interpretation requires context. Menu items always have visible labels. Disabled actions may remain visible when their availability is useful; do not expose privileged data through those labels.

## Optional explanations

Use InfoTooltip for optional elaboration beside a concise label. Keep it available through hover, keyboard focus and click/tap; do not depend on hover alone. Parameters use the same component for reference/help text instead of always-visible prose. Essential labels, units and actionable validation errors remain visible. Tooltip content is non-interactive; use a dialog for links or actions. Confirm behavior in the catalog before app adoption.

## Parameters

Applications own their parameter schema through a specific reusable wrapper. Define available parameters, labels, groups, order, icons, units and bounds there; the generic Parameters component renders the supplied arrays without inferring a cabinet schema. Reuse the app wrapper wherever those controls are needed. The catalog's CabinetParameters demonstrates this separation. Geometry origins remain explicit application meaning: never reinterpret elevation-to-center as height-to-bottom.

`Parameters` works in the supplied unit; it does not convert units or round geometry. Inputs accept decimal and fractional text. Focus loss commits a valid finite value within bounds. Enter blurs the field; Escape cancels an unfinished edit. Allow partial and temporary invalid drafts without validation or snapping during editing. A changed external value resets the draft. Remount with `key={selectedObject.id}` when selection changes. A parent decides how to handle leaving a selection with an invalid draft.

## Lists

Use the shared `List` for the standard title/metadata/action pattern. Apps supply items and callbacks, not row markup or alternate spacing. Keep metadata concise; status replaces the action menu for a current/informational row. Do not add separators, tall cards, stacked date/actor lines or visible per-row action buttons. Explore any needed list variant in the catalog and obtain confirmation before using it in an app.

## Surfaces

Use Panel for persistent grouping, Section for progressive disclosure, SidePanel for contextual work, and Dialog for focused tasks. Keep core dimensions visible. Group uncommon controls by their subject; show Modified or Needs attention on collapsed sections.

Overlays provide modal focus containment, restoration and scroll locking through React Aria. The app must guard unsaved edits and cancellation before setting `open=false`. Default outside-click/Escape dismissal is appropriate for inspection, not automatically for every editing workflow. Set `dismissible=false` and provide explicit controls for guarded tasks. Avoid accidental overlay stacking.

## Review

Shared UI work follows two separate stages. First implement or revise components, tokens, utilities and reusable interaction behavior in this repository, with catalog examples that support exploration and review. Present the relevant states and obtain the user's confirmation of the behavior before implementing adoption in an application. A request to create or explore a shared component is not permission to begin app adoption.

After confirmation, adopt a versioned package in a separate application change and review. Link the confirmed design-system change, keep application data/permissions/persistence in the app, and verify the real integration. Do not develop the library change and its app adoption in parallel, bundle them into one implementation step, or treat passing tests as user confirmation. Existing confirmed components may be adopted directly; reusable changes discovered during integration return to the design-system stage first.


Before adoption, show default, keyboard focus, disabled, read-only, loading, error, empty, long-content and narrow-screen states that apply. Test meaningful behavior, not styling implementation. Include screenshots and video when needed, update the reference examples, and document limitations. Keep the same native public components in the catalog and consuming apps.

- Use `ParameterRow` (directly or through `Parameters`) for property editors such as the Appearance and Construction examples. Use component children or schema control slots for select, switch and custom editors in those groups. Keep the shared row grid, label, help and error placement; apps supply the editor and its behavior. Standalone inputs remain appropriate for forms, search and other interactions that are not parameter editing.
