import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";
import { assertCanHireAgent } from "@/lib/billing/usage-guard";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { agentId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const agentId = typeof body.agentId === "string" ? body.agentId.trim() : "";

  if (!agentId) {
    return NextResponse.json({ error: "채용할 에이전트를 선택해 주세요." }, { status: 400 });
  }

  try {
    // builtIn 에이전트는 플랜 제한 없이 항상 채용 가능
    const { getAgentById } = await import("@/lib/mock/agent-catalog");
    const baseAgent = getAgentById(agentId);

    if (!baseAgent?.builtIn) {
      // 추가 에이전트는 플랜 한도 확인
      await assertCanHireAgent();
    }

    const agent = await agentHiringRepository.hire(agentId);
    return NextResponse.json({ agent }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "에이전트 채용에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
