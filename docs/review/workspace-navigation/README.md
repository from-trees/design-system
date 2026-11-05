# Workspace navigation review

The exploration groups Cabinitron's existing destinations under Work, Customers, Libraries and Settings. It also reflects customer-directory functionality from approved Cabinitron main `5b45b169d5b281e9d92fc0baf0a4b8057376600a` without importing application code or real customer data.

## Behavior to review

- Desktop: grouped links, recognizable icons, one current page, breadcrumbs, independently scrolling navigation and content. The active link stays visible when deep-linking into a lower group.
- Narrow container: a named navigation drawer with keyboard dismissal and focus restoration. Selection closes the drawer and navigates; modified clicks preserve native browser behavior.
- Open a group root or any leaf URL. Group roots show the first page in that group. Website setup and Brand & embed share Website & branding; customer invoices and Cabinitron subscription billing remain separate.
- Open an estimate, select Activity and revision 2, copy its URL, refresh, then use Back and Forward. Each view comes from the URL. Closing returns to the list without losing its query or page.
- Search/filter/sort/page-size/pagination are namespaced in the URL. Different pages retain their own table criteria. Unsupported criteria show a visible warning.
- Customers contains the actual directory structure, not separate duplicate contact records. Open a profile's Contacts or Addresses, open a specific child and refresh. Child IDs are resolved under their owning customer and business. Unknown or mismatched IDs show an unavailable state.
- Archive visibility and secondary-contact search survive refresh. Customer related work includes saved estimates, approvals and invoices, plus projects and inquiries. Saved document links carry the exact revision. Directory edits must never rewrite historical document identity.
- Catalog settings and customer contents are read-only navigation fixtures. There is no backend, customer editing, legal consent, document preparation, email, payment or external CRM integration in this exploration.

## Route contract for app adoption

Equivalent production paths will be server-resolved and business-scoped. Examples:

```
/t/:business/app/work
/t/:business/app/work/estimates
/t/:business/app/work/estimates/:estimateId?detail=activity&revision=2
/t/:business/app/customers/directory/:customerId?detail=contacts
/t/:business/app/customers/directory/:customerId/contacts/:contactId
/t/:business/app/customers/directory/:customerId/addresses/:addressId
/t/:business/app/settings/website
```

The static catalog puts these after `#workspace-navigation`, not into the server pathname. URLs contain identities and view state, not contact details, internal notes or draft payloads. The shared components neither require hash routing nor supply a router.

The separate app adoption must preserve current links (`section=Customers`, selected customer/document identifiers and business selection), handle business slug changes deliberately, enforce roles/server authorization, validate every record's business/parent identity, and restore unavailable/revoked states safely. It must connect existing customer editing, contact/address version checks, archive restrictions, customer picker and prepare-new-work callbacks rather than reimplement them. Unsaved edits still require the app's existing discard guards on navigation, Back/Forward and dismissal. None of these production guarantees should be inferred from synthetic catalog tests.

## Validation and screenshots

Automated coverage exercises native links, keyboard navigation, drawer dismissal/focus, breadcrumb semantics, all group/leaf routes, reload restoration, Back/Forward, list state, unavailable business/record/child links, customer archive visibility, secondary-contact search, and exact document revisions. Browser checks exercise the actual catalog and real reloads at desktop and narrow widths. Screenshots in this directory show synthetic records only.
