import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  History,
  Info,
  Link,
  Maximize2,
  MoreHorizontal,
  Move,
  Pencil,
  Plus,
  Redo2,
  RotateCw,
  Ruler,
  Save,
  Search,
  Settings2,
  Share2,
  Trash2,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react";
const icons = {
  add: Plus,
  close: X,
  copy: Copy,
  delete: Trash2,
  edit: Pencil,
  save: Save,
  export: Download,
  share: Share2,
  link: Link,
  history: History,
  settings: Settings2,
  undo: Undo2,
  redo: Redo2,
  more: MoreHorizontal,
  check: Check,
  info: Info,
  search: Search,
  external: ExternalLink,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  width: ArrowLeftRight,
  height: ArrowUpDown,
  depth: Maximize2,
  offset: Move,
  ground: ArrowDownToLine,
  rotation: RotateCw,
  ruler: Ruler,
  view: Eye,
} satisfies Record<string, LucideIcon>;
export type IconName = keyof typeof icons;
export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const Component = icons[name];
  return (
    <Component
      size={size}
      strokeWidth={1.75}
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    />
  );
}
