# Customer estimate sections and choices

Catalog behavior confirmed by the user on November 7, 2026; Cabinitron adoption remains a separate review. Open `#estimate-options` in the catalog or `?example=estimate-options#estimate-options` for the full-size example. All amounts and design previews use synthetic fixtures. Cabinet rows include drawers and hardware; internal hardware components are not separate customer charges. The application must render actual estimate lines without inventing component-level line items.

The customer sees each alternative as a table with its title, description, design link and selection control in the header. Item, quantity, unit price and amount stay aligned. The footer shows the section subtotal, tax and total. A selected option has a checked radio, a “Selected” label and an accent border; unselected alternatives are identified as excluded. The radio group uses native keyboard navigation. Read-only mode replaces controls with selected/excluded labels; disabled mode prevents selection while saving.

The initial heading shows the lowest to highest valid total, including shared services and sales tax. Choosing options narrows the range. An exact total and deposit appear only after all required choices are complete. The example requires saving a complete selection before continuing and blocks continuation again when a saved choice changes. Viewing a design never selects or approves it. The itemized document contains selected sections and shared services only.

## Shared components

`DocumentSection` owns the table markup, section header, numeric alignment, footer, selected treatment and optional native radio. Supply `title`, optional `description` / `actions`, `columns`, `rows` (cells matching columns, in order), and `totals`. Use at least two columns. Numeric columns opt into end alignment and tabular numerals. Each total supplies a label, formatted value and optional emphasis. Use `note` for qualifications such as excluded alternatives. Values and monetary formatting belong to the consumer.

`selection` supplies a radio `name`, `value`, `selected` state, optional `disabled` and `onSelect`. Omit `onSelect` to render read-only status. Keep a distinct radio group name for each choice and each mounted document. Links in `actions` remain separate from the radio label.

`DocumentChoiceGroup` provides a fieldset, legend, description and consistent section spacing. The app supplies the choices and decides which groups are active.

## Application adoption

Cabinitron adoption is a separate versioned package change and review. This PR does not alter customer estimates, invoices, issued snapshots, signatures, PDFs or production data.

The app must derive range endpoints from valid combinations of its full offer, using the same rounded line discounts and taxes as the exact estimate. Include shared lines once, choose exactly one option per active required choice, and account for design-dependent item alternatives only under their matching parent. Do not sum all designs or independently minimize children across mutually exclusive parents. The catalog fixture has independent choices and deliberately keeps its example arithmetic outside the shared components; it is not a production range calculator or a pricing default.

For adoption, move the journey's top-level single-design link into matching section headers, preserve all four design links, use the same section tables in the journey and customer document, and carry consistent selected sections and totals into invoice/PDF rendering as appropriate. Preserve the existing server validation, saved revision identity and explicit save/approval boundaries. Retain dependencies, disabled and read-only states, attachments and a fallback for legacy single-design estimates.

## Verification

Lint, catalog/package builds, type checking and all 137 tests passed. The five new interaction tests cover all eight fixture combinations, initial/narrowed ranges, tax and shared services, per-section design actions, native keyboard selection, disabled/read-only modes, explicit save gating, changed selections, zero-price installation and selected-only document content. Source-package verification passed using a task-local npm cache.

Browser inspection at 1440px and 390px confirmed aligned columns and no horizontal page or table overflow at 390px. Images in `evidence/estimate-options/` show the initial range, complete comparison, selected summary and mobile tables. The catalog's existing missing favicon and bundle-size warning are unrelated to this change.
