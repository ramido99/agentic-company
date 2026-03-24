import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/sign-in",
    },
  },
);

// 보호할 경로 — 랜딩(/), 로그인/회원가입, NextAuth API, auth callback, 정적 파일 제외
export const config = {
  matcher: [
    "/((?!$|sign-in|sign-up|auth/callback|api/auth|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
