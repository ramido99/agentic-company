"use client";

import React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AuthForm } from "@/components/ui/sign-in-1";

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF9F6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <AuthForm
        mode="signup"
        primaryAction={{
          label: "Google로 회원가입",
          onClick: () => signIn("google", { callbackUrl: "/auth/callback?mode=signup" }),
        }}
        footerContent={
          <>
            이미 계정이 있으신가요?{" "}
            <Link href="/sign-in" style={{ color: "#D97757", fontWeight: 600, textDecoration: "none" }}>
              로그인
            </Link>
          </>
        }
      />

      <div style={{ marginTop: "28px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", color: "#C4BDB5", lineHeight: 1.7, maxWidth: "320px", margin: "0 auto" }}>
          가입하면{" "}
          <span style={{ textDecoration: "underline", cursor: "pointer" }}>이용약관</span>
          {" "}및{" "}
          <span style={{ textDecoration: "underline", cursor: "pointer" }}>개인정보처리방침</span>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
