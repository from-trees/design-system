# Full-screen approval workflow catalog review

Open the catalog's Overlays page, or `/?example=approval-workflow`, and choose **Create new approval**.

The new `Dialog size="fullscreen"` uses the existing accessible overlay: it fills the viewport, keeps the header and content-sized footer actions visible, scrolls its body, traps focus, supports Escape and returns focus to the opener. The default dialog and side panel keep their existing dimensions. `WorkflowProgress` retains its existing app-owned eligibility rules.

The catalog example demonstrates the requested order:

1. **Start approval** — name the approval and choose or create one customer. Save and continue requires both fields and creates a resumable example draft.
2. **Connect designs** — optionally add multiple Cabinitron designs, upload other design documents, or use both. Going back retains the selections and uploaded-document names.
3. **Generate customer packages** — generate each connected design's package. Later steps remain unavailable until every required package is ready. If no Cabinitron designs are connected, skip this step in both directions and use the uploaded design PDF.
4. **Finalize approval request** — review the name, recipient, selected designs, packages and instructions. Saving makes the example ready to send and locks its earlier fields.
5. **Send to customer** — review the recipient and attachments, then confirm the simulated send.

Completed, eligible steps can be revisited from the progress control or Back. Unavailable later steps are visibly disabled and cannot be selected by keyboard or pointer. Closing after step one preserves the title, customer, selections, packages and current step; Resume restores them. Step changes focus the content heading. Creating a new example does not overwrite the existing resumable example until step one is completed.

This is a catalog prototype using synthetic records, browser-local draft storage and simulated package generation/delivery. Cabinitron must own authenticated server-side drafts, record creation, revision/package locking, immutable approval requests and email delivery in a separate application review after the catalog behavior is confirmed. No production data, PDFs or emails are created here. The example supports both native-design and uploaded-only paths; uploads retain names and metadata in the example, not document bytes.

## Captured interface

![Start approval](review/approval-workflow/start.png)
![Connect multiple designs](review/approval-workflow/designs.png)
![Required packages](review/approval-workflow/packages.png)
![Finalize approval](review/approval-workflow/review.png)
![Send to customer](review/approval-workflow/send.png)
![Uploaded-only approval, with package generation skipped](review/approval-workflow/uploaded-only.png)
![Narrow layout](review/approval-workflow/narrow.png)

## Validation

Lint, type checking, library/catalog builds, package-content verification and component/catalog tests. The workflow test covers required fields, draft resumption, backward navigation, package gating and explicit send confirmation. Overlay focus/dismissal tests now cover full-screen dialogs alongside default dialogs and side panels.

Browser verification used synthetic data only, with 1280-pixel desktop and 390-pixel narrow viewports. The desktop dialog bounds matched the viewport and neither layout had horizontal overflow. Verified closing/resuming selected designs, disabled incomplete steps, package completion and final review before sending. Screenshots above show the actual catalog components.

## Follow-on exploration: estimates and invoices

Approval is the first workflow to complete. Estimate and invoice adoption follows it in separate application reviews. The reusable boundary is the full-screen task surface, persistent navigation/footer, eligible progress steps, draft resumption and local errors. Business meaning, validations and persistence stay with each app.

| Pattern | Approvals | Estimates — exploration | Invoices — exploration |
| --- | --- | --- | --- |
| Start | Name and customer; save resumable draft | Name and customer; save resumable draft | Customer and source estimate/order, or standalone invoice; save draft |
| Connect | Multiple saved designs | Designs, scope and optional alternatives | Approved source scope or standalone billable lines |
| Prepare | Required customer design packages | Customer packages, selling prices, choices, discounts and taxes | Amounts, taxes, due date and payment instructions |
| Finalize | Review then freeze design/package snapshots | Review then issue an immutable estimate revision | Review then issue an immutable invoice revision |
| Deliver | Explicit send to selected customer | Explicit send; customer options/approval remain a separate customer journey | Explicit send; payment and receipt remain separate customer actions |

The same progress component can present these flows with app-supplied labels and completion rules. Selecting a step is navigation, never proof that work is complete. Earlier editable steps retain their values. Invalidating an earlier requirement locks downstream steps again. Issued documents remain readable; changing their content uses the existing revision/correction rules rather than editing a frozen document in place. Closing after the initial save must preserve an authenticated server-side draft when adopted by Cabinitron; browser-local persistence in this catalog is only a demonstration.

Open questions for the later catalog passes: which existing estimate/order data can prefill invoices, which preparation steps apply to standalone documents, where an estimate's optional design packages belong, and how the send step presents a previously issued document. These are exploration notes, not approved application behavior.
