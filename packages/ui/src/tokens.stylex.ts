import * as stylex from "@stylexjs/stylex";

export const color = stylex.defineVars({
  canvas: "#f6f7f5",
  surface: "#ffffff",
  subtle: "#f0f2ef",
  hovered: "#e7ece6",
  ink: "#202c25",
  muted: "#626f65",
  border: "#d8dfd7",
  accent: "#315d46",
  accentHover: "#234a35",
  onAccent: "#ffffff",
  focus: "#3679bb",
  danger: "#ae3632",
  dangerSurface: "#fbeeed",
  success: "#276343",
  successSurface: "#eaf3ec",
  warning: "#81570d",
  warningSurface: "#fff5dc",
  overlay: "#15251e66",
});
export const metrics = stylex.defineVars({
  control: "38px",
  fieldGap: "12px",
  sectionGap: "20px",
  panelPadding: "20px",
  font: "14px",
  small: "12px",
  radius: "7px",
});
export const space = stylex.defineVars({
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
});
