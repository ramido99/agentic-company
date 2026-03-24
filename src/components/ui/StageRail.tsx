import React from "react";

interface Stage {
  label: string;
  description: string;
  active?: boolean;
  done?: boolean;
}

interface StageRailProps {
  stages: Stage[];
}

export function StageRail({ stages }: StageRailProps) {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {stages.map((stage, index) => (
        <div
          key={index}
          className={`stage-card ${stage.active ? "stage-card-active" : ""}`}
        >
          <div className="stage-number">{index + 1}</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: stage.active ? "var(--brand)" : "var(--text)" }}>
              {stage.label}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              {stage.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
