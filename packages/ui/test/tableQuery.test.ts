import { describe, expect, it } from "vitest";
import {
  parseTableQuery,
  tableQueryKey,
  type TableQuerySchema,
} from "../src/tableQuery";
const schema: TableQuerySchema = {
  sortKeys: ["name", "amount"],
  filters: {
    status: { operators: ["eq", "noteq", "in"], values: ["draft", "paid"] },
    name: { operators: ["eq", "contains", "in", "noteq"] },
  },
  defaultSort: { key: "name", direction: "ascending" },
};
describe("table API contract", () => {
  it("supplies bounded defaults and canonicalizes field and IN value order", () => {
    const query = parseTableQuery(
      new URLSearchParams(
        "q=++oak++&filter.status.in=paid&filter.status.in=draft&filter.status.in=paid&filter.name.contains=Oak&page=2&pageSize=10&sort=amount&direction=descending",
      ),
      schema,
    );
    expect(query).toEqual({
      search: "oak",
      filters: {
        status: { operator: "in", value: ["draft", "paid"] },
        name: { operator: "contains", value: "Oak" },
      },
      sort: { key: "amount", direction: "descending" },
      page: 2,
      pageSize: 10,
    });
    expect(
      parseTableQuery(new URLSearchParams(tableQueryKey(query)), schema),
    ).toEqual(query);
    expect(tableQueryKey(query)).toBe(
      tableQueryKey({
        ...query,
        filters: {
          name: query.filters.name,
          status: { operator: "in", value: ["paid", "draft"] },
        },
      }),
    );
    expect(parseTableQuery(new URLSearchParams(), schema)).toEqual({
      search: "",
      filters: {},
      sort: schema.defaultSort,
      page: 1,
      pageSize: 25,
    });
  });
  it.each(["eq", "contains", "noteq"] as const)(
    "round-trips scalar %s without treating commas or wildcard characters as syntax",
    (operator) => {
      const input = {
        search: "",
        filters: { name: { operator, value: "Oak, 50%_ & walnut" } },
        sort: schema.defaultSort,
        page: 1,
        pageSize: 25,
      };
      expect(
        parseTableQuery(new URLSearchParams(tableQueryKey(input)), schema),
      ).toEqual(input);
    },
  );
  it("round-trips IN values with commas as separate unambiguous values", () => {
    const query = parseTableQuery(
      new URLSearchParams("filter.name.in=Oak%2C+walnut&filter.name.in=Maple"),
      schema,
    );
    expect(query.filters.name).toEqual({
      operator: "in",
      value: ["Maple", "Oak, walnut"],
    });
  });
  it.each([
    "page=0",
    "page=-1",
    "page=1.5",
    "page=Infinity",
    "page=9007199254740991&pageSize=100",
    "pageSize=10000",
    "pageSize=0",
    "page=1&page=2",
    "sort=privateCost&direction=ascending",
    "sort=amount",
    "direction=descending",
    "sort=name&direction=DROP",
    "filter.status.eq=anything",
    "filter.owner.eq=other-tenant",
    "unknown=1",
    "filter.status=paid",
    "filter.status.contains=paid",
    "filter.status.gt=paid",
    "filter.status.eq=paid&filter.status.noteq=draft",
    "filter.status.eq=paid&filter.status.eq=draft",
    "filter.status.in=paid&filter.status.in=unknown",
    "filter.status.in=",
    "filter.name.contains=",
    "filter.name.eq=++",
    "filter.name.eq=" + "x".repeat(201),
    Array.from({ length: 51 }, (_, i) => "filter.name.in=" + i).join("&"),
    "q=" + "x".repeat(201),
  ])("rejects unsupported or ambiguous query: %s", (input) => {
    expect(() => parseTableQuery(new URLSearchParams(input), schema)).toThrow();
  });
  it("supports an intentionally unsorted endpoint", () => {
    expect(
      parseTableQuery(new URLSearchParams(), { ...schema, defaultSort: null })
        .sort,
    ).toBeNull();
  });
});

it("does not silently serialize an empty IN filter as no filter", () => {
  expect(() =>
    tableQueryKey({
      search: "",
      filters: { status: { operator: "in", value: [] } },
      sort: null,
      page: 1,
      pageSize: 25,
    }),
  ).toThrow("Empty filter");
});
