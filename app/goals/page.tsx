import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { listGoals, listCompanies, listWorkflowRuns } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const [goals, companies, runs] = await Promise.all([listGoals(), listCompanies(), listWorkflowRuns()]);
  const companyMap = new Map(companies.map((c) => [c.id, c]));
  const runsByGoal = runs.reduce((acc, run) => {
    if (!acc.has(run.goalId)) acc.set(run.goalId, []);
    acc.get(run.goalId)!.push(run);
    return acc;
  }, new Map<string, typeof runs>());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <span className="page-eyebrow">목표</span>
          <h1 className="page-title">목표 관리</h1>
          <p className="page-description">회사별 목표들을 관리하고 새 목표를 추가합니다.</p>
        </div>
        <Link href="/goals/new"><Button variant="primary">새 목표 추가</Button></Link>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon="🎯" title="목표가 없습니다" description="새 목표를 추가하여 워크플로를 시작하세요."
          primaryAction={{ href: "/goals/new", label: "새 목표 추가" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {goals.map((goal) => {
            const company = companyMap.get(goal.companyId);
            const goalRuns = runsByGoal.get(goal.id) ?? [];
            return (
              <div key={goal.id} className="card card-hover" style={{ padding: "16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                <Link href={`/goals/${goal.id}`} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{goal.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "10px" }}>{goal.task}</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {company && <Badge variant="brand">{company.name}</Badge>}
                    {goalRuns.length > 0
                      ? <Badge variant="neutral">실행 {goalRuns.length}회</Badge>
                      : <Badge variant="warning">미실행</Badge>
                    }
                  </div>
                </Link>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Link href={`/goals/${goal.id}`}><Button variant="secondary" size="sm">히스토리</Button></Link>
                  <Link href={`/goals/${goal.id}/run`}><Button variant="primary" size="sm">실행</Button></Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
