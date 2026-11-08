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
export type DialogProps = OverlayProps & { size?: "default" | "fullscreen" };
const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    backgroundColor: color.overlay,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    boxSizing: "border-box",
  },
  fullscreenOverlay: { padding: 0 },
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
  dialog: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "inherit",
    outline: "none",
  },
  drawerDialog: { height: "100%" },
  header: {
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
    padding: metrics.panelPadding,
    overflowY: "auto",
    overscrollBehavior: "contain",
    minHeight: 0,
    flexGrow: 1,
  },
  footer: {
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
}: OverlayProps & { side?: boolean; fullScreen?: boolean }) {
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
      )}
    >
      <Modal
        {...stylex.props(
          styles.modal,
          side && styles.drawer,
          fullScreen && styles.fullscreen,
        )}
      >
        <AriaDialog
          aria-describedby={description ? descriptionId : undefined}
          {...stylex.props(
            styles.dialog,
            (side || fullScreen) && styles.drawerDialog,
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
  return <Overlay {...props} fullScreen={size === "fullscreen"} />;
}
export function SidePanel(props: OverlayProps) {
  return <Overlay {...props} side />;
}
