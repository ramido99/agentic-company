import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StageRail } from "@/components/ui/StageRail";
import { WorkflowStorageDownload } from "@/components/WorkflowStorageDownload";
import { getWorkflowRun, getGoal, getCompany } from "@/lib/store";

export const dynamic = "force-dynamic";

interface WorkflowRunPageProps {
  params: Promise<{ runId: string }>;
}

export default async function WorkflowRunPage({ params }: WorkflowRunPageProps) {
  const { runId } = await params;

  const run = await getWorkflowRun(runId);
  const artifacts = run?.artifacts ?? [];

  if (!run) {
    notFound();
  }

  const [goal, company] = await Promise.all([
    getGoal(run.goalId),
    getCompany(run.companyId),
  ]);

  const stages = [
    {
      label: "전략 브리프",
      description: "브리프",
      done: artifacts.some((a) => a.type === "BRIEF"),
    },
    {
      label: "실행 계획",
      description: "계획",
      done: artifacts.some((a) => a.type === "EXECUTION_PLAN"),
    },
    {
      label: "체크리스트",
      description: "체크",
      done: artifacts.some((a) => a.type === "CHECKLIST"),
    },
    {
      label: "최종 리뷰",
      description: "리뷰",
      done: artifacts.some((a) => a.type === "REVIEW"),
    },
  ];

  const getArtifactByType = (type: string) => {
    return artifacts.find((a) => a.type === type);
  };

  const artifactDefs = [
    { type: "BRIEF", label: "전략 브리프" },
    { type: "EXECUTION_PLAN", label: "실행 계획" },
    { type: "CHECKLIST", label: "체크리스트" },
    { type: "REVIEW", label: "최종 리뷰" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <PageHeader
          eyebrow="실행 보드"
          title={goal?.title || "목표"}
          description={company?.name}
        />
        <Link href="/workflows">
          <Button variant="ghost" size="sm">← 목록</Button>
        </Link>
      </div>

      {/* Stage Rail */}
      <div className="card" style={{ padding: "16px" }}>
        <StageRail stages={stages} />
      </div>

      {/* Artifact Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {artifactDefs.map(({ type, label }) => {
          const artifact = getArtifactByType(type);
          return (
            <div key={type} className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
                {label}
              </h3>
              {artifact ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {artifact.summary}
                  </p>
                  <Link href={`#artifact-${artifact.id}`}>
                    <Button variant="ghost" size="sm">
                      상세 보기
                    </Button>
                  </Link>
                </div>
              ) : (
                <div style={{ fontSize: "13px", color: "var(--text-faint)" }}>생성 중...</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 결과물 다운로드 */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>결과물 다운로드</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            실행 담당 에이전트에 출력 스킬(PPT·Excel)이 배정된 경우 파일이 생성됩니다.
          </p>
        </div>
        <WorkflowStorageDownload runId={run.id} />
      </div>

      {/* Full Artifacts Display */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {artifacts.map((artifact) => (
          <div key={artifact.id} id={`artifact-${artifact.id}`} className="card" style={{ padding: "24px" }}>
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
                {artifact.title}
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {artifact.summary}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(Array.isArray(artifact.content) ? artifact.content as string[] : []).map((item, idx) => (
                <p key={idx} style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
