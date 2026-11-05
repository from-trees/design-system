# Standard admin tables — catalog review, v0.9.0

## Review boundary

DataTable is a package component; the Tables page is its live, synthetic example. Confirm search/filter/sort, keyboard navigation, action menus, pagination, density, loading and detail-panel behavior here before adopting it in Cabinitron. No Cabinitron component or endpoint is changed by this PR.

The shared table owns its markup, spacing, alignment, formatting, keyboard interaction, loading/error/empty presentation and exactly one trailing action column. Apps supply typed columns, rows, identifiers and callbacks, not arbitrary cells, extra action buttons, CSS or render-row functions. The action column stays visible while a narrow table scrolls horizontally. Headers stay visible within a bounded table body. Column data is never hidden on mobile.

Search is an explicit submit: Enter or the search icon applies it. Filters and sortable column headers apply immediately. Search, filter, sort and page-size changes reset to page 1 atomically. Rows-per-page choices are 10, 25, 50 and 100; the default transport page size is 25. First/Previous, numbered pages, Next/Last use the exact filtered total. The component never sorts or filters a received page.

Keyboard behavior uses React Aria Table: Tab enters, arrow keys navigate, Home/End move within a row and Enter invokes the app's Open action. The shared menu in the single Actions column also exposes Open and secondary commands. Opening a row may navigate or open an app-owned contextual panel. It must not mutate a record. The example demonstrates the latter and focus return when closed. Bulk selection is deferred, not implied by row focus.

Typed columns format text (optional metadata), numbers, money, dates and status badges. Numeric values align right with tabular figures. Money is an integer in the currency's minor units; currency and locale are app-supplied (locale defaults to en-US). Null/invalid numbers are an em dash, not zero. Date-only values preserve their calendar day in every timezone; timestamps display a date in the supplied timezone (browser timezone by default), with the exact instant available in the time element/title. Use app-owned localized labels and status meanings. Titles/metadata truncate with full native title text.

Every fetch shows shared Shimmer placeholders in the actual row/column structure, including the action slot. The owning region announces loading and is busy. Reduced motion follows the existing Shimmer behavior. Old rows/actions disappear while a different query is loading. A mismatched response query is not rendered even if a caller prematurely clears its loading flag. Failure, empty collection, no matches and an out-of-range page each have their own message and recovery. Criteria remain usable during loading/error; pagination is disabled until a matching successful result is available. Existing pagination bounds remain stable while requesting another page of the same result set.

## Shared API contract

Pure transport types/helpers are available from `@from-trees/ui/table-query`, without importing React/StyleX components into a Worker. They are also re-exported from the React entry point.

```ts
import {parseTableQuery, tableQueryKey,
  type TableQuery, type TablePage, type TableQuerySchema
} from '@from-trees/ui/table-query';

const invoiceSchema: TableQuerySchema = {
  sortKeys: ['number', 'customer', 'amount', 'status', 'due'],
  filters: {status: ['draft', 'issued', 'paid']},
  defaultSort: {key: 'number', direction: 'descending'},
};

// GET /t/:business/api/invoices?
// q=oak&filter.status=issued&sort=amount&direction=descending&page=2&pageSize=25
const query = parseTableQuery(new URL(request.url).searchParams, invoiceSchema);
// The app authorizes the business, constructs allowlisted/bound SQL and fetches rows.
const result: TablePage<InvoiceSummary> = {items, total, query};
// The client sends the same canonical shape:
const requestUrl = endpoint + '?' + tableQueryKey(query);
```

`TableQuery` contains `search`, `filters`, `sort`, `page` and `pageSize`. `sort` is `{key, direction: 'ascending' | 'descending'}` or null for an intentionally unsorted schema. Filters are single-value exact-match fields; the empty value means All and is omitted from canonical requests. `q` trims leading/trailing whitespace and permits up to 200 characters. Pagination uses positive safe integers and a page size from the shared choices. Unknown parameters, repeated parameters, unknown sort/filter keys, invalid filter values and ambiguous/missing sort direction are rejected. The app maps parse failures to a safe 400 response. An app with additional non-table parameters must extract its documented table parameters before parsing rather than silently accepting typos.

`TablePage<T>` contains `items`, exact `total` for the complete matching collection, and `query`, the normalized query that produced that page. Even an empty result echoes the query and returns total 0. Pages beyond the last return items [] and the real total, with explicit UI recovery; never silently return another page under the requested page number.

### Endpoint requirements for adoption

1. Authenticate and resolve business/role on the server before querying. Query parameters never authorize another business or expose owner-only fields.
2. Apply the tenant/visibility predicate first, then search and filters, then ordering with a deterministic unique-ID tiebreaker, then OFFSET/LIMIT. Bind all values. Map sort keys to literal SQL expressions and directions to two fixed tokens; validation is not permission to interpolate an arbitrary string into SQL.
3. Define the searched fields and case behavior per resource. For substring LIKE search, escape `%`, `_` and the escape character; search text must not silently become wildcard syntax. Numeric/date/status filtering must operate on stored values, not formatted text or derived labels.
4. Count with exactly the same tenant, search and filter predicates as the items query. Use a consistent read/snapshot where supported. Do not count records the caller cannot see. Fetch expensive payment/provider details only for the selected page, not for every matching invoice.
5. Use the same deterministic sort in both directions and retain null-order policy. Stable sorting prevents equal-key rows from arbitrarily crossing page boundaries, but offset pages are not an immutable snapshot: concurrent inserts/deletes can shift them. Refresh after mutations; offer first-page recovery when the selected page empties.
6. Abort superseded requests and check a request generation/query key before accepting a response or error. Clear loading only for the active request. The table's query-echo guard is additional protection, not a replacement for this application responsibility, especially for two requests for the same query.
7. Keep query state in an app-owned URL/history adapter when route restoration is needed. Back/Forward restores search, filters, ordering and page together. Do not save design revisions on navigation. Use no-store/private data policies appropriate to authenticated business records.
8. Return safe application error messages. Do not expose SQL/provider errors or hidden customer/internal economics. Search results, totals, cached responses and exports all retain tenant/role scope. Export-all is a separate explicit server operation; it is never inferred from current page data.

The catalog runs the same parser against 67 synthetic invoice summaries and performs whole-dataset operations before paging. It deliberately simulates latency and request failure. It is an executable contract example, not proof of a migrated production endpoint.

## Cabinitron migration inventory and order

Read-only source audit: current list APIs are not yet uniform.

| Surface | Current shape / gap | Adoption requirement |
| --- | --- | --- |
| Staff invoices (`server/invoices.ts`) | Unpaginated array, fixed created-at ordering; presentation loads balance/payment state per record | Summary list endpoint with the shared query/page contract; sort/filter monetary states across the full authorized set before paging; fetch expanded ledger/details contextually |
| Staff estimates (`server/estimates.ts`) | Unpaginated latest-revision array, fixed ordering | Query summaries by allowlisted persisted/derived fields with equivalent count predicates; preserve immutable revision details and exact staff visibility |
| Designs / inquiries / exports (`server/admin.ts`) | Combined overview; some lists are limited to 100 with no pagination | Move each collection to an independently queryable list endpoint; keep the overview lightweight and provide truthful filtered totals |
| Object Library (`server/objectLibrary.ts`) | Catalog array used by both designer and admin | Add an admin list endpoint; retain complete designer catalog compatibility until its consumers explicitly migrate |
| Project/history collections (`server/projects.ts`) | Resource-specific ordering and arrays | Use table paging only where a table is appropriate; retain the separate confirmed List for short history/sharing surfaces |
| Team, stock, pricing | In-memory forms/small lists, differing tasks | Choose Table versus List versus Parameters by task; do not force every screen into a table |

Adoption follows catalog confirmation, in separate app diffs. Start with staff invoice summaries, then estimates/designs. Do not change an existing array response out from under the designer, imports, dropdowns or other consumers: audit callers and introduce a versioned/new list endpoint if they need the old shape. Cover search beyond the first page, both sort directions, tied values/nulls, combined filters, truthful totals, last/out-of-range pages, business/role isolation, stale responses, and read-only navigation.

## Deliberate limits

The first table contract uses exact counts and numbered offset pages. Cursor-only timelines, bulk selection/actions, arbitrary custom filter widgets, grouped headers, user column configuration, resizing, virtualization and spreadsheet-style editing are not implemented. Revisit them through the catalog when a concrete application needs them. Date/time formatting and URL routing remain app policy; no endpoint, SQL builder, authorization adapter or production network call is shipped in the UI package.
