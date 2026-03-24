import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { bootstrapUserWorkspace } from "@/lib/auth/bootstrap";

interface Props {
  searchParams: Promise<{ mode?: string }>;
}

export default async function AuthCallbackPage({ searchParams }: Props) {
  const { mode } = await searchParams;
  const session = await getServerSession(authOptions);

  // 세션이 없으면 로그인 페이지로
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  // 유저의 워크스페이스/멤버십 존재 여부로 기존/신규 유저 판단
  const membership = await prisma.membership.findFirst({
    where: { userId },
    select: { id: true },
  });

  const hasAccount = !!membership;

  // ── 로그인 모드 ──────────────────────────────────────────
  if (mode === "signin") {
    if (!hasAccount) {
      // 가입된 계정 없음 → 로그인 페이지로 에러 표시
      redirect("/sign-in?error=no_account");
    }
    redirect("/dashboard");
  }

  // ── 회원가입 모드 ─────────────────────────────────────────
  if (mode === "signup") {
    if (!hasAccount) {
      // 신규 유저 → 워크스페이스 생성 후 온보딩으로
      await bootstrapUserWorkspace({
        userId,
        userName: session.user.name,
        userEmail: session.user.email,
      });
      redirect("/onboarding");
    }
    // 이미 계정 있음 → 대시보드로
    redirect("/dashboard");
  }

  // mode 파라미터 없으면 기본적으로 대시보드
  redirect(hasAccount ? "/dashboard" : "/sign-up");
}
