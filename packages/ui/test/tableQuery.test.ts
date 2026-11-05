import { describe, expect, it } from "vitest";
import {
  parseTableQuery,
  tableQueryKey,
  type TableQuerySchema,
} from "../src/tableQuery";
const schema: TableQuerySchema = {
  sortKeys: ["name", "amount"],
  filters: { status: ["draft", "paid"], kind: ["cabinet", "fixture"] },
  defaultSort: { key: "name", direction: "ascending" },
};
describe("table API contract", () => {
  it("supplies bounded defaults and normalizes search/filter order into a canonical request", () => {
    const query = parseTableQuery(
      new URLSearchParams(
        "q=++oak++&filter.status=paid&filter.kind=cabinet&page=2&pageSize=10&sort=amount&direction=descending",
      ),
      schema,
    );
    expect(query).toEqual({
      search: "oak",
      filters: { status: "paid", kind: "cabinet" },
      sort: { key: "amount", direction: "descending" },
      page: 2,
      pageSize: 10,
    });
    expect(
      parseTableQuery(new URLSearchParams(tableQueryKey(query)), schema),
    ).toEqual(query);
    expect(tableQueryKey(query)).toBe(
      tableQueryKey({ ...query, filters: { kind: "cabinet", status: "paid" } }),
    );
    expect(parseTableQuery(new URLSearchParams(), schema)).toEqual({
      search: "",
      filters: {},
      sort: schema.defaultSort,
      page: 1,
      pageSize: 25,
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
    "filter.status=anything",
    "filter.owner=other-tenant",
    "unknown=1",
    "q=" + "x".repeat(201),
  ])("rejects unsupported or ambiguous query: %s", (input) => {
    expect(() => parseTableQuery(new URLSearchParams(input), schema)).toThrow();
  });
  it("supports a deliberately unsorted endpoint and empty optional filters", () => {
    expect(
      parseTableQuery(new URLSearchParams("filter.status="), {
        ...schema,
        defaultSort: null,
      }).sort,
    ).toBeNull();
    expect(
      parseTableQuery(new URLSearchParams("filter.status="), schema).filters,
    ).toEqual({});
  });
});
