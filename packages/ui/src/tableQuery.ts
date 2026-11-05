/** Transport-neutral list contract. Servers own authorization, filtering and ordering. */
export type TableFilterOperator = "eq" | "contains" | "in" | "noteq";
export type TableFilterValue =
  | { operator: "eq" | "contains" | "noteq"; value: string }
  | { operator: "in"; value: string[] };
export type TableFilterSchema = {
  operators: readonly TableFilterOperator[];
  values?: readonly string[];
};
export type TableQuery = {
  search: string;
  filters: Record<string, TableFilterValue>;
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
  filters: Readonly<Record<string, TableFilterSchema>>;
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
  for (const key of Object.keys(query.filters).sort()) {
    const filter = query.filters[key];
    const values =
      filter.operator === "in"
        ? [...new Set(filter.value)].sort()
        : [filter.value];
    if (!values.length) throw new Error(`Empty filter: ${key}`);
    for (const value of values)
      params.append(`filter.${key}.${filter.operator}`, value);
  }
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
    ...Object.entries(schema.filters).flatMap(([key, field]) =>
      field.operators.map((operator) => `filter.${key}.${operator}`),
    ),
  ]);
  for (const key of params.keys()) {
    if (
      !allowed.has(key) ||
      (!key.endsWith(".in") && params.getAll(key).length !== 1)
    )
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
  const filters: Record<string, TableFilterValue> = {};
  for (const [key, field] of Object.entries(schema.filters)) {
    const supplied = field.operators.filter((operator) =>
      params.has(`filter.${key}.${operator}`),
    );
    if (supplied.length > 1)
      throw new Error(`Only one operator per filter is allowed: ${key}`);
    if (!supplied.length) continue;
    const operator = supplied[0];
    if (!["eq", "contains", "in", "noteq"].includes(operator))
      throw new Error(`Invalid filter operator: ${key}`);
    const values = params.getAll(`filter.${key}.${operator}`);
    if (
      values.length > 50 ||
      values.some(
        (value) =>
          !value.trim() ||
          value.length > 200 ||
          (operator !== "contains" &&
            field.values &&
            !field.values.includes(value)),
      )
    )
      throw new Error(`Invalid filter value: ${key}`);
    filters[key] =
      operator === "in"
        ? { operator, value: [...new Set(values)].sort() }
        : { operator, value: values[0] };
  }
  return { search, filters, sort, page, pageSize };
}
