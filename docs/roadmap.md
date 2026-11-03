# Coverage and implementation ledger

This is a standalone first implementation. “Implemented” means available for review, not yet approved or adopted in a production app.

| Workstream                                      | Status                     | Evidence / next work                                                                     |
| ----------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| React/StyleX package and declarations           | Implemented                | Native source, token exports, common compiler and tarball checks                                                    |
| Static interactive reference app                | Implemented                | Compiles native public package, hash-based navigation for Pages                         |
| Themes and density                              | Implemented                | Forest, slate, dark; compact/comfortable; overlay inheritance                            |
| Icons and buttons                               | Implemented                | Named icon controls, tooltip, busy/disabled examples                                     |
| Menu and action overflow                        | Implemented                | Primary+menu rule, keyboard and disabled tests                                           |
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
| Dedicated table/list primitives                 | Planned                    | Responsive columns, selection, row action integration                                    |
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
