import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// DELETE /api/settings/account — 계정 탈퇴
// 유저, 워크스페이스, 연관 데이터 전부 cascade 삭제
export async function DELETE() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 워크스페이스 삭제 → Cascade로 Company, Goal, WorkflowRun, Artifact 전부 삭제
    const memberships = await prisma.membership.findMany({
      where: { userId },
      select: { workspaceId: true },
    });

    const workspaceIds = memberships.map((m) => m.workspaceId);

    await prisma.$transaction([
      // 워크스페이스 소속 데이터 삭제 (cascade 되지 않는 경우 명시적으로)
      prisma.workspace.deleteMany({ where: { id: { in: workspaceIds } } }),
      // 유저 삭제 (Account, Session, Membership cascade)
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "탈퇴 처리 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
