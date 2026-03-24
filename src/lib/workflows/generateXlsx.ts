/**
 * generateXlsx.ts
 * 워크플로 결과물을 Excel 스프레드시트로 생성합니다.
 * xlsx (SheetJS) 라이브러리 사용
 */
import * as XLSX from "xlsx";
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

export function generateXlsxBuffer(
  run: WorkflowRun,
  companyName?: string,
  goalTitle?: string,
): Buffer {
  const base = createWorkflowExportBase(run, companyName, goalTitle);
  const wb = XLSX.utils.book_new();

  // ── 1. 요약 시트 ─────────────────────────────────────
  const summaryData = [
    ["Agentic Company - 워크플로 실행 결과"],
    [],
    ["항목", "내용"],
    ["회사", base.companyName],
    ["목표", base.goalTitle],
    ["실행 작업", base.task],
    ["상태", base.status],
    ["실행 일시", new Date(base.createdAt).toLocaleString("ko-KR")],
    [],
    ["결과물 수", base.artifacts.length],
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [{ wch: 20 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, "요약");

  // ── 2. 실행 계획 체크리스트 시트 ──────────────────────
  const checklistRows: (string | number)[][] = [
    ["#", "담당", "유형", "항목", "상태"],
  ];

  let rowIdx = 1;
  for (const artifact of base.artifacts) {
    for (const item of artifact.content) {
      checklistRows.push([
        rowIdx++,
        roleLabel[artifact.role] ?? artifact.role,
        typeLabel[artifact.type] ?? artifact.type,
        item,
        "미완료",
      ]);
    }
  }

  const checklistWs = XLSX.utils.aoa_to_sheet(checklistRows);
  checklistWs["!cols"] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 14 },
    { wch: 70 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, checklistWs, "실행 체크리스트");

  // ── 3. 아티팩트별 시트 ────────────────────────────────
  for (const artifact of base.artifacts) {
    const artifactData: (string | number)[][] = [
      [artifact.title],
      ["담당 역할", roleLabel[artifact.role] ?? artifact.role],
      ["결과물 유형", typeLabel[artifact.type] ?? artifact.type],
      ["요약", artifact.summary],
      [],
      ["#", "내용"],
      ...artifact.content.map((item, i) => [i + 1, item]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(artifactData);
    ws["!cols"] = [{ wch: 8 }, { wch: 80 }];
    const sheetName = (typeLabel[artifact.type] ?? artifact.type).slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buf);
}
