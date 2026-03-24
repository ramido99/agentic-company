"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type PlanTier } from "@/lib/billing/plans";

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [planLabel, setPlanLabel] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const planTier = searchParams.get("planTier") as PlanTier | null;

    const PLAN_LABELS: Record<string, string> = {
      solo: "Solo",
      studio: "Studio",
    };
    if (planTier) setPlanLabel(PLAN_LABELS[planTier] ?? planTier);

    if (!paymentKey || !orderId || !amount || !planTier) {
      setStatus("error");
      setErrorMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
        planTier,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setTimeout(() => router.push("/billing"), 3000);
        } else {
          setStatus("error");
          setErrorMessage(data.error ?? "결제 승인 실패");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("결제 처리 중 오류가 발생했습니다.");
      });
  }, [searchParams, router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "20px",
        textAlign: "center",
        padding: "40px",
      }}
    >
      {status === "loading" && (
        <>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(167,139,250,0.2)",
              borderTop: "3px solid #A78BFA",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
              결제를 처리하고 있습니다
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              잠시만 기다려주세요...
            </p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div
            style={{
              width: 72,
              height: 72,
              background: "rgba(52,211,153,0.15)",
              border: "2px solid rgba(52,211,153,0.3)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
            }}
          >
            ✓
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>
              {planLabel} 플랜 시작!
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              결제가 완료되었습니다. 3초 후 자동으로 이동합니다.
            </p>
          </div>
          <button
            onClick={() => router.push("/billing")}
            style={{
              padding: "10px 28px",
              borderRadius: "8px",
              background: "rgba(52,211,153,0.15)",
              color: "#34d399",
              border: "1.5px solid rgba(52,211,153,0.3)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            바로 이동
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div
            style={{
              width: 72,
              height: 72,
              background: "rgba(239,68,68,0.1)",
              border: "2px solid rgba(239,68,68,0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ✕
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>
              결제 처리 실패
            </h1>
            <p style={{ fontSize: "13px", color: "#f87171" }}>{errorMessage}</p>
          </div>
          <button
            onClick={() => router.push("/billing")}
            style={{
              padding: "10px 28px",
              borderRadius: "8px",
              background: "rgba(167,139,250,0.12)",
              color: "#A78BFA",
              border: "1.5px solid rgba(167,139,250,0.25)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            결제 페이지로 돌아가기
          </button>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(167,139,250,0.2)",
          borderTop: "3px solid #A78BFA",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  );
}
