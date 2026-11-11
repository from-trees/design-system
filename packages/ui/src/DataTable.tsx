import { TableFilters, type TableFilter } from "./TableFilters";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
} from "react-aria-components";
import * as stylex from "@stylexjs/stylex";
import { color, metrics, space } from "./tokens.stylex";
import { layout, gap } from "./utilities";
import { Button, IconButton } from "./Button";
import { Icon } from "./Icon";
import { TextInput, Select } from "./Field";
import { MenuButton, type Action } from "./MenuButton";
import { Badge, Status } from "./Feedback";
import { InfoTooltip } from "./InfoTooltip";
import { Shimmer } from "./Shimmer";
import {
  tablePageSizes,
  tableQueryKey,
  type TableQuery,
  type TablePage,
} from "./tableQuery";

type BaseColumn = { id: string; label: string; sortable?: boolean };
export type TableColumn<T> = BaseColumn &
  (
    | {
        kind: "text";
        value: (item: T) => string | null;
        metadata?: (item: T) => string | null;
        /** Decorative artwork next to the existing cell label. Apps supply images or pending render state. */
        thumbnail?: (item: T) => {
          src?: string;
          loading?: boolean;
          fit?: "contain" | "cover";
        };
      }
    | {
        kind: "number";
        value: (item: T) => number | null;
        maximumFractionDigits?: number;
      }
    | { kind: "money"; value: (item: T) => number | null; currency: string }
    | { kind: "date"; value: (item: T) => string | null }
    | {
        kind: "status";
        value: (item: T) => {
          label: string;
          tone?: "neutral" | "success" | "warning" | "danger";
        } | null;
      }
  );
export type { TableFilter } from "./TableFilters";
export type DataTableProps<T> = {
  label: string;
  columns: readonly TableColumn<T>[];
  query: TableQuery;
  onQueryChange: (query: TableQuery) => void;
  page: TablePage<T> | null;
  getRowId: (item: T) => string;
  getRowLabel: (item: T) => string;
  rowActions?: (item: T) => readonly Action[];
  onOpenRow?: (item: T) => void;
  filters?: readonly TableFilter[];
  primaryAction?: Action;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  locale?: string;
  timeZone?: string;
};
const styles = stylex.create({
  root: {
    minWidth: 0,
    color: color.ink,
    fontFamily: "inherit",
    fontSize: metrics.font,
  },
  toolbar: {
    display: "flex",
    alignItems: "flex-end",
    gap: space.md,
    flexWrap: "wrap",
  },
  search: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    flexGrow: 1,
    flexBasis: 240,
    minWidth: 0,
  },
  searchInput: { flexGrow: 1, minWidth: 0 },
  filter: { minWidth: 130 },
  grow: { flexGrow: 1 },
  scroll: {
    overflow: "auto",
    maxHeight: 540,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
    position: "relative",
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: 0,
    width: "100%",
    fontSize: metrics.small,
    textAlign: "start",
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: -2,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: color.subtle,
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "default",
  },
  sortable: { cursor: "pointer" },
  cell: {
    paddingBlock: metrics.fieldGap,
    paddingInline: space.lg,
    minWidth: 120,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
    verticalAlign: "middle",
    textAlign: "start",
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: -2,
  },
  primary: { minWidth: 200, maxWidth: 340, fontWeight: 550 },
  illustrated: { display: "flex", alignItems: "center", gap: space.sm },
  caption: { minWidth: 0 },
  thumbnail: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 48,
    height: 48,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: metrics.radius,
    backgroundColor: color.subtle,
    color: color.muted,
  },
  thumbnailImage: { width: "100%", height: "100%", objectFit: "contain" },
  cover: { objectFit: "cover" },
  pendingImage: { visibility: "hidden" },
  thumbnailLoading: { position: "absolute", inset: 0 },
  text: {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 320,
  },
  metadata: {
    display: "block",
    fontWeight: 400,
    marginTop: space.xs,
    color: color.muted,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 320,
  },
  numeric: {
    textAlign: "end",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  date: { whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" },
  action: {
    position: "sticky",
    right: 0,
    minWidth: 52,
    width: 52,
    textAlign: "end",
    backgroundColor: color.surface,
    borderInlineStartWidth: 1,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.border,
    zIndex: 1,
  },
  actionHeader: { zIndex: 3, backgroundColor: color.subtle },
  row: { backgroundColor: { default: color.surface, ":hover": color.hovered } },
  navigable: { cursor: "pointer" },
  headerContent: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
  },
  sort: { display: "inline-flex", opacity: 0.45 },
  activeSort: { opacity: 1 },
  descending: { transform: "rotate(180deg)" },
  empty: { padding: space.xxl, textAlign: "center", color: color.muted },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: space.md,
  },
  pager: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    flexWrap: "wrap",
  },
  pageSize: { display: "flex", alignItems: "center", gap: space.sm },
  muted: { color: color.muted, fontSize: metrics.small },
  shimmerCell: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    minHeight: 28,
    justifyContent: "center",
    flexGrow: 1,
  },
});
function TableThumbnail({
  src,
  loading,
  fit,
}: {
  src?: string;
  loading?: boolean;
  fit?: "contain" | "cover";
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error",
  );
  const pending = !!loading || state === "loading";
  return (
    <span
      aria-hidden="true"
      aria-busy={pending}
      data-ft-ui="table-thumbnail"
      {...stylex.props(styles.thumbnail)}
    >
      {src && state !== "error" && (
        <img
          alt=""
          src={src}
          loading="lazy"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          {...stylex.props(
            styles.thumbnailImage,
            fit === "cover" && styles.cover,
            pending && styles.pendingImage,
          )}
        />
      )}
      {pending ? (
        <span {...stylex.props(styles.thumbnailLoading)}>
          <Shimmer width={48} height={48} variant="block" />
        </span>
      ) : state === "error" ? (
        <Icon name="view" />
      ) : null}
    </span>
  );
}
function displayCell<T>(
  column: TableColumn<T>,
  item: T,
  locale: string,
  timeZone?: string,
) {
  if (column.kind === "status") {
    const status = column.value(item);
    return status ? <Badge tone={status.tone}>{status.label}</Badge> : "—";
  }
  const value = column.value(item);
  if (value === null) return "—";
  if (column.kind === "money") {
    if (!Number.isSafeInteger(value)) return "—";
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: column.currency,
    });
    return formatter.format(
      Number(value) /
        10 ** (formatter.resolvedOptions().maximumFractionDigits ?? 2),
    );
  }
  if (column.kind === "number")
    return Number.isFinite(value)
      ? new Intl.NumberFormat(locale, {
          maximumFractionDigits: column.maximumFractionDigits ?? 2,
        }).format(Number(value))
      : "—";
  if (column.kind === "date") {
    const raw = String(value),
      date = new Date(raw);
    if (!Number.isFinite(date.getTime())) return "—";
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
    return (
      <time dateTime={raw} title={date.toISOString()}>
        {new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeZone: dateOnly ? "UTC" : timeZone,
        }).format(date)}
      </time>
    );
  }
  const text = (
    <>
      <span title={String(value)} {...stylex.props(styles.text)}>
        {String(value)}
      </span>
      {column.metadata?.(item) && (
        <span title={column.metadata(item)!} {...stylex.props(styles.metadata)}>
          {column.metadata(item)}
        </span>
      )}
    </>
  );
  if (!column.thumbnail) return text;
  const thumbnail = column.thumbnail(item);
  return (
    <span {...stylex.props(styles.illustrated)}>
      <TableThumbnail key={thumbnail.src ?? "empty"} {...thumbnail} />
      <span {...stylex.props(styles.caption)}>{text}</span>
    </span>
  );
}
/** Owns layout, keyboard navigation and formatting. Apps supply whole-dataset query results. */
export function DataTable<T>({
  label,
  columns,
  query,
  onQueryChange,
  page,
  getRowId,
  getRowLabel,
  rowActions,
  onOpenRow,
  filters = [],
  primaryAction,
  loading = false,
  error,
  onRetry,
  locale = "en-US",
  timeZone,
}: DataTableProps<T>) {
  if (
    !columns.length ||
    new Set(columns.map((column) => column.id)).size !== columns.length ||
    columns.some((column) => column.id === "__actions")
  )
    throw new Error("Tables require unique data columns; Actions is reserved.");
  const [search, setSearch] = useState(query.search);
  useEffect(() => setSearch(query.search), [query.search]);
  const matches =
    page !== null && tableQueryKey(page.query) === tableQueryKey(query);
  const busy = !error && (loading || !matches);
  const items = matches && !busy && !error ? page!.items : [];
  const total = matches && !busy && !error ? page!.total : null;
  const paginationTotal =
    page &&
    tableQueryKey({ ...page.query, page: 1 }) ===
      tableQueryKey({ ...query, page: 1 })
      ? page.total
      : null;
  const pageCount =
    paginationTotal === null
      ? null
      : Math.max(1, Math.ceil(paginationTotal / query.pageSize));
  const active = !!query.search || Object.values(query.filters).some(Boolean);
  const change = (patch: Partial<TableQuery>) =>
    onQueryChange({ ...query, ...patch, page: 1 });
  const clear = () => {
    setSearch("");
    change({ search: "", filters: {} });
  };
  const allColumns = [
    ...columns.map((column) => ({ id: column.id, column })),
    { id: "__actions", column: null },
  ];
  const loadingRows = Array.from(
    { length: Math.min(query.pageSize, 10) },
    (_, index) => ({ id: `__loading-${index}`, item: null as T | null }),
  );
  const rows = busy
    ? loadingRows
    : items.map((item) => ({ id: getRowId(item), item }));
  const currentPages =
    pageCount === null
      ? []
      : Array.from(
          { length: Math.min(5, pageCount) },
          (_, index) =>
            Math.max(1, Math.min(query.page - 2, pageCount - 4)) + index,
        );
  return (
    <section
      aria-label={label}
      aria-busy={busy}
      {...stylex.props(styles.root, layout.stack, gap.md)}
    >
      <div {...stylex.props(styles.toolbar)}>
        <form
          role="search"
          aria-label={`Search ${label}`}
          onSubmit={(event) => {
            event.preventDefault();
            change({ search: search.trim() });
          }}
          {...stylex.props(styles.search)}
        >
          <div {...stylex.props(styles.searchInput)}>
            <TextInput
              aria-label={`Search ${label}`}
              placeholder="Search…"
              type="search"
              maxLength={200}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <IconButton type="submit" label={`Search ${label}`} icon="search" />
          <InfoTooltip label={`search ${label}`}>
            Search up to 200 characters. Press Enter or the search button to
            apply. The application defines which fields are searched.
          </InfoTooltip>
        </form>
        <TableFilters
          filters={filters}
          values={query.filters}
          onChange={(values) => change({ filters: values })}
        />
        {active && (
          <Button variant="ghost" icon="close" onPress={clear}>
            Clear filters
          </Button>
        )}
        {primaryAction && (
          <Button
            icon={primaryAction.icon}
            variant="primary"
            isDisabled={primaryAction.disabled}
            onPress={primaryAction.onAction}
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
      <div role="status" aria-live="polite" {...stylex.props(styles.muted)}>
        {error
          ? "Unable to load results"
          : busy
            ? `Loading ${label}…`
            : `${total} ${total === 1 ? "result" : "results"} · Page ${query.page} of ${pageCount}`}
      </div>
      {error && (
        <Status tone="danger">
          {error} {onRetry && <Button onPress={onRetry}>Retry</Button>}
        </Status>
      )}
      <div {...stylex.props(styles.scroll)}>
        <Table
          aria-label={label}
          aria-busy={busy}
          selectionMode="none"
          sortDescriptor={
            query.sort
              ? { column: query.sort.key, direction: query.sort.direction }
              : undefined
          }
          onSortChange={(sort) =>
            change({
              sort: { key: String(sort.column), direction: sort.direction },
            })
          }
          onRowAction={
            onOpenRow
              ? (key) => {
                  const row = items.find((item) => getRowId(item) === key);
                  if (row !== undefined) onOpenRow(row);
                }
              : undefined
          }
          {...stylex.props(styles.table)}
        >
          <TableHeader columns={allColumns}>
            {({ id, column }) => (
              <Column
                id={id}
                isRowHeader={id === columns[0]?.id}
                allowsSorting={!!column?.sortable}
                {...stylex.props(
                  styles.cell,
                  styles.header,
                  column?.sortable && styles.sortable,
                  (column?.kind === "number" || column?.kind === "money") &&
                    styles.numeric,
                  !column && styles.action,
                  !column && styles.actionHeader,
                )}
              >
                {({ sortDirection }) => (
                  <span {...stylex.props(styles.headerContent)}>
                    {column?.label ?? "Actions"}
                    {column?.sortable && (
                      <span
                        {...stylex.props(
                          styles.sort,
                          !!sortDirection && styles.activeSort,
                          sortDirection === "descending" && styles.descending,
                        )}
                      >
                        <Icon
                          name={sortDirection ? "sortAscending" : "height"}
                          size={14}
                        />
                      </span>
                    )}
                  </span>
                )}
              </Column>
            )}
          </TableHeader>
          <TableBody
            items={rows}
            dependencies={[columns, rowActions, busy]}
            renderEmptyState={() => (
              <div {...stylex.props(styles.empty)}>
                {error
                  ? "Results unavailable."
                  : total === 0
                    ? active
                      ? "No matching records."
                      : "No records yet."
                    : "No records on this page."}
                {!error && query.page > 1 && (
                  <div>
                    <Button
                      variant="ghost"
                      onPress={
                        query.page > 1
                          ? () => onQueryChange({ ...query, page: 1 })
                          : clear
                      }
                    >
                      {query.page > 1 ? "Go to first page" : "Clear filters"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          >
            {(row) => (
              <Row
                id={row.id}
                textValue={
                  row.item === null ? "Loading" : getRowLabel(row.item)
                }
                columns={allColumns}
                isDisabled={busy}
                {...stylex.props(
                  styles.row,
                  !!onOpenRow && !busy && styles.navigable,
                )}
              >
                {({ id, column }) => (
                  <Cell
                    {...stylex.props(
                      styles.cell,
                      id === columns[0]?.id && styles.primary,
                      (column?.kind === "number" || column?.kind === "money") &&
                        styles.numeric,
                      column?.kind === "date" && styles.date,
                      !column && styles.action,
                    )}
                  >
                    {row.item === null ? (
                      <div {...stylex.props(styles.illustrated)}>
                        {column?.kind === "text" && column.thumbnail && (
                          <Shimmer width={48} height={48} variant="block" />
                        )}
                        <div {...stylex.props(styles.shimmerCell)}>
                          <Shimmer
                            width={
                              column
                                ? column.kind === "text"
                                  ? "85%"
                                  : "65%"
                                : 24
                            }
                          />
                          {id === columns[0]?.id && (
                            <Shimmer width="55%" height={10} />
                          )}
                        </div>
                      </div>
                    ) : column ? (
                      displayCell(column, row.item, locale, timeZone)
                    ) : (
                      (() => {
                        const item = row.item!;
                        const actions = [
                          ...(onOpenRow
                            ? [
                                {
                                  id: "__open",
                                  label: "Open",
                                  icon: "view" as const,
                                  onAction: () => onOpenRow(item),
                                },
                              ]
                            : []),
                          ...(rowActions?.(item) ?? []),
                        ];
                        return actions.length ? (
                          <MenuButton
                            label={`${getRowLabel(item)} actions`}
                            actions={actions}
                          />
                        ) : (
                          <span aria-label="No available actions">—</span>
                        );
                      })()
                    )}
                  </Cell>
                )}
              </Row>
            )}
          </TableBody>
        </Table>
      </div>
      <footer {...stylex.props(styles.footer)}>
        <div {...stylex.props(styles.pageSize)}>
          <Select
            label="Rows per page"
            value={query.pageSize}
            onChange={(event) =>
              change({ pageSize: Number(event.target.value) })
            }
          >
            {tablePageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          <InfoTooltip label={`${label} keyboard navigation`}>
            Tab enters the table. Arrow keys move between cells; Home and End
            move within a row. Enter opens a record when available. Use the
            Actions menu for all other commands.
          </InfoTooltip>
        </div>
        <nav aria-label={`${label} pagination`} {...stylex.props(styles.pager)}>
          <IconButton
            label="First page"
            icon="firstPage"
            isDisabled={busy || !!error || query.page <= 1}
            onPress={() => onQueryChange({ ...query, page: 1 })}
          />
          <IconButton
            label="Previous page"
            icon="previous"
            isDisabled={busy || !!error || query.page <= 1}
            onPress={() => onQueryChange({ ...query, page: query.page - 1 })}
          />
          {currentPages.map((number) => (
            <Button
              key={number}
              variant={number === query.page ? "primary" : "ghost"}
              aria-label={`Page ${number}`}
              aria-current={number === query.page ? "page" : undefined}
              isDisabled={busy || !!error}
              onPress={() => onQueryChange({ ...query, page: number })}
            >
              {number}
            </Button>
          ))}
          <IconButton
            label="Next page"
            icon="chevronRight"
            isDisabled={
              busy || !!error || pageCount === null || query.page >= pageCount
            }
            onPress={() => onQueryChange({ ...query, page: query.page + 1 })}
          />
          <IconButton
            label="Last page"
            icon="lastPage"
            isDisabled={
              busy || !!error || pageCount === null || query.page >= pageCount
            }
            onPress={() =>
              pageCount && onQueryChange({ ...query, page: pageCount })
            }
          />
        </nav>
      </footer>
    </section>
  );
}
