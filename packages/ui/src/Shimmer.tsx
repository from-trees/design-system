import * as stylex from "@stylexjs/stylex";
import { color } from "./tokens.stylex";
const sweep = stylex.keyframes({
  from: { backgroundPosition: "200% 0" },
  to: { backgroundPosition: "-200% 0" },
});
const styles = stylex.create({
  base: {
    display: "block",
    flexShrink: 0,
    maxWidth: "100%",
    backgroundColor: color.subtle,
    backgroundImage: `linear-gradient(100deg, ${color.subtle} 20%, ${color.hovered} 40%, ${color.subtle} 60%)`,
    backgroundSize: "200% 100%",
    animationName: {
      default: sweep,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    animationDuration: "1.6s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
    borderRadius: 6,
  },
  circle: { borderRadius: "50%" },
  size: (width: number | string, height: number) => ({ width, height }),
});
export type ShimmerProps = {
  variant?: "line" | "block" | "circle";
  width?: number | string;
  height?: number;
};
/** Decorative placeholder. The owning loading region provides its accessible name and busy state. */
export function Shimmer({ variant = "line", width, height }: ShimmerProps) {
  return (
    <span
      aria-hidden="true"
      data-ft-ui="shimmer"
      {...stylex.props(
        styles.base,
        variant === "circle" && styles.circle,
        styles.size(
          width ?? (variant === "circle" ? 32 : "100%"),
          height ??
            (variant === "block" ? 160 : variant === "circle" ? 32 : 14),
        ),
      )}
    />
  );
}
