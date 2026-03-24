import { getAuthSession } from "@/lib/auth";
import { getCurrentWorkspace } from "@/lib/auth/workspace";
import { SettingsAccountSection } from "@/components/SettingsAccountSection";
import { SettingsLLMSection } from "@/components/SettingsLLMSection";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getAuthSession();
  const workspace = await getCurrentWorkspace();
  const user = session?.user;

  const joinedAt = workspace?.createdAt
    ? new Date(workspace.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "-";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <span className="page-eyebrow">설정</span>
        <h1 className="page-title">계정 설정</h1>
        <p className="page-description">프로필, 워크스페이스, API 연결을 관리합니다.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "600px" }}>

        {/* 프로필 */}
        <div>
          <p className="section-title" style={{ marginBottom: "12px" }}>프로필</p>
          <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {user?.image ? (
                <img src={user.image} alt={user.name ?? ""} style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "white" }}>
                  {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{user?.name ?? "-"}</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{user?.email ?? "-"}</div>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-faint)" }}>Google 계정과 연동된 프로필입니다. 이름과 사진은 Google에서 관리됩니다.</p>
          </div>
        </div>

        {/* 워크스페이스 */}
        <div>
          <p className="section-title" style={{ marginBottom: "12px" }}>워크스페이스</p>
          <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "워크스페이스 이름", value: workspace?.name ?? "-" },
              { label: "워크스페이스 슬러그", value: workspace?.slug ?? "-" },
              { label: "생성 날짜", value: joinedAt },
            ].map((item) => (
              <div key={item.label} className="form-group">
                <label className="form-label">{item.label}</label>
                <div className="form-input" style={{ background: "var(--surface-subtle)", color: "var(--text-muted)", cursor: "default" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LLM API 연결 — 사용자 키 직접 등록 */}
        <SettingsLLMSection />

        {/* 위험 구역 — 탈퇴 */}
        <SettingsAccountSection />
      </div>
    </div>
  );
}
