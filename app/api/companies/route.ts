import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { assertCanCreateCompany } from "@/lib/billing/usage-guard";
import { createCompany, listCompanies } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const companies = await listCompanies();
    return NextResponse.json({ companies });
  } catch (error) {
    console.error("[GET /api/companies]", error);
    return NextResponse.json({ error: "회사 목록을 불러오는 데 실패했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { name?: string; idea?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const idea = typeof body.idea === "string" ? body.idea.trim() : "";

  if (!name || !idea) {
    return NextResponse.json({ error: "회사 이름과 사업 아이디어를 모두 입력해 주세요." }, { status: 400 });
  }

  try {
    await assertCanCreateCompany();
    const company = await createCompany({ name, idea });
    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "회사 생성에 실패했습니다.";
    console.error("[POST /api/companies]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
