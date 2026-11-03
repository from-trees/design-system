# Public component API, v0.2.0

Import components from `@from-trees/ui`, tokens from `@from-trees/ui/tokens.stylex`, and common compiler setup from `@from-trees/ui/vite`. The consuming app compiles StyleX; there is no CSS entry point.

| Export           | Main props                                                            | Notes                                                                                |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| ThemeProvider    | theme, density, children                                              | forest/slate/dark; comfortable/compact; portaled descendants inherit theme           |
| Icon             | name, size                                                            | Curated Lucide vocabulary, decorative by default; label the enclosing control        |
| Button           | icon, variant, busy, isDisabled, onPress, children                    | primary/secondary/ghost/danger; React Aria button props, not native onClick-only API |
| IconButton       | label, icon, variant, busy, isDisabled, onPress                       | Accessible name and focus/hover tooltip                                              |
| MenuButton       | label, actions                                                        | Ellipsis trigger; React Aria menu, positioning and keyboard behavior                 |
| ActionGroup      | actions, primaryId, label                                             | 1–2 actions inline; 3+ collapse to a menu with optional primary                      |
| TextInput        | label, help, error, native input props                                | Label/description/error associations; controlled or uncontrolled                     |
| Select           | label, help, error, native select props, children                     | Native platform selection behavior                                                   |
| Switch           | label, selected, onChange, disabled                                   | Controlled binary choice                                                             |
| Parameters       | values, unit                                                          | Stable parameter order; see below                                                    |
| Panel            | title, actions, children                                              | Persistent surface with header and body                                              |
| Section          | title, collapsible, defaultOpen, modified, hasError, children         | Named grouping; optional initial expansion and status hints                          |
| Dialog           | title, description, open, onOpenChange, children, footer, dismissible | Focused modal task                                                                   |
| SidePanel        | same as Dialog                                                        | Contextual modal drawer; full width on narrow viewports                              |
| SegmentedControl | label, value, onChange, options                                       | Radio-group semantics for mutually exclusive modes                                   |
| Badge            | tone, children                                                        | neutral/success/warning/danger, non-announcing label                                 |
| Status           | tone, children                                                        | Error alert or polite status announcement                                            |
| parseMeasurement | raw string                                                            | Finite decimal/fraction parser; number or null                                       |
| parameterOrder   | readonly array                                                        | Canonical parameter order                                                            |

## Actions

`Action = {id, label, icon?, onAction, disabled?, destructive?, separatorBefore?}`. Identifiers must be unique. Synchronous callbacks may start asynchronous application tasks; the application supplies disabled/pending state and local feedback. No persistence is performed by menus.

## Parameters

`values` is a partial record keyed by `width`, `height`, `depth`, `offset`, `heightFromFloor`, `setback`, `rotation`.

Each entry accepts `{value, onChange, label?, reference?, min?, max?, readOnly?, disabled?, unit?}`. Units default to `in` for lengths and `°` for rotation. Display labels may clarify reference origins without changing the canonical ordering. Values must be finite numbers. Bounds are inclusive. No automatic unit conversion, geometry normalization, or precision rounding is applied.

## Segmented choices

`options = [{value, label, icon?, disabled?}]`. Choices retain visible labels. Keyboard arrow navigation comes from radio-group semantics. Use dedicated navigation tabs rather than this control when switching distinct page panels; a dedicated shared Tabs component is tracked separately.

## Composition

Examples in the catalog demonstrate public APIs. Synthetic History & sharing is a catalog pattern, not a package export; production history, restore and links must be supplied by the application. The restore confirmation deliberately replaces the drawer while active and returns to it after completion, rather than stacking overlays.
