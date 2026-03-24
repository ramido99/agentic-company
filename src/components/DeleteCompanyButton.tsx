"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DeleteCompanyButtonProps {
  companyId: string;
  companyName: string;
  runCount: number;
  /** 삭제 후 이동할 경로 (기본값: /companies) */
  redirectTo?: string;
  /** "icon" 모드는 ⋯ 메뉴 안에 쓸 텍스트 스타일 버튼 */
  variant?: "danger" | "icon-text";
}

export function DeleteCompanyButton({
  companyId,
  companyName,
  runCount,
  redirectTo = "/companies",
  variant = "danger",
}: DeleteCompanyButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const confirmRef = useRef<HTMLButtonElement>(null);

  // 모달 열릴 때 확인 버튼으로 포커스
  useEffect(() => {
    if (open) setTimeout(() => confirmRef.current?.focus(), 50);
  }, [open]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/companies/${companyId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "삭제에 실패했습니다.");
      setOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  const triggerBtn =
    variant === "icon-text" ? (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "8px 12px",
          background: "none",
          border: "none",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--red, #ef4444)",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        🗑 회사 삭제
      </button>
    ) : (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "8px 16px",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--red, #ef4444)",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.18)";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.1)";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
        }}
      >
        🗑 회사 삭제
      </button>
    );

  return (
    <>
      {triggerBtn}

      {/* 오버레이 */}
      {open && (
        <div
          onClick={() => !loading && setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          {/* 모달 */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              zIndex: 9999,
              background: "var(--surface, #1a1a2e)",
              border: "1px solid var(--border, rgba(255,255,255,0.1))",
              borderRadius: "16px",
              padding: "28px 32px",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* 경고 아이콘 + 제목 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div
                style={{
                  flexShrink: 0,
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                ⚠️
              </div>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
                  회사를 삭제하시겠습니까?
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--text)" }}>{companyName}</strong> 을(를) 삭제합니다.
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
            </div>

            {/* 삭제 내역 요약 */}
            <div
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "10px",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <p style={{ fontSize: "12px", fontWeight: 700, color: "rgba(239,68,68,0.9)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
                삭제되는 데이터
              </p>
              {[
                "회사 기본 정보",
                "연결된 모든 목표",
                `워크플로우 실행 이력 (${runCount}건)`,
                "에이전트 산출물 (브리프 · 실행계획 · 체크리스트 · 리뷰)",
                "저장된 PPT · MD · XLSX 파일 전체",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "rgba(239,68,68,0.7)", fontSize: "12px" }}>✕</span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p style={{ fontSize: "13px", color: "#ef4444", background: "rgba(239,68,68,0.08)", padding: "10px 14px", borderRadius: "8px", margin: 0 }}>
                {error}
              </p>
            )}

            {/* 버튼 행 */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                style={{
                  padding: "9px 20px",
                  background: "var(--surface-raised, rgba(255,255,255,0.06))",
                  border: "1px solid var(--border, rgba(255,255,255,0.1))",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "background 0.15s",
                }}
              >
                취소
              </button>
              <button
                ref={confirmRef}
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: "9px 20px",
                  background: loading ? "rgba(239,68,68,0.4)" : "#ef4444",
                  border: "1px solid transparent",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#fff",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "background 0.15s",
                  minWidth: "100px",
                  justifyContent: "center",
                }}
              >
                {loading ? (
                  <>
                    <span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    삭제 중...
                  </>
                ) : (
                  "영구 삭제"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스피너 keyframe (전역 중복 방지용 id) */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
