"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Nav Items ──────────────────────────────────────────────────────────────
function NavItem({ label, href = "#" }: { label: string; href?: string }) {
  return (
    <Link
      href={href}
      style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
    >
      {label}
    </Link>
  );
}

function MobileNavItem({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", fontSize: "18px", color: "white" }}>
      <span>{label}</span>
      <ArrowRight style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.4)" }} />
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden", background: "#000000", fontFamily: "inherit" }}>

      {/* ── Gradient Blobs ──────────────────────────────────────────────── */}
      <div style={{ position: "absolute", top: 0, right: "-240px", display: "flex", flexDirection: "column", alignItems: "flex-end", zIndex: 0 }}>
        <div style={{ height: "160px", width: "960px", borderRadius: "9999px", background: "linear-gradient(to bottom, #9333ea, #0ea5e9)", filter: "blur(96px)", opacity: 0.7 }} />
        <div style={{ height: "160px", width: "1440px", borderRadius: "9999px", background: "linear-gradient(to bottom, #831843, #facc15)", filter: "blur(96px)", opacity: 0.5 }} />
        <div style={{ height: "160px", width: "960px", borderRadius: "9999px", background: "linear-gradient(to bottom, #ca8a04, #0ea5e9)", filter: "blur(96px)", opacity: 0.6 }} />
      </div>

      {/* ── Noise Overlay ────────────────────────────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")", opacity: 0.15 }} />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 10 }}>

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <nav style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", marginTop: "24px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap style={{ width: "16px", height: "16px", color: "black", fill: "black" }} />
            </div>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>Agentic Company</span>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              <NavItem label="에이전트 시스템" />
              <NavItem label="워크플로" />
              <NavItem label="요금제" />
              <NavItem label="데모" href="/dashboard" />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Link
                href="/sign-in"
                style={{ height: "48px", borderRadius: "9999px", background: "white", padding: "0 32px", fontSize: "14px", fontWeight: 600, color: "black", textDecoration: "none", display: "flex", alignItems: "center" }}
              >
                시작하기
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: "8px" }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X style={{ width: "24px", height: "24px", color: "white" }} /> : <Menu style={{ width: "24px", height: "24px", color: "white" }} />}
          </button>
        </nav>

        {/* ── Mobile Menu ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3 }}
              style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", padding: "24px", background: "rgba(0,0,0,0.97)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap style={{ width: "16px", height: "16px", color: "black", fill: "black" }} />
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>Agentic Company</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X style={{ width: "24px", height: "24px", color: "white" }} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <MobileNavItem label="에이전트 시스템" />
                <MobileNavItem label="워크플로" />
                <MobileNavItem label="요금제" />
                <MobileNavItem label="데모" />
                <Link href="/sign-in" style={{ height: "48px", borderRadius: "9999px", background: "white", fontSize: "14px", fontWeight: 600, color: "black", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  무료로 시작하기
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Badge ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", background: "rgba(255,255,255,0.1)", padding: "8px 20px", backdropFilter: "blur(8px)" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "white" }}>AI 조직 운영의 새로운 기준</span>
            <ArrowRight style={{ width: "14px", height: "14px", color: "white" }} />
          </div>
        </motion.div>

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 32px 0", textAlign: "center" }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "white", maxWidth: "900px", margin: "0 auto 24px" }}
          >
            AI 인력을 채용하고<br />
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              조직처럼 운영하세요
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 40px" }}
          >
            아이디어를 실행 가능한 결과물로. 전략가, 실행담당, 검토자가 구조화된 워크플로로 순서대로 일합니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "80px" }}
          >
            <Link href="/sign-in" style={{ height: "48px", borderRadius: "9999px", background: "white", padding: "0 32px", fontSize: "15px", fontWeight: 600, color: "black", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              7일 무료 체험 시작
            </Link>
            <Link href="/dashboard" style={{ height: "48px", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.25)", padding: "0 32px", fontSize: "15px", fontWeight: 600, color: "white", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              데모 둘러보기
            </Link>
          </motion.div>

          {/* ── Dashboard Preview ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ position: "relative", maxWidth: "960px", margin: "0 auto 0" }}
          >
            <div style={{ position: "absolute", inset: 0, borderRadius: "16px", background: "rgba(167,139,250,0.15)", filter: "blur(60px)" }} />
            {/* Mock Dashboard UI */}
            <div style={{ position: "relative", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", overflow: "hidden" }}>
              {/* Window Chrome */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.3)" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#febc2e" }} />
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28c840" }} />
                <div style={{ marginLeft: "12px", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>agentic-company.ai/dashboard</div>
              </div>
              {/* Dashboard Content */}
              <div style={{ display: "flex", height: "340px" }}>
                {/* Sidebar */}
                <div style={{ width: "200px", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "20px 16px", display: "flex", flexDirection: "column", gap: "6px", background: "rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", marginBottom: "8px" }}>AGENTIC CO.</div>
                  {["대시보드", "회사 관리", "목표 설정", "워크플로", "에이전트"].map((item, i) => (
                    <div key={item} style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "13px", color: i === 0 ? "white" : "rgba(255,255,255,0.45)", background: i === 0 ? "rgba(167,139,250,0.2)" : "transparent", fontWeight: i === 0 ? 600 : 400 }}>
                      {item}
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div style={{ flex: 1, padding: "24px", overflow: "hidden" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "16px" }}>워크플로 실행 현황</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
                    {[{ label: "완료된 워크플로", value: "24", color: "#a78bfa" }, { label: "진행 중", value: "3", color: "#38bdf8" }, { label: "생성된 아티팩트", value: "96", color: "#4ade80" }].map((s) => (
                      <div key={s.label} style={{ borderRadius: "10px", padding: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderRadius: "10px", padding: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>최근 워크플로</div>
                    {[{ name: "마케팅 전략 수립", status: "완료", color: "#4ade80" }, { name: "제품 로드맵 설계", status: "실행 중", color: "#38bdf8" }, { name: "경쟁사 분석 리뷰", status: "완료", color: "#4ade80" }].map((w) => (
                      <div key={w.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{w.name}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: w.color }}>{w.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Agent System ─────────────────────────────────────────────────── */}
        <section style={{ padding: "120px 32px 80px", maxWidth: "1280px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: "64px" }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "20px" }}>
              Agent System
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "white", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
              세 가지 역할이 순서대로 일합니다
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", maxWidth: "480px", margin: "0 auto" }}>
              채팅이 아닌 구조화된 워크플로. 각 에이전트는 정해진 결과물만 생산합니다.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {[
              { num: "01", gradient: "linear-gradient(135deg, #7c3aed, #4f46e5)", role: "전략가 (Strategist)", output: "BRIEF 생성", desc: "목표를 해석하고 방향을 설정합니다. 실행 가능한 브리프 문서를 산출합니다." },
              { num: "02", gradient: "linear-gradient(135deg, #0891b2, #06b6d4)", role: "실행담당 (Operator)", output: "PLAN + CHECKLIST", desc: "브리프를 바탕으로 실행 계획과 체크리스트를 만듭니다." },
              { num: "03", gradient: "linear-gradient(135deg, #9333ea, #a855f7)", role: "검토자 (Reviewer)", output: "REVIEW 생성", desc: "생성된 결과물 전체를 검토하고 품질을 보증합니다." },
            ].map((a, i) => (
              <motion.div
                key={a.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ borderRadius: "20px", padding: "28px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: a.gradient, fontSize: "12px", fontWeight: 800, color: "white" }}>{a.num}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>{a.output}</span>
                </div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "white", margin: "0 0 10px" }}>{a.role}</p>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: 0 }}>{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Workflow ─────────────────────────────────────────────────────── */}
        <section style={{ padding: "40px 32px 100px", textAlign: "center" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "20px" }}>
              Workflow
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, color: "white", letterSpacing: "-0.02em", margin: "0 0 48px" }}>
              목표 하나가 4개의 결과물이 됩니다
            </h2>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "브리프", desc: "전략 방향 정의", color: "#a78bfa", border: "rgba(167,139,250,0.3)" },
                { label: "실행 계획", desc: "세부 계획 수립", color: "#38bdf8", border: "rgba(56,189,248,0.3)" },
                { label: "체크리스트", desc: "실행 항목 정리", color: "#4ade80", border: "rgba(74,222,128,0.3)" },
                { label: "리뷰", desc: "품질 검증", color: "#fb923c", border: "rgba(251,146,60,0.3)" },
              ].map((step, i) => (
                <div key={step.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ borderRadius: "14px", padding: "14px 24px", textAlign: "center", minWidth: "120px", background: "rgba(255,255,255,0.04)", border: `1px solid ${step.border}` }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: step.color, margin: "0 0 4px" }}>{step.label}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{step.desc}</p>
                  </div>
                  {i < 3 && <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.15)", fontWeight: 300 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────────── */}
        <section style={{ padding: "80px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "20px" }}>
                Pricing
              </div>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 800, color: "white", letterSpacing: "-0.02em", margin: 0 }}>
                무료로 시작, 필요할 때 확장
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {[
                { name: "Free", price: "₩0", period: "/월", highlight: false, features: ["회사 1개", "월 5회 실행", "기본 에이전트 3종"] },
                { name: "Solo", price: "₩29,000", period: "/월", highlight: true, features: ["회사 5개", "월 50회 실행", "전체 에이전트", "Export 기능"] },
                { name: "Studio", price: "₩99,000", period: "/월", highlight: false, features: ["무제한 회사", "월 300회 실행", "팀 멤버십", "전용 지원"] },
              ].map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{
                    borderRadius: "20px",
                    padding: "32px 28px",
                    background: plan.highlight ? "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.4))" : "rgba(255,255,255,0.04)",
                    border: plan.highlight ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    position: "relative"
                  }}
                >
                  {plan.highlight && (
                    <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", display: "inline-block", borderRadius: "9999px", padding: "4px 16px", fontSize: "11px", fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white" }}>추천</div>
                  )}
                  <p style={{ fontSize: "14px", fontWeight: 600, color: plan.highlight ? "#c4b5fd" : "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{plan.name}</p>
                  <p style={{ fontSize: "32px", fontWeight: 800, color: "white", margin: "0 0 24px", letterSpacing: "-0.02em" }}>
                    {plan.price}<span style={{ fontSize: "14px", fontWeight: 400, opacity: 0.5 }}>{plan.period}</span>
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: plan.highlight ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)" }}>
                        <span style={{ color: plan.highlight ? "#c4b5fd" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: "14px" }}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/sign-in"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "44px", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, textDecoration: "none", background: plan.highlight ? "white" : "rgba(255,255,255,0.1)", color: plan.highlight ? "black" : "white" }}
                  >
                    시작하기
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <section style={{ padding: "100px 32px", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 56px)", fontWeight: 800, color: "white", letterSpacing: "-0.02em", margin: "0 0 20px" }}>
              지금 바로 시작하세요
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", margin: "0 0 40px" }}>
              회사 하나를 만들고, AI 인력을 배치하고, 결과물을 받아보세요.
            </p>
            <Link
              href="/sign-in"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "52px", borderRadius: "9999px", background: "white", padding: "0 40px", fontSize: "15px", fontWeight: 700, color: "black", textDecoration: "none" }}
            >
              7일 무료 체험 시작 <ArrowRight style={{ width: "16px", height: "16px" }} />
            </Link>
          </motion.div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer style={{ padding: "28px 32px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "13px", color: "rgba(255,255,255,0.2)" }}>
          © 2026 Agentic Company. AI 조직 운영 시대.
        </footer>

      </div>
    </div>
  );
}
