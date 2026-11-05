import {
  useEffect,
  useRef,
  useId,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import * as stylex from "@stylexjs/stylex";
import { color, metrics, space } from "./tokens.stylex";
import { layout, gap } from "./utilities";
import { Icon, type IconName } from "./Icon";
import { IconButton } from "./Button";
import { SidePanel } from "./Overlay";
export type NavigationDestination = { id: string; href: string };
export type NavigationItem = NavigationDestination & {
  label: string;
  icon?: IconName;
};
export type NavigationGroup = NavigationDestination & {
  label: string;
  items: readonly NavigationItem[];
};
export type NavigationHandler = (destination: NavigationDestination) => void;
const narrow = "@container workspace (max-width: 760px)";
const styles = stylex.create({
  container: {
    containerType: "inline-size",
    containerName: "workspace",
    width: "100%",
    height: "100%",
    minWidth: 0,
  },
  shell: {
    height: "100%",
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: {
      default: "216px minmax(0,1fr)",
      [narrow]: "minmax(0,1fr)",
    },
    backgroundColor: color.canvas,
    color: color.ink,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: metrics.radius,
    overflow: "clip",
    minWidth: 0,
  },
  page: { display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 },
  sidebar: {
    minHeight: 0,
    overflowY: "auto",
    display: { default: "flex", [narrow]: "none" },
    flexDirection: "column",
    gap: space.lg,
    padding: space.lg,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: color.border,
    backgroundColor: color.surface,
  },
  brand: {
    margin: 0,
    fontSize: metrics.font,
    fontWeight: 650,
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },
  mobile: {
    display: { default: "none", [narrow]: "flex" },
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    padding: space.md,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
    backgroundColor: color.surface,
  },
  content: {
    minWidth: 0,
    minHeight: 0,
    overflowY: "auto",
    flexGrow: 1,
    padding: space.lg,
  },
  nav: { display: "flex", flexDirection: "column", gap: space.lg, minWidth: 0 },
  group: { margin: 0, padding: 0, borderWidth: 0, minWidth: 0 },
  heading: {
    display: "inline-flex",
    fontSize: 11,
    fontWeight: 650,
    lineHeight: 1.5,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    textDecoration: "none",
    color: { default: color.muted, ":hover": color.ink },
    marginBottom: space.xs,
    paddingBlock: space.xs,
    paddingInline: space.sm,
    borderRadius: metrics.radius,
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 2,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    listStyleType: "none",
    margin: 0,
    padding: 0,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    minHeight: metrics.control,
    boxSizing: "border-box",
    paddingBlock: space.xs,
    paddingInline: space.sm,
    borderRadius: metrics.radius,
    fontSize: metrics.font,
    lineHeight: 1.4,
    textDecoration: "none",
    color: color.ink,
    backgroundColor: { default: "transparent", ":hover": color.hovered },
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 2,
  },
  active: {
    backgroundColor: { default: color.hovered, ":hover": color.hovered },
    color: color.accent,
    fontWeight: 650,
  },
  label: { overflowWrap: "anywhere", minWidth: 0 },
  crumbs: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    flexWrap: "wrap",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    fontSize: metrics.small,
    lineHeight: 1.5,
  },
  crumb: {
    color: color.muted,
    textDecoration: { default: "none", ":hover": "underline" },
    borderRadius: 2,
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 3,
  },
  current: { color: color.ink, fontWeight: 550 },
});
// Keep native modified-click and copy-link behavior for application-provided URLs.
function activate(
  event: MouseEvent<HTMLAnchorElement>,
  destination: NavigationDestination,
  onNavigate?: NavigationHandler,
) {
  if (
    !onNavigate ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  onNavigate(destination);
}
export function GroupedNavigation({
  groups,
  activeId,
  label = "Workspace",
  onNavigate,
}: {
  groups: readonly NavigationGroup[];
  activeId: string;
  label?: string;
  onNavigate?: NavigationHandler;
}) {
  const prefix = useId();
  return (
    <nav aria-label={label} {...stylex.props(styles.nav)}>
      {groups.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`${prefix}-${group.id}`}
          {...stylex.props(styles.group)}
        >
          <a
            id={`${prefix}-${group.id}`}
            href={group.href}
            onClick={(event) => activate(event, group, onNavigate)}
            aria-current={activeId === group.id ? "page" : undefined}
            {...stylex.props(styles.heading)}
          >
            {group.label}
          </a>
          <ul {...stylex.props(styles.list)}>
            {group.items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  aria-current={activeId === item.id ? "page" : undefined}
                  onClick={(event) => activate(event, item, onNavigate)}
                  {...stylex.props(
                    styles.link,
                    activeId === item.id && styles.active,
                  )}
                >
                  {item.icon && <Icon name={item.icon} />}
                  <span {...stylex.props(styles.label)}>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
export function Breadcrumbs({
  items,
  label = "Breadcrumb",
  onNavigate,
}: {
  items: readonly { id: string; label: string; href?: string }[];
  label?: string;
  onNavigate?: NavigationHandler;
}) {
  return (
    <nav aria-label={label}>
      <ol {...stylex.props(styles.crumbs)}>
        {items.map((item, index) => (
          <li key={item.id} {...stylex.props(layout.row, gap.xs)}>
            {index > 0 && <Icon name="chevronRight" size={12} />}{" "}
            {item.href && index < items.length - 1 ? (
              <a
                href={item.href}
                onClick={(event) =>
                  activate(event, { id: item.id, href: item.href! }, onNavigate)
                }
                {...stylex.props(styles.crumb)}
              >
                {item.label}
              </a>
            ) : (
              <span
                aria-current={index === items.length - 1 ? "page" : undefined}
                {...stylex.props(
                  index === items.length - 1 ? styles.current : styles.crumb,
                )}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
/** Controlled links and selection. Routing, persistence and permissions belong to the application. */
export function WorkspaceLayout({
  title,
  groups,
  activeId,
  onNavigate,
  children,
}: {
  title: string;
  groups: readonly NavigationGroup[];
  activeId: string;
  onNavigate?: NavigationHandler;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    const container = sidebar.current;
    const current = container?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    if (!container || !current) return;
    const outer = container.getBoundingClientRect(),
      inner = current.getBoundingClientRect();
    if (inner.bottom > outer.bottom)
      container.scrollTop += inner.bottom - outer.bottom + 8;
    else if (inner.top < outer.top)
      container.scrollTop -= outer.top - inner.top + 8;
  }, [activeId]);
  const navigate: NavigationHandler | undefined = onNavigate
    ? (destination) => {
        setOpen(false);
        onNavigate(destination);
      }
    : undefined;
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.shell)}>
        <aside ref={sidebar} {...stylex.props(styles.sidebar)}>
          <p {...stylex.props(styles.brand)}>{title}</p>
          <GroupedNavigation
            groups={groups}
            activeId={activeId}
            onNavigate={onNavigate}
          />
        </aside>
        <div {...stylex.props(styles.page)}>
          <header {...stylex.props(styles.mobile)}>
            <span {...stylex.props(styles.brand)}>{title}</span>
            <IconButton
              icon="menu"
              label="Open workspace navigation"
              onPress={() => setOpen(true)}
            />
          </header>
          <div
            role="region"
            aria-label="Workspace content"
            tabIndex={0}
            {...stylex.props(styles.content)}
          >
            {children}
          </div>
        </div>
      </div>
      <SidePanel
        title="Workspace navigation"
        description={title}
        open={open}
        onOpenChange={setOpen}
      >
        <GroupedNavigation
          groups={groups}
          activeId={activeId}
          onNavigate={navigate}
        />
      </SidePanel>
    </div>
  );
}
