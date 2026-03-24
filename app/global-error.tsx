"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          background: "#08080c",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #38bdf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ⚡
          </div>

          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "white", marginBottom: "10px", letterSpacing: "-0.02em" }}>
              Agentic Company
            </h1>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              앱에 오류가 발생했습니다. 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
          </div>

          <button
            onClick={reset}
            style={{
              height: "44px",
              padding: "0 32px",
              borderRadius: "9999px",
              background: "white",
              color: "black",
              fontSize: "14px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
