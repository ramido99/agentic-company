import React, { HTMLAttributes } from "react";

type BadgeVariant = "brand" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const getVariantClass = (variant: BadgeVariant = "neutral"): string => {
  const variantMap: Record<BadgeVariant, string> = {
    brand: "badge-brand",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    neutral: "badge-neutral",
  };
  return variantMap[variant];
};

export function Badge({
  variant = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const classes = `badge ${getVariantClass(variant)} ${className}`.trim();

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
