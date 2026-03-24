"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type AgentHireButtonProps = {
  agentId: string;
  hired: boolean;
};

export function AgentHireButton({ agentId, hired }: AgentHireButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleHire() {
    if (hired || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/agents/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "에이전트 채용에 실패했습니다.");
      }

      router.refresh();
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "에이전트 채용에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant={hired ? "secondary" : "primary"}
        size="md"
        disabled={hired || submitting}
        onClick={handleHire}
      >
        {hired ? "채용됨" : submitting ? "채용 중..." : "채용하기"}
      </Button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
