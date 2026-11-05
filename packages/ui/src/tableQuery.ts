/** Transport-neutral list contract. Servers own authorization, filtering and ordering. */
export type TableQuery = {
  search: string;
  filters: Record<string, string>;
  sort: { key: string; direction: "ascending" | "descending" } | null;
  page: number;
  pageSize: number;
};
export type TablePage<T> = {
  items: readonly T[];
  total: number;
  /** Echo the normalized query that produced these rows, never the latest UI intent. */
  query: TableQuery;
};
export const tablePageSizes = [10, 25, 50, 100] as const;
export type TableQuerySchema = {
  sortKeys: readonly string[];
  filters: Readonly<Record<string, readonly string[]>>;
  defaultSort: TableQuery["sort"];
};
export function tableQueryKey(query: TableQuery): string {
  const params = new URLSearchParams();
  params.set("q", query.search.trim());
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  if (query.sort) {
    params.set("sort", query.sort.key);
    params.set("direction", query.sort.direction);
  }
  for (const key of Object.keys(query.filters).sort())
    if (query.filters[key]) params.set(`filter.${key}`, query.filters[key]);
  return params.toString();
}
/** Strict parsing for application-owned endpoint schemas. Never interpolate keys into SQL. */
export function parseTableQuery(
  params: URLSearchParams,
  schema: TableQuerySchema,
): TableQuery {
  const allowed = new Set([
    "q",
    "page",
    "pageSize",
    "sort",
    "direction",
    ...Object.keys(schema.filters).map((key) => `filter.${key}`),
  ]);
  for (const key of params.keys()) {
    if (!allowed.has(key) || params.getAll(key).length !== 1)
      throw new Error(`Unsupported or repeated table parameter: ${key}`);
  }
  const integer = (key: string, fallback: number) => {
    const raw = params.get(key);
    if (raw === null) return fallback;
    const value = Number(raw);
    if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(value))
      throw new Error(`Invalid ${key}`);
    return value;
  };
  const search = (params.get("q") ?? "").trim();
  if (search.length > 200)
    throw new Error("Search allows up to 200 characters");
  const page = integer("page", 1),
    pageSize = integer("pageSize", 25);
  if (
    !tablePageSizes.some((size) => size === pageSize) ||
    !Number.isSafeInteger((page - 1) * pageSize)
  )
    throw new Error("Invalid page size or offset");
  const sortKey = params.get("sort"),
    direction = params.get("direction");
  let sort = schema.defaultSort;
  if (sortKey !== null) {
    if (
      !schema.sortKeys.includes(sortKey) ||
      !["ascending", "descending"].includes(direction ?? "")
    )
      throw new Error("Invalid table sort");
    sort = { key: sortKey, direction: direction as "ascending" | "descending" };
  } else if (direction !== null)
    throw new Error("Sort direction requires a sort key");
  if (
    sort &&
    (!schema.sortKeys.includes(sort.key) ||
      !["ascending", "descending"].includes(sort.direction))
  )
    throw new Error("Invalid default sort schema");
  const filters: Record<string, string> = {};
  for (const key of Object.keys(schema.filters)) {
    const value = params.get(`filter.${key}`);
    if (value !== null && value !== "") {
      if (!schema.filters[key].includes(value))
        throw new Error(`Invalid filter: ${key}`);
      filters[key] = value;
    }
  }
  return { search, filters, sort, page, pageSize };
}
