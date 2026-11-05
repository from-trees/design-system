# Coverage and implementation ledger

This is a standalone first implementation. “Implemented” means available for review, not yet approved or adopted in a production app.

| Workstream                                      | Status                     | Evidence / next work                                                                     |
| ----------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| React/StyleX package and declarations           | Implemented                | Native source, token exports, common compiler and tarball checks                                                    |
| Static interactive reference app                | Implemented                | Compiles native public package, hash-based navigation for Pages                         |
| Themes and density                              | Implemented                | Forest, slate, dark; compact/comfortable; overlay inheritance                            |
| Icons and buttons                               | Implemented                | Named icon controls, tooltip, busy/disabled examples                                     |
| Menu and action overflow                        | Implemented                | Primary+menu rule, keyboard and disabled tests                                           |
| Contextual info help                            | Implemented for catalog review | Standalone InfoTooltip; Parameters reference/help uses it; app adoption awaits confirmation |
| Fields, select, switch                          | Implemented                | Labels, descriptions and validation examples                                             |
| Dimension/position parameters                   | Implemented                | Order, fractions, bounds, commit/reset tests                                             |
| Panels and named sections                       | Implemented                | Progressive disclosure and modified/error indicators                                     |
| Dialogs and side panels                         | Implemented                | Focus containment/return tests and contextual examples                                   |
| Segmented mode choices                          | Implemented                | Radio semantics; not a replacement for navigation tabs                                   |
| Badges and inline feedback                      | Implemented                | Polite status and error announcements                                                    |
| Synthetic editing sidebar                       | Implemented                | Common dimensions plus appearance/construction                                           |
| Synthetic history/customer links                | Implemented                | Contextual drawer, local restore/link feedback; no backend                               |
| GitHub Pages publication                        | Infrastructure implemented | Verify workflow deployment and URL during bootstrap                                      |
| Package distribution                            | Infrastructure implemented | CI tarballs, initial prerelease tarball; registry release is explicit                    |
| Standard lists                                 | Implemented for catalog review | Fixed title/metadata rows, right-aligned status or menu; history demo uses the public List |
| Dedicated table primitives                     | Catalog review             | Search/filter, sortable typed columns, one Actions column, numbered paging, shimmer; app API adoption pending |
| Navigation Tabs                                 | Planned                    | Correct tab-panel semantics; separate from mode selection                                |
| Visual selectors and material previews          | Planned                    | Thumbnail choices, keyboard behavior and long lists                                      |
| Toolbar and overflow measurement                | Planned                    | ActionGroup handles explicit action lists today                                          |
| Dedicated progress/empty/loading patterns       | Planned                    | Initial feedback primitives only                                                         |
| Toasts and notification queue                   | Planned                    | Keep task feedback inline by default                                                     |
| Custom application themes                       | Planned                    | Public semantic-token customization contract; built-in themes today                      |
| Automated browser accessibility sweep           | Planned                    | Initial interaction tests plus manual browser QA; no blanket accessibility certification |
| Cabinitron screen inventory                     | Pending adoption           | Track all default and conditional controls with a destination                            |
| Cabinitron History & sharing migration          | Pending adoption           | First production integration target                                                      |
| Cabinitron parameter adapters/sidebar migration | Pending adoption           | Map every selection type and geometry meaning                                            |
| Other application adoption                      | Pending                    | Adopt deliberately, version by version                                                   |

Future components need a documented purpose, public API, working examples, applicable interaction states, tests, responsive review and migration guidance. Additions that change public behavior require a version change and release notes. Do not hide deferred work by removing it from this ledger.

## 0.2.0 architecture correction

The package is now native React/StyleX source for our common stack. Apps compile it alongside their own styles, share exported tokens and use a common Vite/Vitest helper. Precompiled CSS distribution, CSS imports and standalone Node SSR compatibility are intentionally removed. The catalog has no authored CSS files or global reset; its output stylesheet is compiler-generated.

## 0.3.0 standard list review

The canonical History & sharing row is now the public List component, rather than catalog-only markup. A dedicated Lists page covers long content, empty state and action availability. Cabinitron adoption is a separate step after user confirmation of this catalog implementation; this change does not modify Cabinitron.

## 0.4.0 generic parameters and contextual help review

Optional parameter references and input guidance move behind the standalone InfoTooltip. The catalog demonstrates it independently and inside a dialog. Validation remains visible and screen-reader descriptions retain explanatory text. This branch does not change or release Cabinitron; confirm catalog behavior before app adoption.

Parameters now consumes app-defined groups/fields and has no cabinet keys, fixed group names, canonical order or default units. The catalog app supplies its reusable CabinetParameters wrapper and a second unrelated schema. The former values-record API and ParameterKey/parameterOrder exports are removed; apps must adopt the new API only after catalog confirmation.

## 0.4.1 app-owned parameter rules review

Optional custom validation enables app-specific constraints without defining domain rules in the library. Controlled commits display the actual value even when an app snaps a draft back to the same value. The catalog owns the positive-size and whole-inch rounding examples. Cabinitron integration remains separate after confirmation; this change does not alter its editor.

Parameter validation and normalization are deferred until blur. Enter ends editing by blurring; focusing an invalid field clears its error for correction. Intermediate typing never changes the saved value.

### Parameter editor composition (0.5.0)

Shared ParameterRow now owns the layout for numeric and component editors. Panels & sections uses it for every Appearance and Construction choice; Parameters includes a mixed-editor example and custom control binding. Confirm this catalog behavior before adopting it in Cabinitron.

## 0.8.0 customer journey exploration

WorkflowProgress and the Customer estimates catalog pattern cover Review → Approve & sign → Deposit → Production queue → Final design confirmation → Production → Final Production Payment Due → Delivery. Customer UI adoption follows confirmation in a separate Cabinitron diff. Queue, final design confirmation, production, final-payment and delivery integrations remain future work; their visible steps must not invent confirmed shop status. The next cleanup priority is the customer estimate/approval/payment journey before the remaining admin surfaces. See [journey review and integration checklist](customer-estimate-journey.md).

## 0.9.0 admin table review

DataTable and the Tables catalog page establish a controlled query/page contract, strict pure query helpers, consistent cell formatting, keyboard navigation, shared action menus and row-shaped Shimmer loading. Search/filter/sort/pagination operate over the full server-owned collection. See [admin table API and migration inventory](admin-tables.md). Confirm the catalog before Cabinitron endpoint/component adoption; no production APIs are migrated by this change. Bulk selection and richer data-grid features remain deferred.
