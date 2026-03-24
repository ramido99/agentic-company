"use client";

import * as React from "react";

// ─── Variant style maps (no Tailwind — all inline) ────────────────────────────

const BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  whiteSpace: "nowrap",
  fontFamily: "inherit",
  fontWeight: 500,
  fontSize: "14px",
  border: "1px solid transparent",
  borderRadius: "6px",
  cursor: "pointer",
  textDecoration: "none",
  transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
  outline: "none",
  flexShrink: 0,
};

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm:      { height: "32px", padding: "0 12px", fontSize: "13px" },
  default: { height: "40px", padding: "0 16px", fontSize: "14px" },
  md:      { height: "40px", padding: "0 16px", fontSize: "14px" },
  lg:      { height: "44px", padding: "0 24px", fontSize: "15px" },
  icon:    { height: "40px", width: "40px", padding: "0" },
};

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  default: {
    background: "hsl(262 78% 57%)",
    color: "white",
    borderColor: "transparent",
  },
  primary: {
    background: "linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)",
    color: "white",
    borderColor: "transparent",
    boxShadow: "0 0 16px rgba(124,58,237,0.3)",
  },
  secondary: {
    background: "rgba(255,255,255,0.07)",
    color: "var(--text)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  outline: {
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.7)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  ghost: {
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    borderColor: "transparent",
  },
  link: {
    background: "transparent",
    color: "#a78bfa",
    borderColor: "transparent",
    padding: "0",
    height: "auto",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  danger: {
    background: "linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)",
    color: "white",
    borderColor: "transparent",
  },
  destructive: {
    background: "linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)",
    color: "white",
    borderColor: "transparent",
  },
  "brand-ghost": {
    background: "rgba(167,139,250,0.1)",
    color: "#c4b5fd",
    borderColor: "rgba(167,139,250,0.2)",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = keyof typeof VARIANT_STYLES;
type Size = keyof typeof SIZE_STYLES;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  href?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "default",
      asChild: _asChild,
      href: _href,
      style,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const computed: React.CSSProperties = {
      ...BASE,
      ...SIZE_STYLES[size] ?? SIZE_STYLES.default,
      ...VARIANT_STYLES[variant] ?? VARIANT_STYLES.secondary,
      ...(disabled
        ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }
        : {}),
      ...style,
    };

    return (
      <button ref={ref} style={computed} disabled={disabled} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };

// Legacy export — some pages import buttonVariants; provide a no-op stub
export const buttonVariants = (_opts?: { variant?: Variant; size?: Size; className?: string }) =>
  "";
