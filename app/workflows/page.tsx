import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { listWorkflowRuns, listCompanies, listGoals } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const [runs, companies, goals] = await Promise.all([
    listWorkflowRuns(),
    listCompanies(),
    listGoals(),
  ]);

  const companyMap = new Map(companies.map((c) => [c.id, c]));
  const goalMap = new Map(goals.map((g) => [g.id, g]));

  const completedCount = runs.filter((r) => r.status === "COMPLETED").length;
  const totalArtifacts = runs.reduce((sum, run) => sum + run.artifacts.length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader
        eyebrow="실행 이력"
        title="워크플로 실행 이력"
        description="모든 워크플로 실행 기록을 확인합니다."
      />

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <MetricCard value={runs.length.toString()} label="전체 실행" />
        <MetricCard
          value={completedCount.toString()}
          label="완료된 실행"
          strong
        />
        <MetricCard value={totalArtifacts.toString()} label="생성된 산출물" />
      </div>

      {/* Content */}
      {runs.length === 0 ? (
        <EmptyState
          icon="📋"
          title="실행 이력이 없습니다"
          description="목표를 만들고 워크플로를 실행하면 여기에 나타납니다."
          primaryAction={{
            href: "/goals/new",
            label: "새 목표 추가",
          }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {runs.map((run) => {
            const company = companyMap.get(run.companyId);
            const goal = goalMap.get(run.goalId);

            const statusVariant =
              run.status === "COMPLETED"
                ? "success"
                : run.status === "RUNNING"
                  ? "warning"
                  : "danger";

            return (
              <Link
                key={run.id}
                href={`/workflows/${run.id}`}
                className="card card-hover"
                style={{ padding: "16px", display: "block", textDecoration: "none" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
                      {goal?.title || "목표 없음"}
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                      {company?.name || "회사 없음"}
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Badge variant="neutral">
                        산출물 {run.artifacts.length}개
                      </Badge>
                      <Badge variant={statusVariant}>
                        {run.status === "COMPLETED"
                          ? "완료"
                          : run.status === "RUNNING"
                            ? "진행 중"
                            : "실패"}
                      </Badge>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-faint)", flexShrink: 0 }}>
                    {new Date(run.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
