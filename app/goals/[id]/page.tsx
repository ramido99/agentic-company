import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RunWorkflowButton } from "@/components/RunWorkflowButton";
import { getGoal, getCompany } from "@/lib/store";
import { workflowRunRepository } from "@/lib/repositories/workflow-run-repository";

export const dynamic = "force-dynamic";

interface GoalDetailPageProps {
  params: Promise<{ id: string }>;
}

const ARTIFACT_LABELS: Record<string, string> = {
  BRIEF: "브리프",
  EXECUTION_PLAN: "실행 계획",
  CHECKLIST: "체크리스트",
  REVIEW: "리뷰",
};

function statusBadge(status: string) {
  if (status === "COMPLETED") return <Badge variant="success">완료</Badge>;
  if (status === "FAILED") return <Badge variant="warning">실패</Badge>;
  if (status === "RUNNING") return <Badge variant="brand">실행 중</Badge>;
  return <Badge variant="neutral">{status}</Badge>;
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;
  const goal = await getGoal(id);
  if (!goal) notFound();

  const [company, runs] = await Promise.all([
    getCompany(goal.companyId),
    workflowRunRepository.listByGoalId(id),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <span className="page-eyebrow">목표 상세</span>
          <h1 className="page-title">{goal.title}</h1>
          <p className="page-description">{company?.name ?? ""}</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link href="/goals"><Button variant="ghost" size="sm">← 목록</Button></Link>
          <RunWorkflowButton goalId={id} />
        </div>
      </div>

      {/* Goal Info */}
      <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>실행 내용</p>
        <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.7 }}>{goal.task}</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {company && <Badge variant="brand">{company.name}</Badge>}
          <Badge variant="neutral">총 {runs.length}회 실행</Badge>
          {runs.length > 0 && (
            <Badge variant={runs[0].status === "COMPLETED" ? "success" : "neutral"}>
              최근: {runs[0].status === "COMPLETED" ? "완료" : runs[0].status}
            </Badge>
          )}
        </div>
      </div>

      {/* Run History */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p className="section-title">실행 히스토리</p>
            <p className="section-description">이 목표의 모든 워크플로우 실행 기록입니다. 각 실행의 결과를 비교해 보세요.</p>
          </div>
        </div>

        {runs.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>아직 실행 기록이 없습니다. 첫 번째 워크플로우를 실행해보세요.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {runs.map((run, idx) => {
              const isLatest = idx === 0;
              const date = new Date(run.createdAt).toLocaleString("ko-KR", {
                year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              });
              return (
                <div key={run.id} className="card" style={{
                  padding: "16px 20px",
                  borderLeft: isLatest ? "3px solid var(--brand, #7c3aed)" : "3px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                  flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {isLatest && <Badge variant="brand">최신</Badge>}
                      {statusBadge(run.status)}
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{date}</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {run.artifacts.map((a) => (
                        <span key={a.id} style={{
                          fontSize: "11px", padding: "2px 8px", borderRadius: "10px",
                          background: "var(--surface-subtle, #f3f4f6)",
                          color: "var(--text-muted)",
                        }}>
                          {ARTIFACT_LABELS[a.type] ?? a.type}
                        </span>
                      ))}
                      {run.artifacts.length === 0 && (
                        <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>결과물 없음</span>
                      )}
                    </div>
                  </div>
                  <Link href={`/workflows/${run.id}`}>
                    <Button variant={isLatest ? "primary" : "secondary"} size="sm">
                      결과 보기
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
