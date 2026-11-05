import { customerExample } from "./customerDirectoryData";
import { CustomerDirectoryProfile } from "./customerDirectoryExample";
import { useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Switch,
  Dialog,
  WorkspaceLayout,
  Breadcrumbs,
  DataTable,
  SidePanel,
  SegmentedControl,
  Select,
  ParameterRow,
  Status,
  Panel,
  Button,
  List,
  type TableColumn,
  type NavigationDestination,
} from "@from-trees/ui";
import { layout, gap } from "@from-trees/ui/utilities";
import { color, space } from "@from-trees/ui/tokens.stylex";
import {
  businessPath,
  demoPrefix,
  defaultPath,
  pageParams,
  queryParams,
  readWorkspace,
  recordsFor,
  workspaceGroups,
  workspaceHref,
  type WorkspaceRecord,
} from "./workspaceNavigationModel";
const styles = stylex.create({
  heading: { margin: 0, fontSize: 22, fontWeight: 650 },
  muted: { color: color.muted, margin: 0 },
  frame: { minHeight: 400 },
  canvas: { height: "min(860px,85dvh)", minHeight: 400 },
  full: { height: "100dvh", boxSizing: "border-box", padding: 20 },
  fullCanvas: { flexGrow: 1, minHeight: 0, height: "auto" },
  details: {
    margin: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: space.lg,
  },
  value: { margin: 0, fontWeight: 550 },
  link: {
    color: color.accent,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
  route: {
    overflowWrap: "anywhere",
    fontSize: 12,
    color: color.muted,
    margin: 0,
  },
});
const baseColumns: TableColumn<WorkspaceRecord>[] = [
  {
    id: "name",
    label: "Name",
    kind: "text",
    sortable: true,
    value: (r) => r.name,
    metadata: (r) => r.description,
  },
  {
    id: "customer",
    label: "Customer",
    kind: "text",
    sortable: true,
    value: (r) => r.customer,
  },
  {
    id: "status",
    label: "Status",
    kind: "status",
    sortable: true,
    value: (r) => ({
      label: r.status[0].toUpperCase() + r.status.slice(1),
      tone: r.status === "Accepted" ? "success" : "neutral",
    }),
  },
  {
    id: "total",
    label: "Total",
    kind: "money",
    currency: "USD",
    sortable: true,
    value: (r) => r.total,
  },
  {
    id: "updated",
    label: "Updated",
    kind: "date",
    sortable: true,
    value: (r) => r.updated,
  },
];
export function WorkspaceNavigationPrototype({
  standalone = false,
}: { standalone?: boolean } = {}) {
  const [route, setRoute] = useState(() => readWorkspace()),
    [copied, setCopied] = useState(false);
  // Direct child URLs must establish the parent modal scope before opening the child.
  const [mountedRecord, setMountedRecord] = useState<string | null>(null);
  useEffect(
    () => setMountedRecord(route.record?.id ?? null),
    [route.record?.id],
  );
  const tableRoot = useRef<HTMLDivElement>(null),
    recordBody = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null),
    returnFocus = useRef<HTMLElement | null>(null),
    previousPath = useRef(route.url.pathname);
  useEffect(() => {
    const sync = () => {
      setRoute(readWorkspace());
      setCopied(false);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    if (window.location.hash === demoPrefix) {
      window.history.replaceState(null, "", workspaceHref(defaultPath));
      sync();
    }
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);
  useEffect(() => {
    if (previousPath.current !== route.url.pathname && !route.record) {
      heading.current?.focus();
    }
    previousPath.current = route.url.pathname;
  }, [route.url.pathname, route.record]);
  useEffect(() => {
    if (route.record && !route.subrecord) recordBody.current?.focus();
  }, [route.record?.id]);
  const navigate = ({ href }: NavigationDestination) => {
    if (window.location.hash === href) return;
    window.history.pushState(null, "", href);
    setRoute(readWorkspace());
    setCopied(false);
  };
  const go = (path: string, params = pageParams(route.url.searchParams)) =>
    navigate({ id: path, href: workspaceHref(path, params) });
  const groups = workspaceGroups.map((group) => ({
    ...group,
    href: workspaceHref(group.href, pageParams(route.url.searchParams)),
    items: group.items.map((item) => ({
      ...item,
      href: workspaceHref(item.href, pageParams(route.url.searchParams)),
    })),
  }));
  const tab = route.tab,
    record = route.record;
  const relatedTarget =
    tab?.id === "directory"
      ? {
          label: "Kitchen estimate",
          path: businessPath + "/work/estimates/estimates-1",
        }
      : {
          label: "Alex Morgan",
          path: businessPath + "/customers/directory/directory-1",
        };
  const all = recordsFor(tab?.id ?? "").filter(
    (row) =>
      tab?.id !== "directory" ||
      route.url.searchParams.get("includeArchived") === "1" ||
      row.status !== "archived",
  );
  const matching = all.filter(
    (row) =>
      (!route.query.search ||
        `${row.name} ${row.customer} ${row.description} ${
          tab?.id === "directory"
            ? customerExample(row.id)
                .contacts.map((c) => `${c.displayName} ${c.email} ${c.phone}`)
                .join(" ")
            : ""
        }`
          .toLowerCase()
          .includes(route.query.search.toLowerCase())) &&
      Object.entries(route.query.filters).every(([key, filter]) =>
        filter.operator === "in"
          ? filter.value.includes(row[key as "status"])
          : row[key as "customer"] === filter.value,
      ),
  );
  const sort = route.query.sort;
  matching.sort((a, b) => {
    if (!sort) return 0;
    const key = sort.key as keyof WorkspaceRecord,
      x = a[key],
      y = b[key];
    return (
      ((typeof x === "number"
        ? x - (y as number)
        : String(x).localeCompare(String(y))) || a.id.localeCompare(b.id)) *
      (sort.direction === "ascending" ? 1 : -1)
    );
  });
  const columns = baseColumns
    .filter(
      (column) =>
        ["estimates", "invoices"].includes(tab?.id ?? "") ||
        !(tab?.id === "directory" ? ["total"] : ["total", "status"]).includes(
          column.id,
        ),
    )
    .filter(
      (column) =>
        ![
          "directory",
          "objects",
          "moulding",
          "stock",
          "catalog",
          "team",
        ].includes(tab?.id ?? "") || column.id !== "customer",
    );
  const close = () => {
    if (tab) {
      go(tab.href, pageParams(route.url.searchParams));
      const target = returnFocus.current;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (target?.isConnected) target.focus();
        }),
      );
    }
  };
  return (
    <div {...stylex.props(layout.stack, gap.lg, standalone && styles.full)}>
      <Status>
        Interactive navigation exploration. Records are examples; navigation
        does not save, approve or charge.
      </Status>
      <div {...stylex.props(styles.canvas, standalone && styles.fullCanvas)}>
        <WorkspaceLayout
          title="Sample Cabinet Shop"
          groups={groups}
          activeId={tab?.id ?? ""}
          onNavigate={navigate}
        >
          <div {...stylex.props(layout.stack, gap.lg, styles.frame)}>
            <Breadcrumbs
              onNavigate={navigate}
              items={[
                {
                  id: "business",
                  label: "Sample Cabinet Shop",
                  href: workspaceHref(
                    defaultPath,
                    pageParams(route.url.searchParams),
                  ),
                },
                ...(route.group
                  ? [
                      {
                        id: route.group.id,
                        label: route.group.label,
                        href: workspaceHref(
                          route.group.href,
                          pageParams(route.url.searchParams),
                        ),
                      },
                    ]
                  : []),
                ...(tab ? [{ id: tab.id, label: tab.label }] : []),
              ]}
            />
            <h2 ref={heading} tabIndex={-1} {...stylex.props(styles.heading)}>
              {route.notFound ? "Destination unavailable" : tab?.label}
            </h2>
            {route.notFound ? (
              <>
                <Status tone="warning">
                  This link does not identify an available page or record in
                  Sample Cabinet Shop.
                </Status>
                <Button onPress={() => go(defaultPath)}>
                  Return to estimates
                </Button>
              </>
            ) : (
              <>
                {route.queryWarning && (
                  <Status tone="warning">
                    Invalid table criteria. Showing the default table view.
                  </Status>
                )}
                {tab?.id === "directory" && (
                  <Switch
                    label="Include archived customers"
                    selected={
                      route.url.searchParams.get("includeArchived") === "1"
                    }
                    onChange={(selected) => {
                      const params = queryParams(
                        route.url.searchParams,
                        tab.id,
                        { ...route.query, page: 1 },
                      );
                      if (selected) params.set("includeArchived", "1");
                      else params.delete("includeArchived");
                      go(tab.href, params);
                    }}
                  />
                )}
                {all.length > 0 && tab ? (
                  <div ref={tableRoot}>
                    <DataTable
                      label={tab.label}
                      columns={columns}
                      query={route.query}
                      onQueryChange={(query) =>
                        go(
                          route.url.pathname,
                          queryParams(route.url.searchParams, tab.id, query),
                        )
                      }
                      page={{
                        items: matching.slice(
                          (route.query.page - 1) * route.query.pageSize,
                          route.query.page * route.query.pageSize,
                        ),
                        total: matching.length,
                        query: route.query,
                      }}
                      getRowId={(r) => r.id}
                      getRowLabel={(r) => r.name}
                      onOpenRow={(row) => {
                        returnFocus.current =
                          tableRoot.current?.querySelector<HTMLElement>(
                            `[role="row"][data-key="${row.id}"]`,
                          ) ?? null;
                        go(tab.href + "/" + row.id);
                      }}
                      filters={
                        tab.id === "directory"
                          ? [
                              {
                                id: "status",
                                label: "Lifecycle",
                                operators: ["in"],
                                options: [
                                  "lead",
                                  "active",
                                  "completed",
                                  "archived",
                                ].map((value) => ({
                                  value,
                                  label:
                                    value[0].toUpperCase() + value.slice(1),
                                })),
                              },
                            ]
                          : ["estimates", "invoices"].includes(tab.id)
                            ? [
                                {
                                  id: "status",
                                  label: "Status",
                                  operators: ["in"],
                                  options: (tab.id === "invoices"
                                    ? ["Draft", "Issued", "Paid"]
                                    : ["Draft", "Issued", "Accepted"]
                                  ).map((value) => ({ value, label: value })),
                                },
                                {
                                  id: "customer",
                                  label: "Customer",
                                  operators: ["eq"],
                                },
                              ]
                            : []
                      }
                    />
                  </div>
                ) : (
                  <Panel title={tab?.label ?? "Settings"}>
                    <p {...stylex.props(styles.muted)}>
                      {tab?.id === "website"
                        ? "Setup, branding and embedding share this destination."
                        : tab?.id === "pricing"
                          ? "Business pricing and rate configuration."
                          : "Cabinitron subscription and billing preferences."}
                    </p>
                    <p {...stylex.props(styles.muted)}>
                      This exploration demonstrates navigation; settings are not
                      editable here.
                    </p>
                  </Panel>
                )}
              </>
            )}
          </div>
        </WorkspaceLayout>
      </div>
      <SidePanel
        title={record?.name ?? "Record"}
        description={tab?.label}
        open={!!record && !route.notFound}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        footer={
          <>
            <Button onPress={close}>Close record</Button>
            <Button
              icon="link"
              onPress={() => {
                void navigator.clipboard
                  .writeText(window.location.href)
                  .then(() => setCopied(true))
                  .catch(() => setCopied(false));
              }}
            >
              Copy link
            </Button>
          </>
        }
      >
        {record && tab && (
          <div
            ref={recordBody}
            tabIndex={-1}
            aria-label="Record details"
            {...stylex.props(layout.stack, gap.lg)}
          >
            <Breadcrumbs
              onNavigate={navigate}
              items={[
                {
                  id: "list",
                  label: tab.label,
                  href: workspaceHref(
                    tab.href,
                    pageParams(route.url.searchParams),
                  ),
                },
                { id: record.id, label: record.name },
              ]}
            />
            {copied && <Status tone="success">Record link copied.</Status>}
            <SegmentedControl
              label="Record section"
              value={route.detail ?? "overview"}
              onChange={(detail) => {
                const params = new URLSearchParams(route.url.searchParams);
                params.set("detail", detail);
                go(tab.href + "/" + record.id, params);
              }}
              options={[
                { value: "overview", label: "Overview", icon: "view" },
                ...(tab.id === "directory"
                  ? [
                      {
                        value: "contacts",
                        label: "Contacts",
                        icon: "users" as const,
                      },
                      {
                        value: "addresses",
                        label: "Addresses",
                        icon: "globe" as const,
                      },
                    ]
                  : []),
                { value: "related", label: "Related", icon: "link" },
                { value: "activity", label: "Activity", icon: "history" },
              ]}
            />
            {["estimates", "approvals", "invoices"].includes(tab.id) && (
              <ParameterRow label="Saved revision">
                <Select
                  label="Saved revision"
                  value={route.revision}
                  onChange={(event) => {
                    const params = new URLSearchParams(route.url.searchParams);
                    params.set("revision", event.target.value);
                    go(route.url.pathname, params);
                  }}
                >
                  <option value="1">Revision 1</option>
                  <option value="3">Revision 3</option>
                  <option value="2">Revision 2</option>
                </Select>
              </ParameterRow>
            )}
            {tab.id === "directory" ? (
              <CustomerDirectoryProfile
                id={record.id}
                section={route.detail ?? "overview"}
                onOpenChild={(kind, id) => {
                  const params = new URLSearchParams(route.url.searchParams);
                  params.set("detail", kind);
                  go(
                    tab.href + "/" + record.id + "/" + kind + "/" + id,
                    params,
                  );
                }}
                onOpenRelated={(path, revision) => {
                  const params = pageParams(route.url.searchParams);
                  if (revision) params.set("revision", revision);
                  go(path, params);
                }}
              />
            ) : route.detail === "activity" ? (
              <List
                label="Record activity"
                items={[
                  {
                    id: "saved",
                    title: "Saved revision " + (route.revision ?? "3"),
                    metadata: "Example team member · Nov 4",
                  },
                ]}
              />
            ) : route.detail === "related" ? (
              <List
                label="Related records"
                items={[
                  {
                    id: "related",
                    title: relatedTarget.label,
                    metadata:
                      tab.id === "contacts"
                        ? "Estimate · kitchen renovation"
                        : "Customer & contact",
                    actions: [
                      {
                        id: "open",
                        label: "Open " + relatedTarget.label,
                        icon: "external",
                        onAction: () => go(relatedTarget.path),
                      },
                    ],
                  },
                ]}
              />
            ) : (
              <dl {...stylex.props(styles.details)}>
                {[
                  ["Name", record.name],
                  ["Project", record.description],
                  ["Customer", record.customer],
                  ...(["estimates", "invoices"].includes(tab.id)
                    ? [
                        [
                          "Total",
                          new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(record.total / 100),
                        ],
                      ]
                    : []),
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt {...stylex.props(styles.muted)}>{label}</dt>
                    <dd {...stylex.props(styles.value)}>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </SidePanel>
      <Dialog
        title={
          route.subrecord
            ? "displayName" in route.subrecord
              ? route.subrecord.displayName
              : route.subrecord.label
            : "Customer detail"
        }
        open={
          !!route.subrecord && mountedRecord === record?.id && !route.notFound
        }
        onOpenChange={(open) => {
          if (!open && tab && record) {
            const params = new URLSearchParams(route.url.searchParams);
            params.set("detail", route.childKind ?? "overview");
            go(tab.href + "/" + record.id, params);
          }
        }}
        footer={
          <Button
            onPress={() => {
              if (tab && record) {
                const params = new URLSearchParams(route.url.searchParams);
                params.set("detail", route.childKind ?? "overview");
                go(tab.href + "/" + record.id, params);
              }
            }}
          >
            Close detail
          </Button>
        }
      >
        {route.subrecord && (
          <div {...stylex.props(layout.stack, gap.md)}>
            {Object.entries(route.subrecord)
              .filter(([key]) => key !== "id")
              .map(([label, value]) => (
                <ParameterRow
                  key={label}
                  label={
                    (
                      {
                        displayName: "Name",
                        addressType: "Address type",
                        line1: "Street",
                        postalCode: "Postal code",
                        region: "State",
                      } as Record<string, string>
                    )[label] ?? label[0].toUpperCase() + label.slice(1)
                  }
                >
                  <span>{value}</span>
                </ParameterRow>
              ))}
          </div>
        )}
      </Dialog>
      <p {...stylex.props(styles.route)}>
        Link destination: {route.url.pathname + route.url.search}
      </p>
    </div>
  );
}
