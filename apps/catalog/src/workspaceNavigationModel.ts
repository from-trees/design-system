import { customerExample } from "./customerDirectoryData";
import {
  parseTableQuery,
  tableQueryKey,
  type NavigationGroup,
  type TableQuerySchema,
  type TableQuery,
} from "@from-trees/ui";
export const demoPrefix = "#workspace-navigation";
export const businessPath = "/t/sample-shop/app";
export const workspaceGroups: readonly NavigationGroup[] = [
  {
    id: "work",
    label: "Work",
    href: businessPath + "/work",
    items: [
      {
        id: "designs",
        label: "Designs",
        icon: "folder",
        href: businessPath + "/work/designs",
      },
      {
        id: "estimates",
        label: "Estimates",
        icon: "document",
        href: businessPath + "/work/estimates",
      },
      {
        id: "approvals",
        label: "Design approvals",
        icon: "check",
        href: businessPath + "/work/approvals",
      },
      {
        id: "invoices",
        label: "Invoices",
        icon: "receipt",
        href: businessPath + "/work/invoices",
      },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    href: businessPath + "/customers",
    items: [
      {
        id: "directory",
        label: "Customers",
        icon: "users",
        href: businessPath + "/customers/directory",
      },
      {
        id: "inquiries",
        label: "Inquiries",
        icon: "inbox",
        href: businessPath + "/customers/inquiries",
      },
    ],
  },
  {
    id: "libraries",
    label: "Libraries",
    href: businessPath + "/libraries",
    items: [
      {
        id: "objects",
        label: "Objects",
        icon: "library",
        href: businessPath + "/libraries/objects",
      },
      {
        id: "moulding",
        label: "Moulding profiles",
        icon: "ruler",
        href: businessPath + "/libraries/moulding",
      },
      {
        id: "stock",
        label: "Stock sizes",
        icon: "width",
        href: businessPath + "/libraries/stock",
      },
      {
        id: "catalog",
        label: "Catalog",
        icon: "parts",
        href: businessPath + "/libraries/catalog",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: businessPath + "/settings",
    items: [
      {
        id: "pricing",
        label: "Pricing",
        icon: "settings",
        href: businessPath + "/settings/pricing",
      },
      {
        id: "website",
        label: "Website & branding",
        icon: "globe",
        href: businessPath + "/settings/website",
      },
      {
        id: "team",
        label: "Team",
        icon: "users",
        href: businessPath + "/settings/team",
      },
      {
        id: "subscription",
        label: "Subscription & billing",
        icon: "creditCard",
        href: businessPath + "/settings/subscription",
      },
    ],
  },
];
export const defaultPath = businessPath + "/work/estimates";
export const tableSchema: TableQuerySchema = {
  sortKeys: ["name", "customer", "status", "total", "updated"],
  filters: {
    status: {
      operators: ["in"],
      values: [
        "Draft",
        "Issued",
        "Accepted",
        "Paid",
        "lead",
        "active",
        "completed",
        "archived",
      ],
    },
    customer: { operators: ["eq"] },
  },
  defaultSort: { key: "updated", direction: "descending" },
};
export type WorkspaceRecord = {
  id: string;
  name: string;
  customer: string;
  status: string;
  total: number;
  updated: string;
  description: string;
};
const names: Record<string, string[]> = {
  designs: ["Kitchen renovation", "Library shelving", "Bathroom vanity"],
  estimates: ["EST-1001", "EST-1002", "EST-1003"],
  approvals: [
    "Kitchen design confirmation",
    "Library finish approval",
    "Vanity drawing approval",
  ],
  invoices: ["INV-1001", "INV-1002", "INV-1003"],
  directory: ["Alex Morgan", "Sam Rivera", "Jordan Chen", "Riley Kim"],
  inquiries: ["Kitchen cabinetry", "Built-in bookcases", "Bathroom storage"],
  objects: ["Range cooker", "Undermount sink", "Refrigerator"],
  moulding: ["Crown profile 406", "Square base", "Cove crown"],
  stock: ["White oak plywood", "Hard maple lumber", "Birch plywood"],
  catalog: ["Base cabinet", "Wall cabinet", "Tall cabinet"],
  team: ["Alex Taylor", "Casey Patel", "Jamie Lee"],
};
export function recordsFor(tab: string): WorkspaceRecord[] {
  const choices = names[tab] ?? [];
  return Array.from(
    { length: ["estimates", "invoices"].includes(tab) ? 23 : choices.length },
    (_, index) => ({
      id: `${tab}-${index + 1}`,
      name:
        tab === "estimates"
          ? `EST-${1001 + index}`
          : tab === "invoices"
            ? `INV-${1001 + index}`
            : choices[index],
      customer: ["Alex Morgan", "Sam Rivera", "Jordan Chen"][index % 3],
      status:
        tab === "directory"
          ? customerExample(`directory-${index + 1}`).status
          : (tab === "invoices"
              ? ["Draft", "Issued", "Paid"]
              : ["Draft", "Issued", "Accepted"])[index % 3],
      total: 1200000 + index * 250000,
      updated: `2026-11-0${4 - (index % 3)}T12:00:00Z`,
      description:
        tab === "directory"
          ? customerExample(`directory-${index + 1}`).companyName ||
            "Individual customer"
          : ["Kitchen renovation", "Library shelving", "Bathroom vanity"][
              index % 3
            ],
    }),
  );
}
export function readWorkspace(hash = window.location.hash) {
  let url: URL;
  try {
    const raw = hash.startsWith(demoPrefix)
      ? hash.slice(demoPrefix.length)
      : "";
    if (raw && !raw.startsWith("/")) throw Error();
    url = new URL(raw || defaultPath, "https://catalog.example");
    if (url.origin !== "https://catalog.example") throw Error();
  } catch {
    return {
      url: new URL(defaultPath, "https://catalog.example"),
      notFound: true,
      queryWarning: false,
      query: parseTableQuery(new URLSearchParams(), tableSchema),
    };
  }
  const bits = url.pathname.split("/").filter(Boolean);
  const group = workspaceGroups.find((g) => g.id === bits[3]);
  const tab = group?.items.find(
    (item) => item.id === (bits[4] ?? group.items[0].id),
  );
  const id = bits[5];
  const record =
    tab && id ? recordsFor(tab.id).find((row) => row.id === id) : undefined;
  const childKind = bits[6];
  const childId = bits[7];
  const profile =
    record && tab?.id === "directory" ? customerExample(record.id) : undefined;
  const subrecord =
    profile && (childKind === "contacts" || childKind === "addresses")
      ? profile[childKind].find((child) => child.id === childId)
      : undefined;
  const validChild = !!subrecord && bits.length === 8;
  const notFound =
    bits[0] !== "t" ||
    bits[1] !== "sample-shop" ||
    bits[2] !== "app" ||
    !group ||
    !tab ||
    (bits.length > 6 && !validChild) ||
    (!!id && !record);
  const detail = validChild
      ? childKind
      : (url.searchParams.get("detail") ?? "overview"),
    revision = url.searchParams.get("revision") ?? "3";
  const invalidDetail =
    !(
      tab?.id === "directory"
        ? ["overview", "contacts", "addresses", "related", "activity"]
        : ["overview", "related", "activity"]
    ).includes(detail) ||
    url.searchParams.getAll("detail").length > 1 ||
    (validChild &&
      url.searchParams.has("detail") &&
      url.searchParams.get("detail") !== childKind);
  const invalidRevision =
    !!id &&
    ["estimates", "approvals", "invoices"].includes(tab?.id ?? "") &&
    (!["1", "2", "3"].includes(revision) ||
      url.searchParams.getAll("revision").length > 1);
  const params = new URLSearchParams();
  for (const [key, value] of url.searchParams)
    if (tab && key.startsWith(tab.id + "."))
      params.append(key.slice(tab.id.length + 1), value);
  let query: TableQuery,
    queryWarning = false;
  try {
    query = parseTableQuery(params, tableSchema);
  } catch {
    query = parseTableQuery(new URLSearchParams(), tableSchema);
    queryWarning = true;
  }
  return {
    url,
    group,
    tab,
    record,
    subrecord,
    childKind,
    notFound: notFound || invalidDetail || invalidRevision,
    queryWarning,
    query,
    detail,
    revision,
  };
}
export function workspaceHref(path: string, params = new URLSearchParams()) {
  return demoPrefix + path + (params.size ? "?" + params.toString() : "");
}
export function pageParams(params: URLSearchParams) {
  const next = new URLSearchParams(params);
  next.delete("detail");
  next.delete("revision");
  return next;
}
export function queryParams(
  params: URLSearchParams,
  tab: string,
  query: TableQuery,
) {
  const next = new URLSearchParams(params);
  for (const key of [...next.keys()])
    if (key.startsWith(tab + ".")) next.delete(key);
  for (const [key, value] of new URLSearchParams(tableQueryKey(query)))
    next.append(tab + "." + key, value);
  return next;
}
