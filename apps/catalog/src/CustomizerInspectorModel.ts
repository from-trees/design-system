/** Synthetic catalog state only. Cabinitron owns its actual geometry and persistence. */
export type DrawerOptions = {
  method: string;
  fingerHeight: number;
  fingerDepth: number;
  notch: boolean;
  notchWidth: number;
  notchDepth: number;
  notchOffset: number;
};
export type Part = {
  id: string;
  name: string;
  kind: "Door" | "Drawer array" | "Shelf" | "Back panel" | "Fixed front";
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  z: number;
  face: string;
  backStyle: string;
  independent: boolean;
  shape: string;
  left: string;
  right: string;
  radius: number;
  mechanism: string;
  hinge: string;
  travel: number;
  slatSize: number;
  slatDirection: string;
  pull: boolean;
  heights: number[];
  placement: string;
  defaults: DrawerOptions;
  overrides: Partial<DrawerOptions>[];
  stretchers: boolean;
  stretcherThickness: number;
  stretcherDepth: number;
  stretcherSetback: number;
};
export type Cabinet = {
  name: string;
  width: number;
  height: number;
  depth: number;
  reveal: number;
  bottom: boolean;
  arch: boolean;
  left: string;
  right: string;
  radius: number;
  curveScope: string;
  curveProfile: string;
  curveDirection: string;
  curveRadius: number;
  parts: Part[];
};
export const defaultDrawer: DrawerOptions = {
  method: "Pulls",
  fingerHeight: 0.5,
  fingerDepth: 0.375,
  notch: false,
  notchWidth: 6,
  notchDepth: 10,
  notchOffset: 0,
};
export function createPart(kind: Part["kind"], id: string): Part {
  return {
    id,
    kind,
    name: kind,
    width: 28.5,
    height: kind === "Drawer array" ? 30.25 : kind === "Door" ? 32 : 0.75,
    depth: kind === "Shelf" ? 23 : 0.75,
    x: 0.75,
    y: 0.75,
    z: kind === "Door" ? -0.75 : 0,
    face: "inherit",
    backStyle: "Flat",
    independent: false,
    shape: "Rectangular",
    left: "Square",
    right: "Square",
    radius: 4,
    mechanism: "Side-hinged",
    hinge: "Left",
    travel: 24,
    slatSize: 1,
    slatDirection: "Vertical",
    pull: false,
    heights: [6, 10, 14],
    placement: "Internal",
    defaults: { ...defaultDrawer },
    overrides: [{}, {}, {}],
    stretchers: false,
    stretcherThickness: 0.75,
    stretcherDepth: 3,
    stretcherSetback: 0,
  };
}
export function createCabinet(): Cabinet {
  return {
    name: "Base cabinet",
    width: 30,
    height: 34.5,
    depth: 24,
    reveal: 0.125,
    bottom: true,
    arch: false,
    left: "Square",
    right: "Square",
    radius: 4,
    curveScope: "Straight",
    curveProfile: "Arc",
    curveDirection: "Outward",
    curveRadius: 36,
    parts: (
      ["Door", "Drawer array", "Shelf", "Back panel", "Fixed front"] as const
    ).map((kind, i) => createPart(kind, `part-${i + 1}`)),
  };
}
export function equalHeights(height: number, reveal: number, count: number) {
  return Array.from(
    { length: count },
    () => (height - (count - 1) * reveal) / count,
  );
}
/** Review the existing top-to-bottom editing convention; production uses Cabinitron's math. */
export function resizeDrawer(part: Part, row: number, height: number) {
  const heights = [...part.heights];
  let delta = height - heights[row];
  heights[row] = height;
  for (let i = heights.length - 1; i >= 0 && Math.abs(delta) > 1e-8; i--) {
    if (i === row) continue;
    const amount = delta > 0 ? Math.min(delta, heights[i] - 2) : delta;
    heights[i] -= amount;
    delta -= amount;
  }
  return heights;
}
