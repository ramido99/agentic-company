"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function SettingsAccountSection() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/settings/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "탈퇴 처리 중 오류가 발생했습니다.");
        setLoading(false);
        return;
      }
      // 탈퇴 완료 → 로그아웃 후 랜딩으로
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="section-title" style={{ marginBottom: "12px", color: "var(--danger)" }}>위험 구역</p>
      <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", borderColor: "rgba(248,113,113,0.15)" }}>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>계정 탈퇴</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
            탈퇴 시 계정, 워크스페이스, 모든 데이터(회사, 목표, 워크플로우)가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        {error && (
          <p style={{ fontSize: "13px", color: "var(--danger)", background: "var(--danger-soft)", padding: "10px 14px", borderRadius: "6px" }}>
            {error}
          </p>
        )}

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            style={{ alignSelf: "flex-start", padding: "8px 16px", background: "transparent", border: "1px solid rgba(248,113,113,0.4)", borderRadius: "6px", color: "var(--danger)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 150ms" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            계정 탈퇴
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "rgba(248,113,113,0.06)", borderRadius: "8px", border: "1px solid rgba(248,113,113,0.15)" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--danger)" }}>
              정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{ padding: "8px 16px", background: "linear-gradient(180deg,#dc2626,#b91c1c)", border: "none", borderRadius: "6px", color: "white", fontSize: "13px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "처리 중..." : "네, 탈퇴합니다"}
              </button>
              <button
                onClick={() => { setConfirming(false); setError(""); }}
                disabled={loading}
                style={{ padding: "8px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer" }}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
