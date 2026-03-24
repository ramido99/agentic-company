"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

// ── Shared style helpers ─────────────────────────────────────────────────────

const overlayStyle = (zIndex: number): React.CSSProperties => ({
  position: "fixed",
  inset: 0,
  zIndex,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(4px)",
});

const contentStyle = (zIndex: number, maxWidth: string, bg: string): React.CSSProperties => ({
  position: "fixed",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  zIndex,
  width: "100%",
  maxWidth,
  background: bg,
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
  outline: "none",
});

// ── Outer Dialog ─────────────────────────────────────────────────────────────

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    style={{ ...overlayStyle(50), ...style }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ style, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={{ ...contentStyle(50, "512px", "#111118"), ...style }}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap", ...style }} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    style={{ fontSize: "15px", fontWeight: 600, color: "white", margin: 0, ...style }}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0, ...style }}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// ── Inner (Nested) Dialog ────────────────────────────────────────────────────

const InnerDialog = DialogPrimitive.Root;
const InnerDialogTrigger = DialogPrimitive.Trigger;

const InnerDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    style={{ ...overlayStyle(60), background: "rgba(0,0,0,0.5)", ...style }}
    {...props}
  />
));
InnerDialogOverlay.displayName = "InnerDialogOverlay";

const InnerDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ style, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <InnerDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={{ ...contentStyle(70, "448px", "#16161e"), ...style }}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
InnerDialogContent.displayName = "InnerDialogContent";

const InnerDialogHeader = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }} {...props} />
);
InnerDialogHeader.displayName = "InnerDialogHeader";

const InnerDialogFooter = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap", ...style }} {...props} />
);
InnerDialogFooter.displayName = "InnerDialogFooter";

const InnerDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    style={{ fontSize: "15px", fontWeight: 600, color: "white", margin: 0, ...style }}
    {...props}
  />
));
InnerDialogTitle.displayName = "InnerDialogTitle";

const InnerDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0, ...style }}
    {...props}
  />
));
InnerDialogDescription.displayName = "InnerDialogDescription";

export {
  Dialog, DialogTrigger, DialogPortal, DialogClose, DialogOverlay,
  DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
  InnerDialog, InnerDialogTrigger,
  InnerDialogContent, InnerDialogHeader, InnerDialogFooter,
  InnerDialogTitle, InnerDialogDescription,
};
