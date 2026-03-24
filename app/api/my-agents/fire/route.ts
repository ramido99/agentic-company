import { NextRequest, NextResponse } from "next/server";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const agentId = typeof body.agentId === "string" ? body.agentId : "";

  if (!agentId) {
    return NextResponse.json({ error: "agentId가 필요합니다." }, { status: 400 });
  }

  try {
    await agentHiringRepository.fire(agentId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "에이전트 해제에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
