"use client";

import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthAction {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

interface AuthFormProps {
  mode: "signin" | "signup";
  primaryAction: AuthAction;
  footerContent?: React.ReactNode;
  errorContent?: React.ReactNode;
  style?: React.CSSProperties;
}

// ─── Brand Logo (asterisk style) ──────────────────────────────────────────────

function BrandMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4 L20 36 M4 20 L36 20 M7.03 7.03 L32.97 32.97 M32.97 7.03 L7.03 32.97"
        stroke="#D97757"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Google Icon ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── AuthForm ─────────────────────────────────────────────────────────────────

const AuthForm = ({
  mode,
  primaryAction,
  footerContent,
  errorContent,
  style,
}: AuthFormProps) => {
  const [hovered, setHovered] = React.useState(false);

  const isSignIn = mode === "signin";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
        ...style,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
        <BrandMark />
      </div>

      {/* Card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E8E3DC",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "36px 32px 28px" }}>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h1 style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#1A1714",
              margin: "0 0 6px",
              letterSpacing: "-0.3px",
            }}>
              {isSignIn ? "다시 만나서 반가워요" : "시작해보세요"}
            </h1>
            <p style={{
              fontSize: "14px",
              color: "#8A8278",
              margin: 0,
              lineHeight: 1.5,
            }}>
              {isSignIn
                ? "계정에 로그인하세요"
                : "무료로 계정을 만드세요"}
            </p>
          </div>

          {/* Error message */}
          {errorContent && (
            <div style={{
              marginBottom: "20px",
              padding: "12px 14px",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#B91C1C",
              lineHeight: 1.5,
              textAlign: "center",
            }}>
              {errorContent}
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={primaryAction.onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "10px",
              border: `1px solid ${hovered ? "#C8C2BA" : "#DDD8D0"}`,
              background: hovered ? "#F9F8F6" : "#FFFFFF",
              color: "#1A1714",
              fontSize: "14px",
              fontWeight: 500,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
              transition: "all 150ms ease",
              boxShadow: hovered
                ? "0 2px 8px rgba(0,0,0,0.08)"
                : "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <GoogleIcon />
            {primaryAction.label}
          </button>

          {/* Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "20px 0",
          }}>
            <div style={{ flex: 1, height: "1px", background: "#EDE8E1" }} />
            <span style={{ fontSize: "12px", color: "#B5AFA8", fontWeight: 500 }}>또는</span>
            <div style={{ flex: 1, height: "1px", background: "#EDE8E1" }} />
          </div>

          {/* Email placeholder (disabled) */}
          <button
            type="button"
            disabled
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "10px",
              border: "1px solid #EDE8E1",
              background: "#FAFAF8",
              color: "#B5AFA8",
              fontSize: "14px",
              fontWeight: 400,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "not-allowed",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            이메일로 계속하기 (준비 중)
          </button>

        </div>

        {/* Footer */}
        {footerContent && (
          <div style={{
            padding: "16px 32px 20px",
            borderTop: "1px solid #F0EBE4",
            background: "#FDFCFA",
            fontSize: "12px",
            color: "#9E9890",
            textAlign: "center",
            lineHeight: 1.7,
          }}>
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export { AuthForm };
export type { AuthFormProps, AuthAction };
