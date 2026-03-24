"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
          }}
        >
          ⚠️
        </div>

        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
            오류가 발생했습니다
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
            {error.message || "예상치 못한 오류가 발생했습니다. 다시 시도해주세요."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={reset}
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
          <Link
            href="/dashboard"
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-muted)",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            대시보드로
          </Link>
        </div>
      </div>
    </div>
  );
}
