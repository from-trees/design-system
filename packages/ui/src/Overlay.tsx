import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
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
  headerActions?: ReactNode;
  dismissible?: boolean;
};
export type DialogProps = OverlayProps & {
  size?: "default" | "fullscreen" | "workflow";
};
export type SidePanelProps = OverlayProps & {
  size?: "default" | "workflow" | "wide-workflow";
};
export type NavigableSidePanelProps = SidePanelProps & {
  pageKey: string;
  depth?: number;
  back?: { label: string; onPress: () => void };
};
const slideIn = stylex.keyframes({
  from: { transform: "translateX(100%)" },
  to: { transform: "translateX(0)" },
});
const slideOut = stylex.keyframes({
  from: { transform: "translateX(0)" },
  to: { transform: "translateX(100%)" },
});
const forwardPage = stylex.keyframes({
  from: { transform: "translateX(24px)", opacity: 0.65 },
  to: { transform: "translateX(0)", opacity: 1 },
});
const backPage = stylex.keyframes({
  from: { transform: "translateX(-24px)", opacity: 0.65 },
  to: { transform: "translateX(0)", opacity: 1 },
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
  page: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    animationName: {
      default: "none",
      "@media (prefers-reduced-motion: no-preference)": {
        ":is([data-transition=forward])": forwardPage,
        ":is([data-transition=back])": backPage,
      },
    },
    animationDuration: "180ms",
    animationTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
  },
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
  headerActions: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  back: { marginBottom: 8 },
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
  headerActions,
  dismissible = true,
  side = false,
  fullScreen = false,
  workflow = false,
  workflowPanel = false,
  wideWorkflowPanel = false,
  navigation,
}: OverlayProps & {
  side?: boolean;
  fullScreen?: boolean;
  workflow?: boolean;
  workflowPanel?: boolean;
  wideWorkflowPanel?: boolean;
  navigation?: Pick<NavigableSidePanelProps, "pageKey" | "depth" | "back">;
}) {
  const theme = useThemeStyles();
  const descriptionId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const previousPage = useRef<{ key: string; depth: number }>();
  const pageKey = navigation?.pageKey;
  const depth = navigation?.depth ?? (navigation?.back ? 1 : 0);
  useLayoutEffect(() => {
    const previous = previousPage.current;
    if (open && previous && previous.key !== pageKey && pageRef.current) {
      pageRef.current.dataset.transition = depth < previous.depth ? "back" : "forward";
      titleRef.current?.focus({ preventScroll: true });
    }
    previousPage.current = open && pageKey !== undefined ? { key: pageKey, depth } : undefined;
  }, [open, pageKey, depth]);

  const content = (
    <>
      <header {...stylex.props(styles.header)}>
        <div>
          {navigation?.back && (
            <div {...stylex.props(styles.back)}>
              <Button variant="ghost" icon="previous" onPress={navigation.back.onPress}>
                {navigation.back.label}
              </Button>
            </div>
          )}
          <Heading
            slot="title"
            ref={titleRef}
            tabIndex={navigation ? -1 : undefined}
            {...stylex.props(styles.title)}
          >
            {title}
          </Heading>
          {description && (
            <p id={descriptionId} {...stylex.props(styles.description)}>
              {description}
            </p>
          )}
        </div>
        {(headerActions || dismissible) && (
          <div {...stylex.props(styles.headerActions)}>
            {headerActions}
            {dismissible && (
              <Button
                variant="ghost"
                icon="close"
                aria-label={`Close ${title}`}
                onPress={() => onOpenChange(false)}
              />
            )}
          </div>
        )}
      </header>
      <div {...stylex.props(styles.body)}>{children}</div>
      {footer && <footer {...stylex.props(styles.footer)}>{footer}</footer>}
    </>
  );
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
          {navigation ? (
            <div ref={pageRef} key={pageKey} {...stylex.props(styles.page)}>
              {content}
            </div>
          ) : content}
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

export function NavigableSidePanel({
  size = "default",
  pageKey,
  depth,
  back,
  ...props
}: NavigableSidePanelProps) {
  return (
    <Overlay
      {...props}
      side
      workflowPanel={size !== "default"}
      wideWorkflowPanel={size === "wide-workflow"}
      navigation={{ pageKey, depth, back }}
    />
  );
}
