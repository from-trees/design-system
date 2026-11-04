# Customer estimate journey · 0.8.0

Review **Patterns → Customer estimates** (`#customer-journey`) before a separate application integration. The path is **Review → Approve & sign → Deposit → Production queue → Final design confirmation → Production → Final Production Payment Due → Delivery**. The last five stages are visible even though shop integrations are not built.

## Shared component

`WorkflowProgress` receives `label`, app-defined `steps`, `selectedId`, and `onSelect`. Each step supplies a stable `id`, concise `label`, `status` (`complete`, `current`, `upcoming`, `attention`), `detail`, and `available`. Selecting a step only navigates; it never changes completion. The selected view and next due step are distinct. Status is conveyed with text and icons, not color alone. The current task uses `aria-current="step"`; unavailable steps are descriptive and not keyboard actions. Steps form one horizontal sequence of numbered circles joined by a dotted line, with completed steps shown as filled checkmarks and labels underneath. On narrow screens all markers remain visible, with the viewed step label below the line instead of eight crowded text columns.

The shared package contains no estimate, signing, payment, queue or delivery schema. The catalog supplies those meanings and a synthetic local state machine.

## Customer-facing organization

Keep business identity, estimate/revision identity, total and progress at the top. Present one focused stage beneath it with a short next action and a Back route. Full estimate, design package, terms and signed agreement open in a focused document viewer, preserving the current stage. Actual adoption must retain the full saved documents and download links; catalog text is illustrative.

Review completion is only acknowledgment of review/navigation for a particular immutable estimate revision. It is not a signed approval. Approve & sign must retain the app's separate affirmative design approval, business terms acceptance, electronic-signature consent, email verification and final confirmation. The catalog's explicitly simulated signature demonstrates stage placement only.

Deposit checkout must retain both card and ACH and the provider-hosted payment flow. Checkout opened, checkout returned, a refresh click and an ACH processing response are not payment completion. Payment status must come from the server. Processing blocks repeat payment; failed payments offer an eligible retry; refunds, disputes and unresolved states require an app-derived attention state. A paid deposit leaves the project balance outstanding.

## Future shop stages

Production queue becomes the next stage after approval and any required deposit, but displays **Awaiting shop confirmation**. This does not assert a queue position, a scheduled date or production readiness. Final design confirmation, Production, Final Production Payment Due and Delivery remain upcoming, with explanatory content and a contact route. The UI must not fabricate dates, mark these stages complete, or imply live tracking. Later integrations can supply authoritative queue/production/delivery events to the same generic progress component.

Final design confirmation is a separate review of final drawings, dimensions, materials and details before fabrication begins. It must not be inferred from initial estimate approval or deposit payment. Its future integration must bind confirmation to the exact final design revision.

Final Production Payment Due sits after Production and before Delivery. It remains upcoming until an actual app-owned final payment request exists. Do not infer an amount due, completed payment or delivery clearance from the deposit or production status. Its future integration must use the confirmed remaining balance and server-owned payment eligibility; this example offers no final-payment checkout.

## Scenarios and integration checklist

- Review, prepared agreement, signed/deposit due, open checkout, processing, paid, failed, unresolved payment, no deposit required, expired and superseded versions.
- Approval-only links omit deposit navigation according to existing feature availability; this must not imply that a financial deposit is waived. Full payment-enabled journeys display all eight stages.
- Expired/superseded versions retain document access and disable new signing/payment. Preserve archive/signed-document behavior and application feature gates.
- Scope navigation state to business, estimate identity and revision. A new revision must not inherit review acknowledgment or signature completion from another version.
- Preserve backend eligibility, immutable totals/terms/design snapshots, access controls and internal-cost privacy. No navigation change should mutate a design or create revisions.
- Keep progress and the next action usable on narrow screens. Test document focus return, keyboard navigation, busy/error/retry states and returned-checkout routing.
- Audit the business-side estimate preparation, sending, approval status and deposit status next, after confirming this customer flow. Replace distant page updates with focused tasks rather than another long admin screen.

No application integration, approval, signature, payment, production release or new shop integration occurs in this change. Review and confirm the catalog behavior before adopting it in Cabinitron.
