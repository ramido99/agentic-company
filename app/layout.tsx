import type { Metadata } from "next";
import "./globals.css";
import { getAuthSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "Agentic Company",
  description: "AI 인력을 채용하고 조직처럼 운영하여 아이디어를 실행하는 플랫폼",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  return (
    <html lang="ko">
      <body>
        <SessionProviderWrapper session={session}>
          <AppShell>{children}</AppShell>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
