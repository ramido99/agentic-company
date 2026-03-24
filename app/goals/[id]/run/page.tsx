import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { RunWorkflowButton } from "@/components/RunWorkflowButton";
import { getGoal, getCompany } from "@/lib/store";

export const dynamic = "force-dynamic";

interface RunGoalPageProps {
  params: Promise<{ id: string }>;
}

export default async function RunGoalPage({ params }: RunGoalPageProps) {
  const { id } = await params;
  const goal = await getGoal(id);

  if (!goal) {
    notFound();
  }

  const company = await getCompany(goal.companyId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <PageHeader
          eyebrow="워크플로 실행"
          title={goal.title}
          description={company?.name ?? ""}
        />
        <Link href="/goals">
          <Button variant="ghost" size="sm">← 목표 목록</Button>
        </Link>
      </div>

      {/* 실행 정보 카드 */}
      <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>실행할 목표</p>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>{goal.title}</h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7 }}>{goal.task}</p>
        </div>

        {company && (
          <div style={{ paddingTop: "16px", borderTop: "1px solid var(--border-strong)" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>운영 회사</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Badge variant="brand">{company.name}</Badge>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{company.idea}</span>
            </div>
          </div>
        )}

        <div style={{ paddingTop: "16px", borderTop: "1px solid var(--border-strong)" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>실행 순서</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["① 전략가 → 브리프", "② 실행 담당 → 계획 + 체크리스트", "③ 검토자 → 리뷰"].map((step) => (
              <span key={step} style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--surface-subtle)", border: "1px solid var(--border-strong)", borderRadius: "6px", padding: "4px 10px" }}>
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 실행 버튼 */}
      <div className="card" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>워크플로를 실행하시겠습니까?</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>실행하면 에이전트들이 순서대로 아티팩트를 생성합니다. 보통 10~30초 소요됩니다.</p>
        </div>
        <RunWorkflowButton goalId={id} />
      </div>
    </div>
  );
}
