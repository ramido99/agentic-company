"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

type RunWorkflowButtonProps = {
  goalId: string;
  variant?: "primary" | "secondary";
};

const STEPS = [
  { label: "웹 검색 중", icon: "🔍", durationMs: 6000 },
  { label: "데이터 분석 중", icon: "🧠", durationMs: 8000 },
  { label: "전략가 작업 중", icon: "📋", durationMs: 7000 },
  { label: "실행 계획 수립 중", icon: "📝", durationMs: 6000 },
  { label: "검토자 검토 중", icon: "🔎", durationMs: 5000 },
  { label: "보고서 생성 중", icon: "📊", durationMs: 4000 },
];

export function RunWorkflowButton({ goalId, variant = "primary" }: RunWorkflowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading) {
      setStepIndex(0);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      return;
    }
    let idx = 0;
    function advance() {
      if (idx < STEPS.length - 1) {
        idx++;
        setStepIndex(idx);
        stepTimerRef.current = setTimeout(advance, STEPS[idx].durationMs);
      }
    }
    stepTimerRef.current = setTimeout(advance, STEPS[0].durationMs);
    return () => { if (stepTimerRef.current) clearTimeout(stepTimerRef.current); };
  }, [loading]);

  async function handleRun() {
    setLoading(true);
    setError("");
    setStepIndex(0);

    const response = await fetch("/api/workflows/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "실행 흐름을 시작하지 못했습니다.");
      setLoading(false);
      return;
    }

    router.push(`/workflows/${data.workflowRun.id}`);
    router.refresh();
  }

  const currentStep = STEPS[stepIndex];
  const progressPct = loading ? Math.round(((stepIndex + 1) / STEPS.length) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "200px" }}>
      <Button variant={variant} size="md" disabled={loading} onClick={handleRun} style={{ width: "100%" }}>
        {loading ? `${currentStep.icon} ${currentStep.label}…` : "실행 흐름 시작"}
      </Button>
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ height: "4px", borderRadius: "4px", background: "var(--border, #e5e7eb)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--brand, #7c3aed)", borderRadius: "4px", transition: "width 0.8s ease" }} />
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {STEPS.map((step, i) => (
              <span key={i} style={{
                fontSize: "10px", padding: "2px 6px", borderRadius: "10px",
                background: i < stepIndex ? "var(--success-bg, #d1fae5)" : i === stepIndex ? "var(--brand-bg, #ede9fe)" : "var(--surface-subtle, #f3f4f6)",
                color: i < stepIndex ? "var(--success, #059669)" : i === stepIndex ? "var(--brand, #7c3aed)" : "var(--text-faint, #9ca3af)",
                fontWeight: i === stepIndex ? 700 : 400, transition: "all 0.3s",
              }}>
                {i < stepIndex ? "✓" : step.icon} {step.label}
              </span>
            ))}
          </div>
        </div>
      )}
      {error && <p style={{ fontSize: "12px", color: "var(--error, #dc2626)", lineHeight: 1.5 }}>{error}</p>}
    </div>
  );
}
