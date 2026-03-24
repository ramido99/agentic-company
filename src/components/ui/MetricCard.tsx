import React from "react";

interface MetricCardProps {
  value: string;
  label: string;
  hint?: string;
  strong?: boolean;
}

export function MetricCard({ value, label, hint, strong = false }: MetricCardProps) {
  return (
    <div className="metric-card">
      {hint && <div className="metric-hint">{hint}</div>}
      <div className={`metric-value ${strong ? "strong" : ""}`}>{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}
