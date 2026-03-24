"use client";

import * as React from "react";
import { Check } from "lucide-react";

interface SelectorChipsProps {
  options: string[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  style?: React.CSSProperties;
  maxSelect?: number;
}

const SelectorChips = ({
  options,
  defaultSelected = [],
  onChange,
  style,
  maxSelect,
}: SelectorChipsProps) => {
  const [selected, setSelected] = React.useState<string[]>(defaultSelected);

  const toggle = (option: string) => {
    setSelected((prev) => {
      const isSelected = prev.includes(option);
      let next: string[];
      if (isSelected) {
        next = prev.filter((o) => o !== option);
      } else {
        if (maxSelect && prev.length >= maxSelect) return prev;
        next = [...prev, option];
      }
      onChange?.(next);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", ...style }}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "9999px",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
              userSelect: "none",
              transition: "all 200ms",
              outline: "none",
              ...(isSelected
                ? {
                    background: "linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)",
                    border: "1px solid rgba(124,58,237,0.4)",
                    color: "white",
                    boxShadow: "0 0 16px rgba(124,58,237,0.35)",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.55)",
                  }),
            }}
          >
            {isSelected && (
              <Check style={{ width: "14px", height: "14px", flexShrink: 0 }} />
            )}
            {option}
          </button>
        );
      })}
    </div>
  );
};

export { SelectorChips };
export type { SelectorChipsProps };
