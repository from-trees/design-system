# Application adoption checklist

Shared UI changes are explored and confirmed here before app implementation begins. Keep design-system development and app adoption as separate stages and reviews.

- [ ] Implement the shared change and its applicable states in the design-system catalog.
- [ ] Obtain the user's confirmation of the behavior before starting app adoption. Tests passing does not replace that confirmation.
- [ ] Reference the confirmed design-system change in the separate app review.

For existing confirmed components, begin with the package choice below. If app integration reveals a needed reusable change, return to catalog review first.

- [ ] Choose a tested, versioned package artifact or registry release.
- [ ] Install our React/StyleX peers and configure `fromTreesStylex` in Vite/Vitest. Do not import a library CSS file.
- [ ] Audit global button/input/select rules and remaining legacy selector interference before migration.
- [ ] Choose theme and density at an app boundary.
- [ ] Map actions and icon names to consistent terminology.
- [ ] Replace action groups with ActionGroup/MenuButton.
- [ ] Move contextual tasks into shared overlays; retain the selected object and scroll position.
- [ ] Supply permissions, request lifecycle and unsaved-change handling.
- [ ] Map every parameter to the correct units, origin, direction and storage meaning.
- [ ] Preserve geometry and save/undo semantics; key drafts by selected identity.
- [ ] Classify controls by frequency, with visible core controls and named uncommon groups.
- [ ] Verify desktop, narrow screens, keyboard focus and applicable read-only states.
- [ ] Test against actual application styles and data; catalog approval is not integration verification.
- [ ] Capture before/after evidence and submit the application change through its owning review workflow.

For Cabinitron, business boundaries, saved revisions, authenticated fabrication exports and owner/admin-only internal economics remain application responsibilities. From Trees storefront adoption is independent of Cabinitron.
