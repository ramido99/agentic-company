import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, InlineEmptyState } from "@/components/ui/EmptyState";
import { RunWorkflowButton } from "@/components/RunWorkflowButton";
import { DeleteCompanyButton } from "@/components/DeleteCompanyButton";
import { getCompany, listWorkflowRuns } from "@/lib/store";
import { goalRepository } from "@/lib/repositories/goal-repository";
import { workflowRunRepository } from "@/lib/repositories/workflow-run-repository";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";
import { agentCatalog } from "@/lib/mock/agent-catalog";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;

  const [company, goals, runs, myAgents] = await Promise.all([
    getCompany(id),
    goalRepository.listByCompanyId(id),
    workflowRunRepository.listByCompanyId(id),
    agentHiringRepository.listMyAgents(),
  ]);

  if (!company) notFound();

  const activeAgents = myAgents
    .filter((a) => a.active)
    .map((a) => agentCatalog.find((c) => c.id === a.id))
    .filter(Boolean);

  const completedRuns = runs.filter((r) => r.status === "COMPLETED");
  const totalArtifacts = runs.reduce((n, r) => n + r.artifacts.length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Link href="/companies" style={{ fontSize: "13px", color: "var(--text-faint)", textDecoration: "none" }}>
              ← 회사 목록
            </Link>
          </div>
          <span className="page-eyebrow">회사 상세</span>
          <h1 className="page-title">{company.name}</h1>
          <p className="page-description" style={{ maxWidth: "560px" }}>{company.idea}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <Link href={`/goals/new?companyId=${company.id}`}>
            <Button variant="secondary">목표 추가</Button>
          </Link>
          {goals.length > 0 && (
            <RunWorkflowButton goalId={goals[0].id} />
          )}
          <DeleteCompanyButton
            companyId={company.id}
            companyName={company.name}
            runCount={runs.length}
          />
        </div>
      </div>

      {/* 요약 메트릭 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          { label: "목표", value: goals.length, hint: "등록된 목표 수" },
          { label: "워크플로", value: runs.length, hint: "전체 실행 횟수" },
          { label: "완료", value: completedRuns.length, hint: "완료된 실행" },
          { label: "결과물", value: totalArtifacts, hint: "생성된 아티팩트" },
        ].map((m) => (
          <div key={m.label} className="card" style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{m.label}</p>
            <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "2px" }}>{m.value}</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.hint}</p>
          </div>
        ))}
      </div>

      {/* 본문 2컬럼 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>

        {/* 왼쪽: 목표 + 실행 이력 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* 목표 */}
          <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p className="section-title">목표</p>
                <p className="section-description">이 회사에 등록된 실행 목표들입니다.</p>
              </div>
              <Link href={`/goals/new?companyId=${company.id}`}>
                <Button variant="secondary" size="sm">목표 추가</Button>
              </Link>
            </div>

            {goals.length === 0 ? (
              <InlineEmptyState
                title="등록된 목표가 없습니다"
                description="목표를 추가하면 AI 에이전트가 워크플로를 실행할 수 있습니다."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {goals.map((goal) => {
                  const goalRuns = runs.filter((r) => r.goalId === goal.id);
                  const latestRun = goalRuns[0];
                  return (
                    <div key={goal.id} className="card" style={{ padding: "18px 20px", borderLeft: "3px solid rgba(167,139,250,0.4)", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                        <div>
                          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{goal.title}</h3>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{goal.task}</p>
                        </div>
                        <Badge variant={goalRuns.length > 0 ? "success" : "neutral"}>
                          {goalRuns.length > 0 ? `실행 ${goalRuns.length}회` : "아직 실행 없음"}
                        </Badge>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <RunWorkflowButton goalId={goal.id} />
                        {latestRun && (
                          <Link href={`/workflows/${latestRun.id}`}>
                            <Button variant="ghost" size="sm">최근 실행 보기</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 실행 이력 */}
          <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <p className="section-title">실행 이력</p>
              <p className="section-description">이 회사에서 실행된 워크플로 기록입니다.</p>
            </div>
            {runs.length === 0 ? (
              <InlineEmptyState
                title="실행 이력이 없습니다"
                description="목표를 선택하고 워크플로를 실행하면 결과물이 여기에 쌓입니다."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {runs.map((run) => (
                  <Link key={run.id} href={`/workflows/${run.id}`} style={{ textDecoration: "none" }}>
                    <div className="card card-hover" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{run.task}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "2px" }}>
                          결과물 {run.artifacts.length}개 · {new Date(run.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <Badge variant={run.status === "COMPLETED" ? "success" : run.status === "FAILED" ? "danger" : "warning"}>
                        {run.status === "COMPLETED" ? "완료" : run.status === "FAILED" ? "실패" : "진행 중"}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* 오른쪽: 에이전트 패널 */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* 활성 에이전트 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <p className="section-title">활성 에이전트</p>
              <p className="section-description">현재 워크스페이스에 배치된 에이전트입니다.</p>
            </div>
            {activeAgents.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <InlineEmptyState title="활성 에이전트 없음" description="에이전트를 채용하고 활성화하세요." />
                <Link href="/agents"><Button variant="secondary" size="sm">에이전트 채용하기</Button></Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {activeAgents.map((agent) => agent && (
                  <div key={agent.id} className="card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{agent.name}</p>
                      <Badge variant="success">활성</Badge>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{agent.headline}</p>
                    <Badge variant="brand">{agent.role}</Badge>
                  </div>
                ))}
                <Link href="/my-agents" style={{ display: "block" }}>
                  <Button variant="ghost" size="sm">에이전트 관리</Button>
                </Link>
              </div>
            )}
          </div>

          {/* 회사 정보 */}
          <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <p className="section-title" style={{ marginBottom: 0 }}>회사 정보</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-faint)" }}>생성일</span>
                <span style={{ color: "var(--text-muted)" }}>{new Date(company.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-faint)" }}>목표 수</span>
                <span style={{ color: "var(--text-muted)" }}>{goals.length}개</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--text-faint)" }}>총 실행</span>
                <span style={{ color: "var(--text-muted)" }}>{runs.length}회</span>
              </div>
            </div>
            {/* 위험 영역 */}
            <div style={{ borderTop: "1px solid rgba(239,68,68,0.15)", paddingTop: "10px" }}>
              <p style={{ fontSize: "11px", color: "rgba(239,68,68,0.6)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "8px" }}>위험 영역</p>
              <DeleteCompanyButton
                companyId={company.id}
                companyName={company.name}
                runCount={runs.length}
                variant="icon-text"
              />
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
