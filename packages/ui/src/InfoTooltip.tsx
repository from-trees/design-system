import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Tooltip, TooltipTrigger } from "react-aria-components";
import * as stylex from "@stylexjs/stylex";
import { color } from "./tokens.stylex";
import { useThemeStyles } from "./theme";
import { Icon } from "./Icon";

export type InfoTooltipProps = { label: string; children: ReactNode };
const styles = stylex.create({
  trigger: {
    boxSizing: "border-box",
    margin: 0,
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 24,
    height: 24,
    borderWidth: 0,
    borderRadius: "50%",
    backgroundColor: { default: "transparent", ":hover": color.hovered },
    color: color.muted,
    cursor: "help",
    outline: { default: "none", ":focus-visible": `2px solid ${color.focus}` },
    outlineOffset: 2,
  },
  tooltip: {
    boxSizing: "border-box",
    maxWidth: "min(300px, calc(100vw - 24px))",
    paddingBlock: 10,
    paddingInline: 12,
    borderRadius: 7,
    backgroundColor: color.ink,
    color: color.surface,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.5,
    whiteSpace: "pre-line",
    overflowWrap: "anywhere",
    boxShadow: "0 3px 12px #0002",
    zIndex: 300,
  },
});

/** Optional, non-interactive elaboration; labels and validation remain visible. */
export function InfoTooltip({ label, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const hoveringTooltip = useRef(false);
  const pressedOpen = useRef(false);
  const theme = useThemeStyles();
  useEffect(() => {
    if (!open) {
      hoveringTooltip.current = false;
      pressedOpen.current = false;
      return;
    }
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !trigger.current?.contains(event.target) &&
        !tooltip.current?.contains(event.target)
      )
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hoveringTooltip.current = false;
        pressedOpen.current = false;
        setOpen(false);
        event.stopPropagation();
      }
    };
    document.addEventListener("pointerdown", dismiss, true);
    document.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss, true);
      document.removeEventListener("keydown", escape, true);
    };
  }, [open]);
  return (
    <TooltipTrigger
      isOpen={open}
      onOpenChange={(next) => {
        if (next || !hoveringTooltip.current) setOpen(next);
      }}
      delay={350}
      closeDelay={150}
      shouldCloseOnPress={false}
    >
      <Button
        ref={trigger}
        aria-label={`About ${label}`}
        onPress={() => {
          pressedOpen.current = !pressedOpen.current;
          setOpen(pressedOpen.current);
        }}
        onBlur={() => {
          pressedOpen.current = false;
          if (!hoveringTooltip.current) setOpen(false);
        }}
        {...stylex.props(styles.trigger)}
      >
        <Icon name="info" size={16} />
      </Button>
      <Tooltip
        ref={tooltip}
        UNSTABLE_portalContainer={
          trigger.current?.closest('[role="dialog"], dialog') ?? undefined
        }
        placement="top"
        offset={8}
        onPointerEnter={() => {
          hoveringTooltip.current = true;
          setOpen(true);
        }}
        onPointerLeave={() => {
          hoveringTooltip.current = false;
          if (document.activeElement !== trigger.current) setOpen(false);
        }}
        {...stylex.props(theme, styles.tooltip)}
      >
        {children}
      </Tooltip>
    </TooltipTrigger>
  );
}
