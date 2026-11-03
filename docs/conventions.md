# Component conventions

## Responsibilities

Shared components own semantics, styling and reusable interaction behavior. Applications own data fetching, geometry, business identity, permissions, save/undo boundaries, persistence, unsaved-change policy and navigation. The reference site uses synthetic data only.

Use StyleX for component styling. Keep the package’s ftui class-name prefix stable and distinct from consuming-app builds; independently compiled StyleX rule priorities must not collide. Keep resets in the catalog, not the package. Use semantic tokens from `tokens.stylex.ts`; add theme values centrally. Do not add arbitrary application-specific overrides to shared primitives. Theme and density changes must also reach portaled menus, tooltips and overlays.

## Actions and choices

An action group may show at most two adjacent buttons. Use `ActionGroup` for dynamic collections so three or more actions collapse automatically. `primaryId` retains one primary action plus a menu. A group of three or more icon buttons is still an action group and must collapse. Tabs, switches and segmented choices are selection controls, not action groups.

Use icon-only controls for recognizable actions; supply a short, specific accessible label. Use short icon+text buttons when interpretation requires context. Menu items always have visible labels. Disabled actions may remain visible when their availability is useful; do not expose privileged data through those labels.

## Parameters

Stable presentation: Width → Height → Depth; Offset → Height from floor → Setback; Rotation. Omit irrelevant parameters without reordering. Label origins explicitly when needed. Always map a stored value's real meaning: never reinterpret an elevation-to-center as height-to-bottom.

`Parameters` works in the supplied unit; it does not convert units or round geometry. Inputs accept decimal and fractional text. Blur/Enter commits a valid finite value within bounds; Escape cancels an unfinished edit. A changed external value resets the draft. Remount with `key={selectedObject.id}` when selection changes. A parent decides how to handle leaving a selection with an invalid draft.

## Surfaces

Use Panel for persistent grouping, Section for progressive disclosure, SidePanel for contextual work, and Dialog for focused tasks. Keep core dimensions visible. Group uncommon controls by their subject; show Modified or Needs attention on collapsed sections.

Overlays provide modal focus containment, restoration and scroll locking through React Aria. The app must guard unsaved edits and cancellation before setting `open=false`. Default outside-click/Escape dismissal is appropriate for inspection, not automatically for every editing workflow. Set `dismissible=false` and provide explicit controls for guarded tasks. Avoid accidental overlay stacking.

## Review

Before adoption, show default, keyboard focus, disabled, read-only, loading, error, empty, long-content and narrow-screen states that apply. Test meaningful behavior, not styling implementation. Include screenshots and video when needed, update the reference examples, and document limitations. Keep the same compiled public components in the catalog and consuming apps.
