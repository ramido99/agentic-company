"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthForm } from "@/components/ui/sign-in-1";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

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
        mode="signin"
        primaryAction={{
          label: "Google로 로그인",
          onClick: () => signIn("google", { callbackUrl: "/auth/callback?mode=signin" }),
        }}
        errorContent={
          error === "no_account" ? (
            <>
              가입된 계정이 없습니다.{" "}
              <Link href="/sign-up" style={{ color: "#D97757", fontWeight: 600, textDecoration: "underline" }}>
                회원가입
              </Link>
              을 먼저 해주세요.
            </>
          ) : null
        }
        footerContent={
          <>
            계정이 없으신가요?{" "}
            <Link href="/sign-up" style={{ color: "#D97757", fontWeight: 600, textDecoration: "none" }}>
              회원가입
            </Link>
          </>
        }
      />

      <div style={{ marginTop: "28px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", color: "#C4BDB5", lineHeight: 1.7, maxWidth: "320px", margin: "0 auto" }}>
          로그인하면{" "}
          <span style={{ textDecoration: "underline", cursor: "pointer" }}>이용약관</span>
          {" "}및{" "}
          <span style={{ textDecoration: "underline", cursor: "pointer" }}>개인정보처리방침</span>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
