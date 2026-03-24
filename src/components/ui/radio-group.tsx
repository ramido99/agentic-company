"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

// ─── RadioGroup ───────────────────────────────────────────────────────────────

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ style, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      style={{ display: "grid", gap: "8px", ...style }}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

// ─── RadioGroupItem ───────────────────────────────────────────────────────────

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ style, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      style={{
        aspectRatio: "1",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        border: "1px solid rgba(167,139,250,0.5)",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
        transition: "all 150ms",
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* Filled dot */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#a78bfa",
          }}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
