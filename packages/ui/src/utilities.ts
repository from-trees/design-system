import * as stylex from "@stylexjs/stylex";
import { space } from "./tokens.stylex";

/** Structural utilities. Compose with gap/padding; application styles go last. */
export const layout = stylex.create({
  row: { display: "flex", flexDirection: "row", minWidth: 0 },
  stack: { display: "flex", flexDirection: "column", minWidth: 0 },
  wrap: { flexWrap: "wrap" },
  alignCenter: { alignItems: "center" },
  alignStart: { alignItems: "flex-start" },
  alignStretch: { alignItems: "stretch" },
  between: { justifyContent: "space-between" },
  grow: { flexGrow: 1, minWidth: 0 },
});

// Keep definitions static so consuming StyleX compilers can extract each class.
export const gap = stylex.create({
  none: { gap: 0 },
  xs: { gap: space.xs },
  sm: { gap: space.sm },
  md: { gap: space.md },
  lg: { gap: space.lg },
  xl: { gap: space.xl },
  xxl: { gap: space.xxl },
});

export const padding = stylex.create({
  none: { padding: 0 },
  xs: { padding: space.xs },
  sm: { padding: space.sm },
  md: { padding: space.md },
  lg: { padding: space.lg },
  xl: { padding: space.xl },
  xxl: { padding: space.xxl },
});

export const paddingBlock = stylex.create({
  none: { paddingBlock: 0 },
  xs: { paddingBlock: space.xs },
  sm: { paddingBlock: space.sm },
  md: { paddingBlock: space.md },
  lg: { paddingBlock: space.lg },
  xl: { paddingBlock: space.xl },
  xxl: { paddingBlock: space.xxl },
});

export const paddingInline = stylex.create({
  none: { paddingInline: 0 },
  xs: { paddingInline: space.xs },
  sm: { paddingInline: space.sm },
  md: { paddingInline: space.md },
  lg: { paddingInline: space.lg },
  xl: { paddingInline: space.xl },
  xxl: { paddingInline: space.xxl },
});

export const margin = stylex.create({
  none: { margin: 0 },
  xs: { margin: space.xs },
  sm: { margin: space.sm },
  md: { margin: space.md },
  lg: { margin: space.lg },
  xl: { margin: space.xl },
  xxl: { margin: space.xxl },
});

export const marginBlock = stylex.create({
  none: { marginBlock: 0 },
  xs: { marginBlock: space.xs },
  sm: { marginBlock: space.sm },
  md: { marginBlock: space.md },
  lg: { marginBlock: space.lg },
  xl: { marginBlock: space.xl },
  xxl: { marginBlock: space.xxl },
});

export const marginInline = stylex.create({
  none: { marginInline: 0 },
  xs: { marginInline: space.xs },
  sm: { marginInline: space.sm },
  md: { marginInline: space.md },
  lg: { marginInline: space.lg },
  xl: { marginInline: space.xl },
  xxl: { marginInline: space.xxl },
});
