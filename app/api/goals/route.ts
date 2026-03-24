import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { createGoal, getCompany, listGoals } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const goals = await listGoals();
    return NextResponse.json({ goals });
  } catch (error) {
    console.error("[GET /api/goals]", error);
    return NextResponse.json({ error: "목표 목록을 불러오는 데 실패했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { companyId?: string; title?: string; task?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const companyId = typeof body.companyId === "string" ? body.companyId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const task = typeof body.task === "string" ? body.task.trim() : "";

  if (!companyId) {
    return NextResponse.json({ error: "회사를 선택해 주세요." }, { status: 400 });
  }

  if (!title || !task) {
    return NextResponse.json({ error: "목표 이름과 작업 설명을 모두 입력해 주세요." }, { status: 400 });
  }

  try {
    // 해당 워크스페이스 내에 회사가 존재하는지 확인 (workspace-scoped)
    const company = await getCompany(companyId);
    if (!company) {
      return NextResponse.json({ error: "회사를 찾을 수 없습니다." }, { status: 404 });
    }

    const goal = await createGoal({ companyId, title, task });
    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/goals]", error);
    const message = error instanceof Error ? error.message : "목표 생성에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
