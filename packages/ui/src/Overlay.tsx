import { useId, type ReactNode } from "react";
import {
  ModalOverlay,
  Modal,
  Dialog as AriaDialog,
  Heading,
} from "react-aria-components";
import * as stylex from "@stylexjs/stylex";
import { color, metrics } from "./tokens.stylex";
import { Button } from "./Button";
import { useThemeStyles } from "./theme";
export type OverlayProps = {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
};
export type DialogProps = OverlayProps & {
  size?: "default" | "fullscreen" | "workflow";
};
export type SidePanelProps = OverlayProps & {
  size?: "default" | "workflow" | "wide-workflow";
};
const slideIn = stylex.keyframes({
  from: { transform: "translateX(100%)" },
  to: { transform: "translateX(0)" },
});
const slideOut = stylex.keyframes({
  from: { transform: "translateX(0)" },
  to: { transform: "translateX(100%)" },
});
const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    overflow: "hidden",
    backgroundColor: color.overlay,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    boxSizing: "border-box",
  },
  fullscreenOverlay: { padding: 0 },
  workflowOverlay: {
    padding: { default: 24, "@media (max-width: 640px)": 12 },
  },
  workflow: {
    width: "min(1440px, 100%)",
    height: {
      default: "calc(100dvh - 48px)",
      "@media (max-width: 640px)": "calc(100dvh - 24px)",
    },
    maxHeight: "100%",
  },
  fullscreen: {
    width: "100vw",
    height: "100dvh",
    maxHeight: "100dvh",
    borderWidth: 0,
    borderRadius: 0,
  },
  drawerOverlay: { justifyContent: "flex-end", padding: 0 },
  modal: {
    boxSizing: "border-box",
    width: "min(520px, 100%)",
    maxHeight: "calc(100dvh - 40px)",
    backgroundColor: color.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 12,
    boxShadow: "0 20px 80px #071a2030",
    overflow: "hidden",
  },
  drawer: {
    width: "min(480px, 100vw)",
    height: "100dvh",
    maxHeight: "100dvh",
    borderRadius: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  workflowDrawer: {
    width: "min(640px, 100vw)",
    animationName: {
      default: "none",
      ":is([data-entering])": slideIn,
      ":is([data-exiting])": slideOut,
    },
    animationDuration: {
      default: "220ms",
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    animationTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
  },
  wideWorkflowDrawer: { width: "min(1100px, 100vw)" },
  dialog: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    maxHeight: "inherit",
    outline: "none",
  },
  drawerDialog: { height: "100%" },
  header: {
    minWidth: 0,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: metrics.panelPadding,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
    flexShrink: 0,
  },
  title: {
    fontFamily: "inherit",
    fontStyle: "normal",
    lineHeight: 1.3,
    whiteSpace: "normal",
    fontSize: 18,
    letterSpacing: "-0.02em",
    fontWeight: 650,
    margin: 0,
  },
  description: {
    fontSize: 13,
    color: color.muted,
    marginTop: 5,
    marginBottom: 0,
  },
  body: {
    minWidth: 0,
    boxSizing: "border-box",
    padding: metrics.panelPadding,
    overflowY: "auto",
    overscrollBehavior: "contain",
    minHeight: 0,
    flexGrow: 1,
  },
  footer: {
    minWidth: 0,
    boxSizing: "border-box",
    backgroundColor: color.surface,
    color: color.ink,
    margin: 0,
    padding: metrics.panelPadding,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.border,
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    flexShrink: 0,
    flexWrap: "wrap",
  },
});
function Overlay({
  title,
  description,
  open,
  onOpenChange,
  children,
  footer,
  dismissible = true,
  side = false,
  fullScreen = false,
  workflow = false,
  workflowPanel = false,
  wideWorkflowPanel = false,
}: OverlayProps & {
  side?: boolean;
  fullScreen?: boolean;
  workflow?: boolean;
  workflowPanel?: boolean;
  wideWorkflowPanel?: boolean;
}) {
  const theme = useThemeStyles();
  const descriptionId = useId();
  return (
    <ModalOverlay
      data-ft-ui="overlay"
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable={dismissible}
      isKeyboardDismissDisabled={!dismissible}
      {...stylex.props(
        theme,
        styles.overlay,
        side && styles.drawerOverlay,
        fullScreen && styles.fullscreenOverlay,
        workflow && styles.workflowOverlay,
      )}
    >
      <Modal
        {...stylex.props(
          styles.modal,
          side && styles.drawer,
          fullScreen && styles.fullscreen,
          workflow && styles.workflow,
          workflowPanel && styles.workflowDrawer,
          wideWorkflowPanel && styles.wideWorkflowDrawer,
        )}
      >
        <AriaDialog
          aria-describedby={description ? descriptionId : undefined}
          {...stylex.props(
            styles.dialog,
            (side || fullScreen || workflow) && styles.drawerDialog,
          )}
        >
          <header {...stylex.props(styles.header)}>
            <div>
              <Heading slot="title" {...stylex.props(styles.title)}>
                {title}
              </Heading>
              {description && (
                <p id={descriptionId} {...stylex.props(styles.description)}>
                  {description}
                </p>
              )}
            </div>
            {dismissible && (
              <Button
                variant="ghost"
                icon="close"
                aria-label={`Close ${title}`}
                onPress={() => onOpenChange(false)}
              />
            )}
          </header>
          <div {...stylex.props(styles.body)}>{children}</div>
          {footer && <footer {...stylex.props(styles.footer)}>{footer}</footer>}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
export function Dialog({ size = "default", ...props }: DialogProps) {
  return (
    <Overlay
      {...props}
      fullScreen={size === "fullscreen"}
      workflow={size === "workflow"}
    />
  );
}
export function SidePanel({ size = "default", ...props }: SidePanelProps) {
  return (
    <Overlay
      {...props}
      side
      workflowPanel={size !== "default"}
      wideWorkflowPanel={size === "wide-workflow"}
    />
  );
}
