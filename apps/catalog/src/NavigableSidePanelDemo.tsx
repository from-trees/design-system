import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Badge,
  Button,
  DataTable,
  NavigableSidePanel,
  Section,
  TextInput,
  type TableColumn,
  type TableQuery,
} from "@from-trees/ui";
import { color, space } from "@from-trees/ui/tokens.stylex";

type ProjectItem = {
  id: string;
  title: string;
  kind: "task" | "deliverable";
  description: string;
  due: string;
  completed?: boolean;
};

type Project = {
  id: string;
  name: string;
  customer: string;
  created: string;
  step: string;
  items: ProjectItem[];
};

const exampleToday = "2026-11-20";
const projects: Project[] = [
  {
    id: "kitchen",
    name: "Kitchen renovation",
    customer: "Alex Morgan",
    created: "2026-11-12",
    step: "Final design confirmation",
    items: [
      {
        id: "appliances",
        title: "Provide appliance specifications",
        kind: "task",
        description: "Send the make and model of each appliance before we finalize the drawings.",
        due: "2026-11-18",
      },
      {
        id: "samples",
        title: "Send finish samples",
        kind: "deliverable",
        description: "We’ll send three oak finish samples for you to review in your kitchen.",
        due: "2026-11-19",
      },
      {
        id: "measurements",
        title: "Confirm site measurements",
        kind: "deliverable",
        description: "Our team measured the kitchen and recorded the final dimensions.",
        due: "2026-11-15",
        completed: true,
      },
    ],
  },
  {
    id: "library",
    name: "Library shelving",
    customer: "Sam Rivera",
    created: "2026-11-04",
    step: "Production",
    items: [],
  },
  {
    id: "vanity",
    name: "Oak vanity",
    customer: "Jordan Chen",
    created: "2026-10-23",
    step: "Delivery",
    items: [],
  },
];
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const formatDate = (date: string) => dateFormatter.format(new Date(date));

function overdueColumn(kind: ProjectItem["kind"], label: string): TableColumn<Project> {
  return {
    id: kind,
    label,
    kind: "status",
    value: (project) => {
      const count = project.items.filter(
        (item) => item.kind === kind && !item.completed && item.due && item.due < exampleToday,
      ).length;
      return { label: count ? `${count} overdue` : "None", tone: count ? "warning" : "neutral" };
    },
  };
}

const columns: TableColumn<Project>[] = [
  { id: "project", label: "Project", kind: "text", value: (project) => project.name },
  { id: "customer", label: "Customer", kind: "text", value: (project) => project.customer },
  { id: "created", label: "Created", kind: "date", sortable: true, value: (project) => project.created },
  {
    id: "status", label: "Status", kind: "status",
    value: (project) => ({ label: project.step, tone: "neutral" }),
  },
  overdueColumn("task", "Customer tasks overdue"),
  overdueColumn("deliverable", "Shop deliverables overdue"),
];

const styles = stylex.create({
  stack: { display: "grid", gap: space.md },
  rows: { listStyle: "none", padding: 0, margin: 0 },
  row: {
    display: "flex",
    gap: space.sm,
    alignItems: "baseline",
    justifyContent: "space-between",
    flexWrap: "wrap",
    paddingBlock: space.sm,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  date: { color: color.muted },
  paragraph: { margin: 0 },
});

export function NavigableSidePanelDemo() {
  const [records, setRecords] = useState(projects);
  const [query, setQuery] = useState<TableQuery>({
    search: "", filters: {}, sort: { key: "created", direction: "descending" }, page: 1, pageSize: 10,
  });
  const [projectId, setProjectId] = useState<string>();
  const [itemId, setItemId] = useState<string>();
  const [due, setDue] = useState("");
  const project = records.find((record) => record.id === projectId);
  const item = project?.items.find((entry) => entry.id === itemId);
  const search = query.search.toLocaleLowerCase("en-US");
  const matches = records.filter((record) =>
    [record.name, record.customer].some((value) => value.toLocaleLowerCase("en-US").includes(search)),
  );
  const direction = query.sort?.direction === "ascending" ? 1 : -1;
  matches.sort((a, b) => direction * a.created.localeCompare(b.created));
  const pageStart = (query.page - 1) * query.pageSize;
  const returnToProject = () => setItemId(undefined);

  return (
    <>
      <DataTable
        label="Projects"
        columns={columns}
        query={query}
        onQueryChange={setQuery}
        page={{
          items: matches.slice(pageStart, pageStart + query.pageSize),
          query,
          total: matches.length,
        }}
        getRowId={(record) => record.id}
        getRowLabel={(record) => record.name}
        timeZone="UTC"
        onOpenRow={(record) => setProjectId(record.id)}
      />
      <NavigableSidePanel
        title={item?.title ?? project?.name ?? "Project"}
        description={item ? (item.kind === "task" ? "Customer task" : "Shop deliverable") : project?.customer}
        size="workflow"
        pageKey={item?.id ?? projectId ?? "project"}
        open={!!project}
        onOpenChange={(open) => {
          if (!open) {
            setProjectId(undefined);
            returnToProject();
          }
        }}
        back={item ? { label: "Back to project", onPress: returnToProject } : undefined}
        footer={item && (
          <>
            <Button onPress={returnToProject}>Cancel</Button>
            <Button type="submit" form="project-item-example" variant="primary">Save changes</Button>
          </>
        )}
      >
        {item ? (
          <form
            id="project-item-example"
            {...stylex.props(styles.stack)}
            onSubmit={(event) => {
              event.preventDefault();
              setRecords((current) => current.map((record) =>
                record.id === projectId
                  ? { ...record, items: record.items.map((entry) => entry.id === item.id ? { ...entry, due } : entry) }
                  : record,
              ));
              returnToProject();
            }}
          >
            <p {...stylex.props(styles.paragraph)}>{item.description}</p>
            <TextInput label={item.kind === "task" ? "Due date" : "Expected by"} type="date" value={due} onChange={(event) => setDue(event.target.value)} />
          </form>
        ) : project && (
          <div {...stylex.props(styles.stack)}>
            <div><Badge>{project.step}</Badge></div>
            <p {...stylex.props(styles.paragraph)}>Created {formatDate(project.created)}</p>
            {(["task", "deliverable"] as const).map((kind) => {
              const items = project.items.filter((entry) => entry.kind === kind);
              const title = kind === "task" ? "Customer tasks" : "Shop deliverables";
              return (
                <Section key={kind} title={title}>
                  {items.length ? (
                    <ul {...stylex.props(styles.rows)}>
                      {items.map((entry) => (
                        <li key={entry.id} {...stylex.props(styles.row)}>
                          <Button variant="ghost" onPress={() => {
                            setDue(entry.due);
                            setItemId(entry.id);
                          }}>
                            {entry.title}
                          </Button>
                          <span {...stylex.props(styles.date)}>
                            {entry.completed ? "Completed" : entry.due ? formatDate(entry.due) : "No due date"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : <p {...stylex.props(styles.paragraph)}>No {title.toLowerCase()}.</p>}
                </Section>
              );
            })}
          </div>
        )}
      </NavigableSidePanel>
    </>
  );
}
