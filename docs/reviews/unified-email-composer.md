# Shared document email composer

This change supplies one native SendEmailDialog and an interactive catalog for estimates, design approvals and invoices. The catalog simulates delivery only. Cabinitron adoption is a separate change after the user confirms the catalog behavior.

## Confirmable behavior

- To and reply-to are supplied by the app and remain fixed.
- Cc starts with app-supplied defaults. Users can add several addresses separated by commas or semicolons, remove any recipient, or send without Cc. Enter or leaving the field commits addresses; validation waits until blur or submission. Duplicate addresses and addresses already in To are removed case-insensitively.
- Subject and introductory message are editable. Apps provide frozen document summaries and notices independently; changing the introduction never changes a signed design, terms, invoice PDF or saved estimate.
- One pending send disables editing and dismissal, and overlapping clicks invoke the callback once. A failed callback preserves the draft and presents a retry without exposing provider details. A successful callback closes the dialog.
- The app can block sending until its domain checks/duplicate-send acknowledgment are satisfied. The component performs no network requests and never owns tokens, business authorization, provider credentials, queue records or retry identity.

## Cabinitron adoption plan, after behavior confirmation

1. Consume a separately versioned UI package and replace all four entry points: proposal delivery, design approval send, invoice workflow send and invoice administration send. Preserve the fixed primary customer and the existing reply-to default for each document; let users remove the default Cc copy.
2. Standardize preparation and submission DTOs around the business/document ID and saved revision, To, Cc, reply-to, subject, introduction, summary, readiness and delivery status. Recipient defaults are resolved on the server. Distinguish an omitted Cc value (existing default) from an explicit empty list (no copies).
3. Introduce one business-scoped document-delivery service for recipient validation, canonical envelope creation, encrypted queued payloads, request fingerprints, provider dispatch, retry recovery and normalized history. Use document adapters for domain checks and message rendering. Retain existing tables behind adapters during migration, so queued messages, provider idempotency keys and original bytes are unchanged.
4. Include normalized Cc recipients in the immutable send fingerprint. Repeating an identical request returns the same delivery. Editing recipients or message after an uncertain attempt requires a new explicit send request; retries resend identical payloads.
5. Preserve estimates' richer resend/uncertainty controls, provider webhook statuses, revocable links and public-price summaries. Preserve invoice issue-before-send, frozen PDF/payment links and the distinction between sending and charging. Preserve design manifests, current-revision/link checks, signed receipts and customer-only verification codes. Adding Cc must not expand approval/signing authority or copy verification codes to additional recipients.
6. Record actual per-delivery recipients and timestamps in the existing activity history. Keep automatic verification, receipt and system-notification recipient policies explicit; editing a manual invitation does not silently broaden them.

Attachment selection is intentionally deferred to a later change. The component's summary/notice slots allow future document-specific controls without duplicating the composer; this review introduces no attachment selection behavior.

## Adoption package

The confirmed composer is packaged as `0.16.0-cc.1`. It retains the exact-entry Slider and Parameter controls already present in Cabinitron’s vendored `0.15.0` package, so adopting the composer does not remove those controls. The package remains source-only and is built from this reviewed branch; no registry publication or catalog deployment is performed.
