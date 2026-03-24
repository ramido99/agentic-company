"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type AgentActiveToggleProps = {
  agentId: string;
  active: boolean;
};

export function AgentActiveToggle({ agentId, active }: AgentActiveToggleProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [localActive, setLocalActive] = useState(active);
  const [error, setError] = useState("");

  async function handleToggle() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/my-agents/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, active: !localActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "에이전트 상태 변경에 실패했습니다.");
      }

      setLocalActive(!localActive);
      router.refresh();
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "에이전트 상태 변경에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Badge variant={localActive ? "success" : "neutral"}>
          {localActive ? "활성" : "비활성"}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          disabled={submitting}
          onClick={handleToggle}
        >
          {submitting ? "변경 중..." : localActive ? "비활성화" : "활성화"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
