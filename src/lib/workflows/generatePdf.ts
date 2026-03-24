/**
 * generatePdf.ts
 * 워크플로 결과물을 PDF 문서로 생성합니다.
 * 서버 사이드에서 실행되며 puppeteer 없이 HTML → PDF 변환을 사용합니다.
 * (Node.js 환경: html-pdf-node 또는 순수 HTML 문자열 방식)
 *
 * 실제 배포 환경에서는 Supabase Edge Function 또는 별도 PDF 서비스를 추천합니다.
 * 여기서는 서버 side에서 HTML 기반 PDF를 생성합니다.
 */
import { type WorkflowRun } from "@/lib/types";
import { createWorkflowExportBase } from "@/lib/workflows/exportArtifacts";

const typeLabel: Record<string, string> = {
  brief: "브리프",
  "execution-plan": "실행 계획",
  checklist: "체크리스트",
  review: "리뷰",
};

const roleLabel: Record<string, string> = {
  strategist: "전략가",
  operator: "실행 담당",
  reviewer: "검토자",
};

const typeColor: Record<string, string> = {
  brief: "#A78BFA",
  "execution-plan": "#60A5FA",
  checklist: "#34D399",
  review: "#F59E0B",
};

/**
 * HTML 기반 PDF 생성
 * html 문자열을 반환하며 Supabase Storage에 저장하거나
 * Chromium 기반 렌더러(예: @sparticuz/chromium + puppeteer-core)와 연계 가능
 */
export function generatePdfHtml(
  run: WorkflowRun,
  companyName?: string,
  goalTitle?: string,
): string {
  const base = createWorkflowExportBase(run, companyName, goalTitle);
  const dateStr = new Date(base.createdAt).toLocaleDateString("ko-KR");

  const artifactHtml = base.artifacts
    .map(
      (artifact, index) => `
    <div class="artifact-section">
      <div class="artifact-header" style="border-left-color: ${typeColor[artifact.type] ?? "#A78BFA"}">
        <span class="artifact-badge" style="background: ${typeColor[artifact.type] ?? "#A78BFA"}20; color: ${typeColor[artifact.type] ?? "#A78BFA"}">
          ${typeLabel[artifact.type] ?? artifact.type}
        </span>
        <h2>${index + 1}. ${artifact.title}</h2>
        <p class="artifact-role">담당: ${roleLabel[artifact.role] ?? artifact.role}</p>
        <p class="artifact-summary">${artifact.summary}</p>
      </div>
      <ul class="artifact-content">
        ${artifact.content.map((item) => `<li>${item}</li>`).join("\n        ")}
      </ul>
    </div>
  `,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${base.goalTitle} - 실행 결과 리포트</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', Arial, sans-serif;
      font-size: 13px;
      color: #1A1A2E;
      background: #FAFAF8;
      line-height: 1.6;
    }
    .cover {
      background: #1A1A2E;
      color: white;
      padding: 60px 56px;
      min-height: 260px;
      page-break-after: always;
    }
    .cover-company {
      font-size: 14px;
      color: #A78BFA;
      font-weight: 600;
      margin-bottom: 12px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .cover-title {
      font-size: 32px;
      font-weight: 800;
      color: white;
      margin-bottom: 16px;
      line-height: 1.25;
    }
    .cover-task {
      font-size: 15px;
      color: #AAAACC;
      max-width: 600px;
      line-height: 1.6;
    }
    .cover-meta {
      margin-top: 32px;
      font-size: 12px;
      color: #888899;
    }
    .main {
      padding: 40px 56px;
      max-width: 800px;
      margin: 0 auto;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: #A78BFA;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    .artifact-section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .artifact-header {
      border-left: 4px solid #A78BFA;
      padding-left: 16px;
      margin-bottom: 16px;
    }
    .artifact-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 4px;
      margin-bottom: 8px;
      letter-spacing: 0.04em;
    }
    .artifact-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: #1A1A2E;
      margin-bottom: 4px;
    }
    .artifact-role {
      font-size: 11px;
      color: #888899;
      margin-bottom: 6px;
    }
    .artifact-summary {
      font-size: 13px;
      color: #6B6B8A;
      font-style: italic;
    }
    .artifact-content {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .artifact-content li {
      position: relative;
      padding-left: 20px;
      font-size: 13px;
      color: #1A1A2E;
      line-height: 1.6;
    }
    .artifact-content li::before {
      content: "•";
      position: absolute;
      left: 6px;
      color: #A78BFA;
    }
    .divider {
      border: none;
      border-top: 1px solid #E5E5EE;
      margin: 32px 0;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #AAAACC;
      padding: 24px;
      border-top: 1px solid #E5E5EE;
    }
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-company">${base.companyName}</div>
    <div class="cover-title">${base.goalTitle}</div>
    <div class="cover-task">${base.task}</div>
    <div class="cover-meta">실행 일시: ${dateStr} &nbsp;·&nbsp; 상태: ${base.status}</div>
  </div>

  <div class="main">
    <div class="section-label">실행 결과 리포트</div>
    ${artifactHtml}
  </div>

  <div class="footer">
    Agentic Company &nbsp;·&nbsp; ${dateStr} &nbsp;·&nbsp; 총 ${base.artifacts.length}개 결과물
  </div>
</body>
</html>`;
}

/**
 * HTML 문자열을 Buffer로 반환 (UTF-8 인코딩)
 * Supabase Storage에 .html로 저장하거나, 별도 PDF 변환 서비스로 전달 가능
 */
export function generatePdfBuffer(
  run: WorkflowRun,
  companyName?: string,
  goalTitle?: string,
): Buffer {
  const html = generatePdfHtml(run, companyName, goalTitle);
  return Buffer.from(html, "utf-8");
}
