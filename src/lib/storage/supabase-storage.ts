import { createClient } from "@supabase/supabase-js";

const BUCKET = "workflow-artifacts";

export type OutputFormat = "md" | "pptx" | "xlsx" | "pdf";

const FORMAT_CONTENT_TYPE: Record<OutputFormat, string> = {
  md: "application/octet-stream",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "text/html; charset=utf-8",
};

function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/** 워크플로 결과물 마크다운을 Storage에 업로드 */
export async function uploadWorkflowResult(input: {
  workspaceId: string;
  runId: string;
  content: string;
  filename?: string;
}): Promise<{ storagePath: string }> {
  const supabase = getStorageClient();
  const filename = input.filename ?? "workflow-results.md";
  const storagePath = `${input.workspaceId}/${input.runId}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, Buffer.from(input.content, "utf-8"), {
      contentType: "application/octet-stream",
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage 업로드 실패: ${error.message}`);
  }

  return { storagePath };
}

/** 바이너리 버퍼를 특정 포맷으로 Storage에 업로드 */
export async function uploadWorkflowResultBuffer(input: {
  workspaceId: string;
  runId: string;
  buffer: Buffer;
  format: OutputFormat;
}): Promise<{ storagePath: string }> {
  const supabase = getStorageClient();
  const ext = input.format === "pdf" ? "html" : input.format;
  const filename = `workflow-results.${ext}`;
  const storagePath = `${input.workspaceId}/${input.runId}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, input.buffer, {
      contentType: FORMAT_CONTENT_TYPE[input.format],
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage 업로드 실패 (${input.format}): ${error.message}`);
  }

  return { storagePath };
}

/** 특정 runId에 대해 어떤 출력 포맷이 Storage에 존재하는지 확인 */
export async function listAvailableFormats(
  workspaceId: string,
  runId: string,
): Promise<OutputFormat[]> {
  const supabase = getStorageClient();
  const folder = `${workspaceId}/${runId}`;

  const { data } = await supabase.storage.from(BUCKET).list(folder);
  if (!data) return [];

  const names = data.map((f) => f.name);
  const available: OutputFormat[] = [];

  // research-notes.md 우선, 없으면 workflow-results.md
  if (names.includes("research-notes.md") || names.includes("workflow-results.md")) available.push("md");
  if (names.includes("workflow-results.pptx")) available.push("pptx");
  if (names.includes("workflow-results.xlsx")) available.push("xlsx");
  if (names.includes("workflow-results.html")) available.push("pdf");

  return available;
}

/** 다운로드용 서명 URL 발급 (1시간 유효) */
export async function createSignedDownloadUrl(storagePath: string): Promise<string> {
  const supabase = getStorageClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60); // 1시간

  if (error || !data?.signedUrl) {
    throw new Error(`서명 URL 발급 실패: ${error?.message ?? "unknown"}`);
  }

  return data.signedUrl;
}

/**
 * 특정 workflowRun의 모든 파일을 Storage에서 삭제합니다.
 * 파일이 없는 경우에도 에러 없이 넘어갑니다.
 */
export async function deleteWorkflowRunFiles(
  workspaceId: string,
  runId: string,
): Promise<void> {
  const supabase = getStorageClient();
  const folder = `${workspaceId}/${runId}`;

  const { data } = await supabase.storage.from(BUCKET).list(folder);
  if (!data || data.length === 0) return;

  const paths = data.map((f) => `${folder}/${f.name}`);
  await supabase.storage.from(BUCKET).remove(paths);
}

/**
 * 한 회사에 속한 모든 워크플로우 실행의 Storage 파일을 일괄 삭제합니다.
 * runIds: 해당 회사의 모든 WorkflowRun ID 배열
 */
export async function deleteCompanyStorageFiles(
  workspaceId: string,
  runIds: string[],
): Promise<void> {
  if (runIds.length === 0) return;
  await Promise.all(runIds.map((runId) => deleteWorkflowRunFiles(workspaceId, runId)));
}

/** Storage 경로로 파일 존재 여부 확인 */
export async function fileExists(storagePath: string): Promise<boolean> {
  const supabase = getStorageClient();
  const parts = storagePath.split("/");
  const folder = parts.slice(0, -1).join("/");

  const { data } = await supabase.storage
    .from(BUCKET)
    .list(folder);

  const fileName = parts[parts.length - 1];
  return (data ?? []).some((f) => f.name === fileName);
}
