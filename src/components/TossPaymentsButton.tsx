"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { type PlanTier } from "@/lib/billing/plans";

interface TossPaymentsButtonProps {
  planTier: PlanTier;
  amount: number;
  planLabel: string;
  currentPlan: PlanTier;
}

const CANCEL_CODES = [
  "PAY_PROCESS_CANCELED",
  "PAYMENT_CANCELED",
  "USER_CANCEL",
];

export function TossPaymentsButton({
  planTier,
  amount,
  planLabel,
  currentPlan,
}: TossPaymentsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrent = currentPlan === planTier;
  const isDowngrade = planTier === "free";

  if (isCurrent) {
    return (
      <Button variant="ghost" disabled style={{ width: "100%" }}>
        현재 플랜
      </Button>
    );
  }

  if (isDowngrade) {
    return (
      <Button variant="ghost" disabled style={{ width: "100%" }}>
        다운그레이드 문의
      </Button>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { loadTossPayments } = await import("@tosspayments/payment-sdk");

      // 환경변수 또는 공식 샌드박스 테스트 키 폴백
      const clientKey =
        process.env.NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY ||
        "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

      const tossPayments = await loadTossPayments(clientKey);

      // orderId: {timestamp}_{planTier}_{random} — webhook에서 workspaceId 분리 불가능하므로
      // 여기서는 간단히 랜덤 ID 사용 (confirm API에서 처리)
      const orderId = [
        "agentic",
        planTier,
        Date.now().toString(36),
        Math.random().toString(36).slice(2, 6),
      ].join("-");

      await tossPayments.requestPayment("카드", {
        amount,
        orderId,
        orderName: `Agentic Company ${planLabel} 플랜`,
        customerName: "사용자",
        successUrl: `${window.location.origin}/billing/success?planTier=${planTier}`,
        failUrl: `${window.location.origin}/billing?error=payment_failed`,
      });
      // successUrl 리다이렉트됨 — 이 아래 코드 실행 안 됨
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isCanceled = CANCEL_CODES.some((code) => msg.includes(code));

      if (!isCanceled) {
        console.error("[TossPayments]", err);
        setError("결제창을 열 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Button
        variant="primary"
        onClick={handlePayment}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "결제창 불러오는 중..." : `${planLabel} 시작하기`}
      </Button>
      {error && (
        <p style={{ fontSize: "12px", color: "#f87171", textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
}
