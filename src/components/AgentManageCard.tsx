"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AgentCatalogView } from "@/lib/repositories/agent-hiring-repository";

interface AgentManageCardProps {
  agent: AgentCatalogView;
}

export function AgentManageCard({ agent }: AgentManageCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"toggle" | "fire" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading("toggle");
    setError(null);
    try {
      const res = await fetch("/api/my-agents/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, active: !agent.active }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "상태 변경 실패");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류 발생");
    } finally {
      setLoading(null);
    }
  }

  async function handleFire() {
    if (!confirm(`"${agent.name}" 에이전트를 팀에서 해제하시겠습니까?`)) return;
    setLoading("fire");
    setError(null);
    try {
      const res = await fetch("/api/my-agents/fire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "해제 실패");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류 발생");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="agent-card card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <Badge variant="brand">{agent.role}</Badge>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {agent.builtIn && (
            <Badge variant="neutral" style={{ fontSize: "10px" }}>기본</Badge>
          )}
          <Badge variant={agent.active ? "success" : "neutral"}>
            {agent.active ? "활성" : "비활성"}
          </Badge>
        </div>
      </div>

      {/* Agent info */}
      <div>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
          {agent.name}
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
          {agent.headline}
        </p>
      </div>

      {/* Assigned companies */}
      {agent.assignedCompanyNames.length > 0 && (
        <div style={{ paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
            배치된 회사
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {agent.assignedCompanyNames.map((name) => (
              <Badge key={name} variant="neutral">{name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p style={{ fontSize: "12px", color: "var(--error, #dc2626)" }}>{error}</p>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={loading !== null}
          style={{ flex: 1 }}
        >
          {loading === "toggle" ? "변경 중…" : agent.active ? "비활성화" : "활성화"}
        </Button>

        {/* builtIn 에이전트는 해제 불가 */}
        {!agent.builtIn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFire}
            disabled={loading !== null}
            style={{
              flex: 1,
              color: "var(--error, #dc2626)",
              borderColor: "var(--error, #dc2626)",
            }}
          >
            {loading === "fire" ? "해제 중…" : "팀 해제"}
          </Button>
        )}
      </div>
    </div>
  );
}
