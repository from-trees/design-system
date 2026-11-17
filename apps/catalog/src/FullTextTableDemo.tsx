import { useState } from "react";
import { DataTable, type TableQuery } from "@from-trees/ui";

const names = [
  "Sample Home — Large Bathroom + Shower Duplicate v2",
  "Sample Home — Large Bathroom + Shower Duplicate",
  "Sample Home — A long design name with room details, finish choices, and revision notes that use the available horizontal column space before truncating",
  "AnUnbrokenDesignName".repeat(12),
];
const items = names.map((name, i) => ({
  id: String(i),
  name,
  revision: 184 - i,
}));

export function FullTextTableDemo() {
  const [query, setQuery] = useState<TableQuery>({
    search: "",
    filters: {},
    sort: null,
    page: 1,
    pageSize: 10,
  });
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.search.toLowerCase()),
  );
  return (
    <section>
      <h3>Single-line text using the column width</h3>
      <p>
        Names stay on one line and use the available column width, with ellipsis
        only at the column edge.
      </p>
      <DataTable
        label="Full design names"
        columns={[
          {
            id: "name",
            label: "Design",
            kind: "text",
            fillWidth: true,
            value: (item) => item.name,
          },
          {
            id: "revision",
            label: "Revision",
            kind: "number",
            value: (item) => item.revision,
          },
        ]}
        query={query}
        onQueryChange={setQuery}
        page={{
          items: filtered,
          total: filtered.length,
          query,
        }}
        getRowId={(item) => item.id}
        getRowLabel={(item) => item.name}
      />
    </section>
  );
}
