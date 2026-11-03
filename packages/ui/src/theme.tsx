import { createContext, useContext, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";

export type Theme = "forest" | "slate" | "dark";
export type Density = "comfortable" | "compact";
const forest = stylex.createTheme(color, {});
const slate = stylex.createTheme(color, {
  accent: "#3858a0",
  accentHover: "#2a4484",
  hovered: "#e9edf7",
  success: "#276343",
});
const dark = stylex.createTheme(color, {
  canvas: "#17221d",
  surface: "#202e26",
  subtle: "#28372e",
  hovered: "#35473b",
  ink: "#edf2ed",
  muted: "#abb9ad",
  border: "#45574a",
  accent: "#a5cfb0",
  accentHover: "#bedec7",
  onAccent: "#17271c",
  focus: "#8bc2fa",
  danger: "#ffaaa2",
  dangerSurface: "#482c2a",
  success: "#a5d8b5",
  successSurface: "#253e2d",
  warning: "#edcd83",
  warningSurface: "#40381f",
  overlay: "#07130db3",
});
const themes = { forest, slate, dark };
const comfortable = stylex.createTheme(metrics, {});
const compact = stylex.createTheme(metrics, {
  control: "32px",
  fieldGap: "8px",
  sectionGap: "16px",
  panelPadding: "16px",
  font: "13px",
});
const densities = { comfortable, compact };
const ThemeContext = createContext<{ theme: Theme; density: Density }>({
  theme: "forest",
  density: "comfortable",
});
const styles = stylex.create({
  root: {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
    fontSize: metrics.font,
    lineHeight: 1.5,
    color: color.ink,
    colorScheme: "light",
  },
  dark: { colorScheme: "dark" },
});
export function useThemeStyles() {
  const { theme, density } = useContext(ThemeContext);
  return [
    themes[theme],
    densities[density],
    styles.root,
    theme === "dark" && styles.dark,
  ];
}
export function ThemeProvider({
  theme = "forest",
  density = "comfortable",
  children,
}: {
  theme?: Theme;
  density?: Density;
  children: ReactNode;
}) {
  return (
    <ThemeContext.Provider value={{ theme, density }}>
      <div
        {...stylex.props(
          themes[theme],
          densities[density],
          styles.root,
          theme === "dark" && styles.dark,
        )}
        data-theme={theme}
        data-density={density}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
