import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentWorkspace } from "@/lib/auth/workspace";
import {
  createSignedDownloadUrl,
  fileExists,
  listAvailableFormats,
  type OutputFormat,
} from "@/lib/storage/supabase-storage";

const FORMAT_EXT: Record<OutputFormat, string> = {
  md: "md",
  pptx: "pptx",
  xlsx: "xlsx",
  pdf: "html", // HTML 기반 PDF 파일
};

/**
 * GET /api/workflows/download?runId=xxx
 *   전체 사용 가능한 포맷 목록 반환
 *
 * GET /api/workflows/download?runId=xxx&format=pptx
 *   특정 포맷의 서명 URL 반환
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");
  const format = searchParams.get("format") as OutputFormat | null;

  if (!runId) {
    return Response.json({ error: "runId가 필요합니다." }, { status: 400 });
  }

  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return Response.json({ error: "워크스페이스를 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    if (!format) {
      // 사용 가능한 포맷 목록 반환
      const formats = await listAvailableFormats(workspace.id, runId);
      return Response.json({ formats });
    }

    // 특정 포맷의 서명 URL 발급
    // MD의 경우 research-notes.md 우선, 없으면 workflow-results.md
    let storagePath: string;
    if (format === "md") {
      const researchPath = `${workspace.id}/${runId}/research-notes.md`;
      const hasResearch = await fileExists(researchPath);
      storagePath = hasResearch ? researchPath : `${workspace.id}/${runId}/workflow-results.md`;
    } else {
      const ext = FORMAT_EXT[format] ?? format;
      storagePath = `${workspace.id}/${runId}/workflow-results.${ext}`;
    }
    const signedUrl = await createSignedDownloadUrl(storagePath);

    return Response.json({ url: signedUrl, format });
  } catch (error) {
    console.error("[GET /api/workflows/download]", error);
    return Response.json({ error: "다운로드 URL 발급 실패" }, { status: 500 });
  }
}
