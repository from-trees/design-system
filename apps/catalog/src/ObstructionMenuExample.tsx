import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { WorkspaceHeader, type MenuControlGroup } from "@from-trees/ui";
import { color } from "@from-trees/ui/tokens.stylex";
import { layout, gap, padding } from "@from-trees/ui/utilities";
const styles = stylex.create({
  frame: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  viewport: {
    minHeight: 330,
    backgroundColor: color.subtle,
    color: color.muted,
  },
});
const options = [
  { value: "full", label: "Solid" },
  { value: "ghost", label: "Ghost" },
  { value: "hidden", label: "Hide" },
];
export function ObstructionMenuExample() {
  const [walls, setWalls] = useState("ghost"),
    [objects, setObjects] = useState("ghost"),
    [notice, setNotice] = useState("");
  const groups: MenuControlGroup[] = [
    {
      id: "obstruction",
      label: "Obstruction",
      help: "Walls follow the camera. Fully framed objects stay solid; object modes apply to cropped foreground blockers.",
      controls: [
        {
          id: "walls",
          label: "Walls",
          value: walls,
          onChange: setWalls,
          options,
        },
        {
          id: "objects",
          label: "Objects",
          value: objects,
          onChange: setObjects,
          options,
        },
      ],
    },
  ];
  return (
    <div {...stylex.props(styles.frame)}>
      <WorkspaceHeader
        title="3D"
        compact
        label="3D commands"
        menuLabel="3D navigation"
        menuIcon="pan"
        primary={{
          id: "photo",
          label: "Take Photo",
          icon: "camera",
          onAction: () => setNotice("Take Photo selected"),
        }}
        actions={[
          {
            id: "zoom-out",
            label: "Zoom out 3D",
            icon: "zoomOut",
            onAction: () => setNotice("Zoom out selected"),
          },
          {
            id: "zoom-in",
            label: "Zoom in 3D",
            icon: "zoomIn",
            onAction: () => setNotice("Zoom in selected"),
          },
          {
            id: "fit",
            label: "Fit",
            icon: "fit",
            onAction: () => setNotice("Fit selected"),
          },
          {
            id: "pan",
            label: "Pan",
            icon: "pan",
            onAction: () => setNotice("Pan selected"),
          },
          {
            id: "photo-settings",
            label: "Photo settings",
            icon: "settings",
            onAction: () => setNotice("Photo settings selected"),
          },
        ]}
        menuGroups={groups}
      />
      <div
        aria-label="3D viewport example"
        {...stylex.props(layout.stack, gap.sm, padding.lg, styles.viewport)}
      >
        <span>3D viewport</span>
        <span role="status">
          Walls: {options.find((option) => option.value === walls)?.label} ·
          Objects: {options.find((option) => option.value === objects)?.label}
          {notice ? ` · ${notice}` : ""}
        </span>
      </div>
    </div>
  );
}
