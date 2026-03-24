import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getCurrentWorkspace } from "@/lib/auth/workspace";
import { subscriptionRepository } from "@/lib/repositories/subscription-repository";
import {
  planDefinitions,
  prismaPlantToTier,
  getFallbackPlanDefinition,
  type PlanTier,
} from "@/lib/billing/plans";
import { Badge } from "@/components/ui/Badge";
import { TossPaymentsButton } from "@/components/TossPaymentsButton";

export const dynamic = "force-dynamic";

const planOrder: PlanTier[] = ["free", "solo", "studio"];

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const workspace = await getCurrentWorkspace().catch(() => null);

  let currentPlanDef = getFallbackPlanDefinition();

  if (workspace) {
    const sub = await subscriptionRepository
      .findCurrentByWorkspaceId(workspace.id)
      .catch(() => null);
    if (sub) {
      const tier = prismaPlantToTier(sub.plan);
      currentPlanDef = planDefinitions[tier];
    }
  }

  const currentTier = currentPlanDef.tier;

  // 현재 구독 기간 정보
  const sub = workspace
    ? await subscriptionRepository.findCurrentByWorkspaceId(workspace.id).catch(() => null)
    : null;

  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("ko-KR")
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <span className="page-eyebrow">결제</span>
        <h1 className="page-title">플랜 관리</h1>
        <p className="page-description">현재 플랜을 확인하고 업그레이드하세요.</p>
      </div>

      {/* Current plan card */}
      <div
        className="card"
        style={{
          padding: "24px",
          borderColor: "rgba(167,139,250,0.3)",
          background: "rgba(124,58,237,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <Badge variant="brand">현재 플랜</Badge>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text)",
                marginTop: "10px",
                letterSpacing: "-0.02em",
              }}
            >
              {currentPlanDef.label} 플랜
            </h2>
            <p style={{ color: "var(--text-muted)", marginTop: "4px", fontSize: "14px" }}>
              {currentPlanDef.monthlyPrice === 0
                ? "영구 무료"
                : `₩${currentPlanDef.monthlyPrice.toLocaleString()} / 월`}
              {periodEnd && (
                <span style={{ marginLeft: "12px", color: "var(--text-faint)" }}>
                  다음 결제: {periodEnd}
                </span>
              )}
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginTop: "12px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                회사 최대 {currentPlanDef.limits.companies}개
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                월 {currentPlanDef.limits.workflowRunsPerMonth}회 실행
              </span>
            </div>
          </div>
          {currentTier !== "studio" && (
            <TossPaymentsButton
              planTier={currentTier === "free" ? "solo" : "studio"}
              amount={currentTier === "free" ? 29000 : 99000}
              planLabel={currentTier === "free" ? "Solo" : "Studio"}
              currentPlan={currentTier}
            />
          )}
        </div>
      </div>

      {/* Pricing grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {planOrder.map((tier) => {
          const plan = planDefinitions[tier];
          const isCurrent = currentTier === tier;

          const featureList = [
            `회사 최대 ${plan.limits.companies}개`,
            `월 ${plan.limits.workflowRunsPerMonth}회 워크플로 실행`,
            tier === "free" ? "기본 에이전트 3명" : tier === "solo" ? "추가 에이전트 5명" : "에이전트 무제한",
            tier === "free" ? "커뮤니티 지원" : tier === "solo" ? "우선 이메일 지원" : "24/7 전용 지원",
            ...(tier === "solo" ? ["API 접근", "파일 출력 스킬 (PPT·Excel·PDF)"] : []),
            ...(tier === "studio" ? ["API 접근", "커스텀 LLM", "SSO 인증", "파일 출력 스킬 (PPT·Excel·PDF)"] : []),
          ];

          return (
            <div
              key={tier}
              className="card"
              style={{
                padding: "24px",
                ...(isCurrent
                  ? {
                      borderColor: "rgba(167,139,250,0.4)",
                      background: "rgba(124,58,237,0.06)",
                    }
                  : {}),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>
                  {plan.label}
                </h3>
                <div style={{ display: "flex", gap: "6px" }}>
                  {tier === "solo" && !isCurrent && (
                    <Badge variant="brand">추천</Badge>
                  )}
                  {isCurrent && <Badge variant="success">현재</Badge>}
                </div>
              </div>

              <p
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "var(--text)",
                  letterSpacing: "-0.02em",
                  marginBottom: "6px",
                }}
              >
                {plan.monthlyPrice === 0 ? "₩0" : `₩${plan.monthlyPrice.toLocaleString()}`}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "var(--text-muted)",
                  }}
                >
                  {plan.monthlyPrice === 0 ? " 영구 무료" : " / 월"}
                </span>
              </p>

              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-faint)",
                  marginBottom: "20px",
                  lineHeight: 1.5,
                }}
              >
                {plan.description}
              </p>

              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "24px",
                  listStyle: "none",
                  padding: 0,
                }}
              >
                {featureList.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--success, #34d399)",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: "1px",
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <TossPaymentsButton
                planTier={tier}
                amount={plan.monthlyPrice}
                planLabel={plan.label}
                currentPlan={currentTier}
              />
            </div>
          );
        })}
      </div>

      {/* TossPayments sandbox 안내 */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          borderColor: "rgba(245,158,11,0.3)",
          background: "rgba(245,158,11,0.05)",
        }}
      >
        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text)" }}>🧪 샌드박스 모드</strong> —
          현재 테스트 환경입니다. 실제 결제는 발생하지 않습니다.
          TossPayments 대시보드에서 샌드박스 클라이언트 키를{" "}
          <code
            style={{
              fontSize: "12px",
              background: "rgba(255,255,255,0.08)",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY
          </code>
          에 설정하세요.
        </p>
      </div>
    </div>
  );
}
