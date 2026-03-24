import React from "react";

interface SummaryCardProps {
  label: string;
  value: string;
  description?: string;
  hero?: boolean;
  strong?: boolean;
}

export function SummaryCard({
  label,
  value,
  description,
  hero = false,
  strong = false,
}: SummaryCardProps) {
  const valueFontSize = hero ? "32px" : strong ? "28px" : "24px";
  const valueFontWeight = strong || hero ? 700 : 600;

  return (
    <div className="card" style={{ padding: "20px" }}>
      <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: valueFontSize, fontWeight: valueFontWeight, lineHeight: 1.2, color: "var(--text)", marginBottom: "4px" }}>
        {value}
      </div>
      {description && (
        <div style={{ fontSize: "12px", color: "var(--text-faint)" }}>
          {description}
        </div>
      )}
    </div>
  );
}

interface MiniSummaryCardProps {
  label: string;
  value: string;
}

export function MiniSummaryCard({ label, value }: MiniSummaryCardProps) {
  return (
    <div className="card" style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}
