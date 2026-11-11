import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Button,
  DataTable,
  Switch,
  Status,
  type TableColumn,
  type TableQuery,
} from "@from-trees/ui";
import { layout, gap } from "@from-trees/ui/utilities";
const artwork = (body: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#eeeae0"/>${body}</svg>`)}`;
const wood = artwork(
  '<rect width="96" height="96" fill="#ac794d"/><path d="M12 0q26 24 0 48T12 96M30 0q-18 24 0 48T30 96M54 0q20 24 0 48T54 96M77 0q-25 24 0 48T77 96" stroke="#704c30" stroke-width="3" fill="none"/>',
);
const object = artwork(
  '<path d="M28 76V36a20 20 0 0 1 40 0v10" fill="none" stroke="#777e83" stroke-width="9"/><path d="M16 80h26M58 49h20M46 57h12v23" stroke="#777e83" stroke-width="7"/>',
);
const records = [
  {
    id: "wood",
    name: "Natural wood",
    type: "Texture",
    detail: "Color and surface maps",
    src: wood,
  },
  {
    id: "object",
    name: "Brushed fixture",
    type: "Object",
    detail: "Prepared object image",
    src: object,
  },
  {
    id: "missing",
    name: "Unpictured item",
    type: "Object",
    detail: "No preview supplied",
    src: undefined,
  },
  {
    id: "error",
    name: "Unavailable image",
    type: "Texture",
    detail: "Failed image falls back to an icon",
    src: "/catalog-thumbnail-unavailable.png",
  },
];
/** Synthetic artwork only: applications own model rendering and texture asset URLs. */
export function ThumbnailTableDemo() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState<TableQuery>({
    search: "",
    filters: {},
    sort: null,
    page: 1,
    pageSize: 10,
  });
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, [loading]);
  const columns: TableColumn<(typeof records)[number]>[] = [
    {
      id: "name",
      label: "Item",
      kind: "text",
      value: (r) => r.name,
      metadata: (r) => r.detail,
      thumbnail: show
        ? (r) => ({
            src: loading && r.src ? undefined : r.src,
            loading: loading && !!r.src,
            fit: r.type === "Texture" ? "cover" : "contain",
          })
        : undefined,
    },
    { id: "type", label: "Type", kind: "text", value: (r) => r.type },
  ];
  const items = records.filter((r) =>
    `${r.name} ${r.type}`.toLowerCase().includes(query.search.toLowerCase()),
  );
  return (
    <section
      aria-label="Thumbnail rows"
      {...stylex.props(layout.stack, gap.md)}
    >
      <h3>Library rows with thumbnails</h3>
      <p>
        Thumbnails sit beside the item name. Images shimmer while loading;
        missing or failed previews use an icon. The row name and actions stay
        available.
      </p>
      <Switch selected={show} onChange={setShow} label="Show row thumbnails" />
      <Button isDisabled={!show || loading} onPress={() => setLoading(true)}>
        Simulate preview loading
      </Button>
      <DataTable
        label="Library thumbnail examples"
        columns={columns}
        query={query}
        onQueryChange={setQuery}
        page={{ query, items, total: items.length }}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
        onOpenRow={(r) => setNotice(`Opened ${r.name}`)}
      />
      {notice && <Status>{notice}</Status>}
    </section>
  );
}
