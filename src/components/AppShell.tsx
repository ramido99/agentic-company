"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { AppNavigation } from "./AppNavigation";

function UserPanel() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  const user = session.user;
  const name = user.name ?? user.email ?? "사용자";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.12)" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Workspace</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}의 워크스페이스
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {user.image ? (
          <img src={user.image} alt={name} style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
        ) : (
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "white" }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name ?? "사용자"}</div>
          {user.email && <div style={{ fontSize: "10px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          title="로그아웃"
          style={{ flexShrink: 0, width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", borderRadius: "4px", transition: "color 150ms,background 150ms" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>

      <Link href="/settings" style={{ display: "block", textAlign: "center", fontSize: "11px", color: "rgba(255,255,255,0.2)", textDecoration: "none", padding: "4px", transition: "color 150ms" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.2)"; }}
      >
        계정 설정
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreenPage =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/auth/");

  if (isFullscreenPage) return <>{children}</>;

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">AC</div>
          <div>
            <div className="sidebar-brand-name">Agentic Company</div>
            <div className="sidebar-brand-sub">AI 운영 플랫폼</div>
          </div>
        </div>
        <AppNavigation />
        <UserPanel />
      </aside>
      <main className="app-main">
        <div className="app-main-inner">{children}</div>
      </main>
    </div>
  );
}
