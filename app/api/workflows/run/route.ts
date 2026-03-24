import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { assertCanRunWorkflow } from "@/lib/billing/usage-guard";
import { usageRecordRepository } from "@/lib/repositories/usage-record-repository";
import { runWorkflow } from "@/lib/workflows/runWorkflow";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { goalId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const goalId = typeof body.goalId === "string" ? body.goalId.trim() : "";

  if (!goalId) {
    return NextResponse.json({ error: "실행할 목표를 선택해 주세요." }, { status: 400 });
  }

  try {
    await assertCanRunWorkflow();

    const workflowRun = await runWorkflow(goalId, session.user.id);

    await usageRecordRepository.create({
      workflowRunId: workflowRun.id,
      metric: "workflow_run_started",
      value: 1,
      metadata: { status: "completed" },
    });

    return NextResponse.json({ workflowRun }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/workflows/run]", error);
    const message = error instanceof Error ? error.message : "워크플로우 실행에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
