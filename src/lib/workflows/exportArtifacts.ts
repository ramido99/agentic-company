import { Artifact, WorkflowRun } from "@/lib/types";
import type { ResearchSynthesisResult } from "@/lib/llm/openai-client";
import type { TavilySearchResponse } from "@/lib/search/tavily";

const typeLabel: Record<Artifact["type"], string> = {
  brief: "브리프",
  "execution-plan": "실행 계획",
  checklist: "체크리스트",
  review: "리뷰",
};

const roleLabel: Record<Artifact["role"], string> = {
  strategist: "전략가",
  operator: "실행 담당",
  reviewer: "검토자",
};

const orderedTypes: Artifact["type"][] = ["brief", "execution-plan", "checklist", "review"];

function orderArtifacts(artifacts: Artifact[]) {
  return [...artifacts].sort(
    (a, b) => orderedTypes.indexOf(a.type) - orderedTypes.indexOf(b.type),
  );
}

export function createWorkflowExportBase(run: WorkflowRun, companyName?: string, goalTitle?: string) {
  return {
    title: goalTitle ?? run.task,
    companyName: companyName ?? "회사 정보 없음",
    goalTitle: goalTitle ?? run.task,
    task: run.task,
    status: run.status === "completed" ? "완료" : run.status,
    createdAt: run.createdAt,
    artifacts: orderArtifacts(run.artifacts),
  };
}

export function buildWorkflowExportMarkdown(run: WorkflowRun, companyName?: string, goalTitle?: string) {
  const base = createWorkflowExportBase(run, companyName, goalTitle);

  return [
    `# 실행 결과 내보내기`,
    "",
    `- 회사: ${base.companyName}`,
    `- 목표: ${base.goalTitle}`,
    `- 실행 상태: ${base.status}`,
    `- 실행 시각: ${base.createdAt}`,
    "",
    `## 실행 작업`,
    "",
    base.task,
    "",
    ...base.artifacts.flatMap((artifact, index) => [
      `## ${index + 1}. ${typeLabel[artifact.type]}`,
      "",
      `- 담당 역할: ${roleLabel[artifact.role]}`,
      `- 결과물 제목: ${artifact.title}`,
      `- 요약: ${artifact.summary}`,
      "",
      ...artifact.content.map((item) => `- ${item}`),
      "",
    ]),
  ].join("\n");
}

export function buildWorkflowExportText(run: WorkflowRun, companyName?: string, goalTitle?: string) {
  const base = createWorkflowExportBase(run, companyName, goalTitle);

  return [
    `실행 결과 내보내기`,
    ``,
    `회사: ${base.companyName}`,
    `목표: ${base.goalTitle}`,
    `실행 상태: ${base.status}`,
    `실행 시각: ${base.createdAt}`,
    ``,
    `실행 작업`,
    base.task,
    ``,
    ...base.artifacts.flatMap((artifact, index) => [
      `${index + 1}. ${typeLabel[artifact.type]}`,
      `담당 역할: ${roleLabel[artifact.role]}`,
      `결과물 제목: ${artifact.title}`,
      `요약: ${artifact.summary}`,
      ...artifact.content.map((item, itemIndex) => `${itemIndex + 1}) ${item}`),
      ``,
    ]),
  ].join("\n");
}

/**
 * 웹 검색 원본 결과 + LLM 합성 내용을 리서치 노트 마크다운으로 생성합니다.
 * 이 파일이 research-notes.md로 저장됩니다.
 */
export function buildResearchMarkdown(
  goalTitle: string,
  companyName: string,
  query: string,
  rawSearch: TavilySearchResponse,
  synthesis: ResearchSynthesisResult,
): string {
  const now = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const lines: string[] = [
    `# 조사 보고서: ${synthesis.reportTitle}`,
    "",
    `> ${synthesis.summary}`,
    "",
    `- **조사 주제**: ${goalTitle}`,
    `- **관련 회사**: ${companyName}`,
    `- **검색 쿼리**: ${query}`,
    `- **출처 수**: ${rawSearch.results.length}개`,
    `- **작성 일시**: ${now}`,
    "",
    "---",
    "",
  ];

  // 합성된 섹션
  synthesis.sections.forEach((section, i) => {
    lines.push(`## ${i + 1}. ${section.title}`, "");
    section.points.forEach((pt) => lines.push(`- ${pt}`));
    lines.push("");
  });

  // 결론
  if (synthesis.conclusion.length > 0) {
    lines.push("## 결론 및 시사점", "");
    synthesis.conclusion.forEach((c) => lines.push(`- ${c}`));
    lines.push("");
  }

  // 원본 검색 결과
  lines.push("---", "", "## 원본 검색 결과", "");
  rawSearch.results.forEach((r, i) => {
    lines.push(
      `### ${i + 1}. ${r.title}`,
      "",
      `**출처**: ${r.url}`,
      "",
      r.content,
      "",
    );
  });

  return lines.join("\n");
}
