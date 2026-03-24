"use client";

import { useState, useTransition } from "react";

interface AgentSkillToggleProps {
  agentId: string;
  skillId: string;
  assigned: boolean;
  skillName: string;
  skillIcon: string;
  isPremium?: boolean;
}

export function AgentSkillToggle({
  agentId,
  skillId,
  assigned: initialAssigned,
  skillName,
  skillIcon,
  isPremium,
}: AgentSkillToggleProps) {
  const [assigned, setAssigned] = useState(initialAssigned);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const method = assigned ? "DELETE" : "POST";
      const res = await fetch("/api/agents/skills", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, skillId }),
      });
      if (res.ok) {
        setAssigned((prev) => !prev);
      }
    });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        borderRadius: "8px",
        border: assigned
          ? "1.5px solid rgba(167,139,250,0.5)"
          : "1.5px solid var(--border)",
        background: assigned ? "rgba(167,139,250,0.06)" : "transparent",
        gap: "12px",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "18px", flexShrink: 0 }}>{skillIcon}</span>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "1px" }}>
            {skillName}
            {isPremium && (
              <span
                style={{
                  marginLeft: "6px",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#a78bfa",
                  background: "rgba(167,139,250,0.15)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  letterSpacing: "0.04em",
                }}
              >
                PRO
              </span>
            )}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        style={{
          padding: "5px 14px",
          borderRadius: "6px",
          border: "none",
          fontSize: "12px",
          fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer",
          background: assigned ? "rgba(239,68,68,0.1)" : "rgba(167,139,250,0.15)",
          color: assigned ? "#ef4444" : "#a78bfa",
          transition: "all 0.15s ease",
          opacity: isPending ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        {isPending ? "..." : assigned ? "해제" : "배정"}
      </button>
    </div>
  );
}
