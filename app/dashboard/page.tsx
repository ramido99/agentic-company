import Link from "next/link";

import { RunWorkflowButton } from "@/components/RunWorkflowButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, InlineEmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { getPlanUsageSnapshot } from "@/lib/billing/usage-guard";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";
import { listCompanies, listGoals, listWorkflowRuns } from "@/lib/store";

export const dynamic = "force-dynamic";

function resolveNextAction(
  companies: Awaited<ReturnType<typeof listCompanies>>,
  goals: Awaited<ReturnType<typeof listGoals>>,
  workflowRuns: Awaited<ReturnType<typeof listWorkflowRuns>>,
) {
  const latestGoal = goals[0];
  const latestRun = workflowRuns[0];

  if (companies.length === 0) return {
    stage: 1, label: "첫 회사 등록",
    body: "운영 문맥이 되는 회사부터 만들어야 이후 목표, 실행, 결과물이 같은 기준 아래 연결됩니다.",
    action: <Link href="/company/new"><Button variant="primary">회사 등록 시작</Button></Link>,
  };
  if (goals.length === 0) return {
    stage: 2, label: "첫 목표 정의",
    body: "회사는 준비되었습니다. 이제 이번 실행에서 만들어야 할 결과를 목표로 적으면 됩니다.",
    action: <Link href={`/goals/new?companyId=${companies[0]?.id ?? ""}`}><Button variant="primary">목표 설정하기</Button></Link>,
  };
  if (workflowRuns.length === 0 && latestGoal) return {
    stage: 3, label: "첫 워크플로 실행",
    body: "목표가 준비되었습니다. 브리프부터 리뷰까지 구조화된 실행 보드를 지금 바로 생성할 수 있습니다.",
    action: <RunWorkflowButton goalId={latestGoal.id} />,
  };
  return {
    stage: 4, label: "최근 결과 검토",
    body: "첫 실행이 끝났습니다. 가장 최근 실행 보드에서 결과물과 검토 내용을 다시 확인해 보세요.",
    action: <Link href={latestRun ? `/workflows/${latestRun.id}` : "/workflows"}><Button variant="primary">최근 실행 보드 열기</Button></Link>,
  };
}

export default async function DashboardPage() {
  const [companies, goals, workflowRuns, planSnapshot, catalogAgents, myAgents] =
    await Promise.all([
      listCompanies(), listGoals(), listWorkflowRuns(),
      getPlanUsageSnapshot(),
      agentHiringRepository.listCatalog(),
      agentHiringRepository.listMyAgents(),
    ]);

  const totalArtifacts = workflowRuns.reduce((n, r) => n + r.artifacts.length, 0);
  const activeAgents = myAgents.filter((a) => a.active);
  const hirableAgents = catalogAgents.filter((a) => !a.hired).slice(0, 3);
  const hasData = companies.length > 0 || goals.length > 0 || workflowRuns.length > 0;
  const readyGoals = goals.map((goal) => ({
    goal,
    company: companies.find((c) => c.id === goal.companyId),
    recentRun: workflowRuns.find((r) => r.goalId === goal.id),
  })).slice(0, 4);
  const nextAction = resolveNextAction(companies, goals, workflowRuns);
  const stages = [
    { step: "01", title: "회사 등록", body: companies.length === 0 ? "아직 시작 전" : (companies[0]?.name ?? "완료"), active: nextAction.stage === 1 },
    { step: "02", title: "목표 정의", body: goals.length === 0 ? "결과 목표 필요" : (goals[0]?.title ?? "완료"), active: nextAction.stage === 2 },
    { step: "03", title: "워크플로 실행", body: workflowRuns.length === 0 ? "첫 실행 대기" : `${workflowRuns.length}회 실행`, active: nextAction.stage === 3 },
    { step: "04", title: "결과 검토", body: workflowRuns[0] ? `${workflowRuns[0].artifacts.length}개 결과물 확인 가능` : "실행 후 열림", active: nextAction.stage === 4 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <span className="page-eyebrow">대시보드</span>
          <h1 className="page-title">AI 운영 관제 센터</h1>
          <p className="page-description">회사 등록부터 결과 검토까지 한 화면에서 확인하세요.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/agents"><Button variant="secondary">에이전트 채용</Button></Link>
          <Link href="/company/new"><Button variant="primary">회사 등록</Button></Link>
        </div>
      </div>

      {/* Focus Card */}
      <div className="focus-card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Badge variant="brand">단계 {nextAction.stage}/4</Badge>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.1)", padding: "3px 12px", borderRadius: "20px" }}>{nextAction.label}</span>
        </div>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Next Action</p>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "8px" }}>{nextAction.label}</h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{nextAction.body}</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {nextAction.action}
          <Link href="/onboarding"><Button variant="secondary">시작 가이드 보기</Button></Link>
        </div>
      </div>

      {/* Stage Rail */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {stages.map((s) => (
          <div key={s.step} className={s.active ? "stage-card stage-card-active" : "stage-card"}>
            <div className="stage-number">{s.step}</div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{s.title}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="metric-grid">
        <MetricCard label="회사" value={`${companies.length}`} hint="운영 기준 문맥" strong />
        <MetricCard label="목표" value={`${goals.length}`} hint="실행 정의 누적" />
        <MetricCard label="활성 에이전트" value={`${activeAgents.length}`} hint="현재 배치 가능" />
        <MetricCard label="결과물" value={`${totalArtifacts}`} hint="전체 생성 수" />
      </div>

      {/* Main 2-col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Ready Goals */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p className="section-title">즉시 실행 가능한 목표</p>
                <p className="section-description">지금 이 화면에서 바로 워크플로를 시작할 수 있는 목표입니다.</p>
              </div>
              <Link href="/goals/new"><Button variant="secondary" size="sm">목표 추가</Button></Link>
            </div>
            {!hasData ? (
              <EmptyState
                title="아직 운영 데이터가 없습니다"
                description="첫 회사를 등록하면 운영 보드가 시작됩니다."
                primaryAction={{ href: "/company/new", label: "첫 회사 등록" }}
                secondaryAction={{ href: "/onboarding", label: "시작 가이드" }}
              />
            ) : readyGoals.length === 0 ? (
              <InlineEmptyState title="실행 가능한 목표가 없습니다" description="먼저 목표를 설정하면 이 영역에 항목이 나타납니다." />
            ) : readyGoals.map(({ goal, company, recentRun }) => (
              <div key={goal.id} className="card" style={{ padding: "20px", borderLeft: "3px solid rgba(167,139,250,0.5)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Badge variant="brand">목표</Badge>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{company?.name ?? "회사 미확인"}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>· {recentRun ? "최근 실행 있음" : "아직 실행 없음"}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{goal.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>{goal.task}</p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <RunWorkflowButton goalId={goal.id} />
                  {recentRun && <Link href={`/workflows/${recentRun.id}`}><Button variant="secondary" size="sm">최근 실행 보기</Button></Link>}
                </div>
              </div>
            ))}
          </div>

          {/* Company Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <p className="section-title">회사별 준비 상태</p>
              <p className="section-description">회사마다 목표 연결과 최근 실행 여부를 빠르게 확인합니다.</p>
            </div>
            {!hasData ? (
              <InlineEmptyState title="표시할 회사가 없습니다" description="회사와 목표가 생기면 회사별 준비 상태를 볼 수 있습니다." />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                {companies.map((company) => {
                  const cGoals = goals.filter((g) => g.companyId === company.id);
                  const recentRun = workflowRuns.find((r) => r.companyId === company.id);
                  return (
                    <div key={company.id} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <Badge variant="neutral">회사</Badge>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>목표 {cGoals.length}개</span>
                        <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>{recentRun ? "실행 기록 있음" : "실행 전"}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{company.name}</p>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{company.idea}</p>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <Link href={`/goals/new?companyId=${company.id}`}><Button variant="secondary" size="sm">목표 설정</Button></Link>
                        {recentRun
                          ? <Link href={`/workflows/${recentRun.id}`}><Button variant="ghost" size="sm">최근 실행 보기</Button></Link>
                          : <Link href="/agents"><Button variant="ghost" size="sm">에이전트 배치</Button></Link>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Plan */}
          <div className="plan-banner" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(167,139,250,0.8)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{planSnapshot.plan.label}</p>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "white" }}>{planSnapshot.plan.description}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "회사 잔여", value: `${planSnapshot.remaining.companies}개` },
                { label: "월간 실행 잔여", value: `${planSnapshot.remaining.workflowRunsThisMonth}회` },
                { label: "전략가 토큰", value: planSnapshot.remaining.strategistTokensThisMonth.toLocaleString() },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</span>
                  <span style={{ color: "#a78bfa", fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <Link href="/billing" style={{ display: "block" }}><Button variant="secondary" size="sm">플랜 업그레이드</Button></Link>
          </div>

          {/* Agents */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p className="section-title">추천 에이전트</p>
            {hirableAgents.length === 0
              ? <InlineEmptyState title="채용 가능한 에이전트 없음" description="모든 에이전트가 채용된 상태입니다." />
              : hirableAgents.map((agent) => (
                <div key={agent.id} className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{agent.name}</p>
                      <Badge variant="brand">{agent.role}</Badge>
                    </div>
                    {agent.featured && <Badge variant="success">추천</Badge>}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{agent.headline}</p>
                  <Link href={`/agents/${agent.id}`} style={{ display: "block" }}><Button variant="secondary" size="sm">상세 보기</Button></Link>
                </div>
              ))
            }
          </div>

          {/* Recent runs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p className="section-title">최근 실행 이력</p>
            {workflowRuns.length === 0
              ? <InlineEmptyState title="실행 이력 없음" description="목표 카드에서 실행 버튼을 누르면 첫 실행 보드가 생성됩니다." />
              : workflowRuns.slice(0, 4).map((run) => (
                <Link key={run.id} href={`/workflows/${run.id}`} style={{ textDecoration: "none" }}>
                  <div className="card card-hover" style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{run.task}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>결과물 {run.artifacts.length}개</span>
                      <Badge variant={run.status === "COMPLETED" ? "success" : "warning"}>{run.status === "COMPLETED" ? "완료" : run.status}</Badge>
                    </div>
                  </div>
                </Link>
              ))
            }
          </div>
        </aside>
      </div>
    </div>
  );
}
