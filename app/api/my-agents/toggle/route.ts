import { NextRequest, NextResponse } from "next/server";

import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const agentId = typeof body.agentId === "string" ? body.agentId : "";
  const active = typeof body.active === "boolean" ? body.active : null;

  if (!agentId || active === null) {
    return NextResponse.json({ error: "에이전트 상태 변경 정보가 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const agent = await agentHiringRepository.setActive(agentId, active);
    return NextResponse.json({ agent }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "에이전트 상태 변경에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
