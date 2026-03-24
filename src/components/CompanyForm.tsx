"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { AgentCatalogView } from "@/lib/repositories/agent-hiring-repository";
import { AgentRole } from "@/lib/types";
import { Button } from "@/components/ui/Button";

// ─────────────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────────────
type CoreRole = AgentRole; // strategist | operator | reviewer

const coreRoles: CoreRole[] = ["strategist", "operator", "reviewer"];

const coreRoleMeta: Record<CoreRole, { label: string; emoji: string; description: string }> = {
  strategist: { label: "전략가", emoji: "🧭", description: "목표를 브리프로 정리하고 실행 방향을 세웁니다." },
  operator:   { label: "실행 담당", emoji: "⚙️", description: "브리프를 실행 계획과 체크리스트로 바꿉니다." },
  reviewer:   { label: "검토자", emoji: "🔍", description: "결과물의 완결성과 실행 가능성을 확인합니다." },
};

// 추가 배정 역할 카테고리 (코어 3종과 별개로 선택 가능)
type SpecialtyCategory = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  systemRole: CoreRole;
  agentIds: string[];        // 이 카테고리에 속하는 에이전트 id
};

const specialtyCategories: SpecialtyCategory[] = [
  {
    id: "market",
    label: "시장·브랜드 분석",
    emoji: "📊",
    description: "시장 조사, 브랜드 포지셔닝, 고객 가설을 전문으로 합니다.",
    systemRole: "strategist",
    agentIds: ["market-researcher", "brand-strategist", "ux-researcher", "content-strategist"],
  },
  {
    id: "data",
    label: "데이터·IR 전략",
    emoji: "📈",
    description: "KPI 설계, 재무 논리, 투자자 스토리를 전문으로 합니다.",
    systemRole: "strategist",
    agentIds: ["data-analyst", "investor-relations"],
  },
  {
    id: "growth",
    label: "성장·마케팅 실행",
    emoji: "🚀",
    description: "그로스 해킹, 퍼포먼스 마케팅, 캠페인 실행을 전문으로 합니다.",
    systemRole: "operator",
    agentIds: ["growth-hacker", "performance-marketer"],
  },
  {
    id: "product",
    label: "제품·운영 실행",
    emoji: "🛠",
    description: "로드맵 설계, 운영 일정, 릴리스 계획을 전문으로 합니다.",
    systemRole: "operator",
    agentIds: ["product-manager", "ops-manager", "partnership-manager"],
  },
  {
    id: "sales",
    label: "영업·고객 실행",
    emoji: "🤝",
    description: "리드 접점, 고객 온보딩, 리텐션 플레이북을 전문으로 합니다.",
    systemRole: "operator",
    agentIds: ["sales-sdr", "customer-success", "copywriter"],
  },
  {
    id: "risk",
    label: "리스크·법무 검토",
    emoji: "🛡",
    description: "법적 리스크, 컴플라이언스, 리스크 매트릭스를 전문으로 합니다.",
    systemRole: "reviewer",
    agentIds: ["legal-advisor", "risk-manager", "compliance-checker"],
  },
  {
    id: "finance",
    label: "재무·성과 검토",
    emoji: "💰",
    description: "비용 추정, 손익 분석, 임팩트 측정을 전문으로 합니다.",
    systemRole: "reviewer",
    agentIds: ["finance-analyst", "quality-auditor", "impact-evaluator"],
  },
];

// ─────────────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────────────
export function CompanyForm({
  availableAgents,
}: {
  availableAgents: Record<AgentRole, AgentCatalogView[]>;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 코어 역할 선택 (각 역할당 1개 필수)
  const [selectedAgents, setSelectedAgents] = useState<Record<CoreRole, string>>({
    strategist: availableAgents.strategist[0]?.id ?? "",
    operator: availableAgents.operator[0]?.id ?? "",
    reviewer: availableAgents.reviewer[0]?.id ?? "",
  });

  // 추가 전문가 카테고리 선택 (선택적 ON/OFF)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  // 카테고리 내 선택된 에이전트
  const [categoryAgentSelection, setCategoryAgentSelection] = useState<Record<string, string>>({});

  const isStepOneComplete = name.trim().length > 0 && idea.trim().length > 0;
  const isStepTwoComplete = coreRoles.every((role) => selectedAgents[role]);

  // 각 specialty 카테고리에서 실제로 hire 가능한 에이전트 목록
  const specialtyAgentMap = useMemo(() => {
    const map: Record<string, AgentCatalogView[]> = {};
    for (const cat of specialtyCategories) {
      const allForRole = availableAgents[cat.systemRole] ?? [];
      map[cat.id] = allForRole.filter((a) => cat.agentIds.includes(a.id));
    }
    return map;
  }, [availableAgents]);

  function toggleCategory(catId: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
        // 카테고리 첫 번째 에이전트 자동 선택
        const agents = specialtyAgentMap[catId] ?? [];
        if (agents[0] && !categoryAgentSelection[catId]) {
          setCategoryAgentSelection((s) => ({ ...s, [catId]: agents[0].id }));
        }
      }
      return next;
    });
  }

  function selectCategoryAgent(catId: string, agentId: string) {
    setCategoryAgentSelection((s) => ({ ...s, [catId]: agentId }));
  }

  const selectedCorePreview = coreRoles.map((role) => {
    const agent = availableAgents[role]?.find((a) => a.id === selectedAgents[role]);
    return { role, ...coreRoleMeta[role], agentName: agent?.name ?? "선택 안 됨", agentHeadline: agent?.headline ?? "" };
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      if (!isStepOneComplete) { setError("회사 이름과 사업 설명을 모두 입력해 주세요."); return; }
      setError(""); setStep(2); return;
    }
    if (!isStepTwoComplete) { setError("전략가·실행 담당·검토자 모두 에이전트를 선택해 주세요."); return; }

    setSubmitting(true); setError("");

    // 추가 카테고리 에이전트 수집
    const specialtyAssignments: Record<string, string> = {};
    for (const catId of selectedCategories) {
      const agentId = categoryAgentSelection[catId];
      if (agentId) specialtyAssignments[catId] = agentId;
    }

    const response = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, idea, agentAssignments: selectedAgents, specialtyAssignments }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? "회사 등록 중 문제가 발생했습니다."); setSubmitting(false); return; }
    router.push(`/goals/new?companyId=${data.company.id}`);
    router.refresh();
  }

  const BLUE = "rgba(139,92,246,0.8)";
  const SURFACE = "var(--surface-subtle, rgba(255,255,255,0.03))";
  const BORDER = "var(--border-strong, rgba(255,255,255,0.1))";

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* 스텝 인디케이터 */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {[1, 2].map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700,
              background: step === s ? BLUE : step > s ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)",
              color: step >= s ? "#fff" : "var(--text-faint)",
              border: step === s ? `2px solid ${BLUE}` : "2px solid transparent",
              transition: "all 0.2s",
            }}>{s}</div>
            <span style={{ fontSize: "13px", fontWeight: step === s ? 600 : 400, color: step === s ? "var(--text)" : "var(--text-faint)" }}>
              {s === 1 ? "회사 정보" : "팀 구성"}
            </span>
            {s < 2 && <span style={{ color: "var(--text-faint)", fontSize: "12px" }}>›</span>}
          </div>
        ))}
      </div>

      {/* ─── STEP 1 ─── */}
      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>회사 이름</label>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>대시보드와 실행 보드에서 그대로 표시됩니다.</p>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 노스스타 스튜디오" required />
            </div>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>사업 아이디어</label>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>에이전트가 브리프와 실행 계획을 만들 때 이 문맥을 사용합니다.</p>
              <textarea className="field min-h-32" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="예: 독립 컨설턴트를 위한 반복형 서비스 패키징 SaaS" required style={{ minHeight: "120px" }} />
            </div>
          </div>

          {/* 우측 미리보기 */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>미리보기</p>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>{name.trim() || "회사 이름"}</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>{idea.trim() || "사업 설명이 여기에 표시됩니다."}</p>
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <p style={{ fontSize: "11px", color: "var(--text-faint)" }}>다음 단계에서 에이전트 팀을 구성합니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2 ─── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* 섹션1: 코어 역할 (필수) */}
          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>코어 팀 구성</span>
                <span style={{ fontSize: "11px", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "4px", padding: "1px 7px", fontWeight: 600 }}>필수</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>워크플로우를 실행하는 3가지 핵심 역할입니다. 역할마다 에이전트 1명을 선택하세요.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              {coreRoles.map((role) => {
                const meta = coreRoleMeta[role];
                const agents = availableAgents[role] ?? [];
                return (
                  <div key={role} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px" }}>{meta.emoji}</span>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{meta.label}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{meta.description}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {agents.map((agent) => {
                        const selected = selectedAgents[role] === agent.id;
                        return (
                          <button
                            key={agent.id}
                            type="button"
                            onClick={() => setSelectedAgents((s) => ({ ...s, [role]: agent.id }))}
                            style={{
                              padding: "10px 12px", borderRadius: "10px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                              background: selected ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                              border: selected ? "1px solid rgba(139,92,246,0.5)" : `1px solid ${BORDER}`,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{agent.name}</span>
                              {selected && <span style={{ fontSize: "10px", fontWeight: 700, color: BLUE }}>✓ 선택됨</span>}
                            </div>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>{agent.headline}</p>
                            <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                              {agent.specialties.slice(0, 2).map((s) => (
                                <span key={s} style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "var(--text-faint)" }}>{s}</span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                      {agents.length === 0 && (
                        <p style={{ fontSize: "12px", color: "var(--text-faint)", padding: "8px", textAlign: "center" }}>채용 가능한 에이전트 없음</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 섹션2: 전문가 카테고리 (선택) */}
          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>전문가 추가 배정</span>
                <span style={{ fontSize: "11px", background: "rgba(139,92,246,0.12)", color: BLUE, border: "1px solid rgba(139,92,246,0.3)", borderRadius: "4px", padding: "1px 7px", fontWeight: 600 }}>선택</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>관심 있는 전문 분야를 선택하면 해당 에이전트가 팀에 추가됩니다.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {specialtyCategories.map((cat) => {
                const isOn = selectedCategories.has(cat.id);
                const agents = specialtyAgentMap[cat.id] ?? [];
                const selectedAgentId = categoryAgentSelection[cat.id] ?? agents[0]?.id ?? "";

                return (
                  <div key={cat.id} style={{
                    background: isOn ? "rgba(139,92,246,0.06)" : SURFACE,
                    border: isOn ? "1px solid rgba(139,92,246,0.35)" : `1px solid ${BORDER}`,
                    borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px",
                    transition: "all 0.2s",
                  }}>
                    {/* 카테고리 헤더 + 토글 */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>{cat.emoji}</span>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{cat.label}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>{cat.description}</p>
                        </div>
                      </div>
                      {/* 토글 스위치 */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        style={{
                          flexShrink: 0, width: "42px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
                          background: isOn ? BLUE : "rgba(255,255,255,0.1)",
                          position: "relative", transition: "background 0.2s",
                        }}
                        aria-pressed={isOn}
                        aria-label={`${cat.label} ${isOn ? "해제" : "추가"}`}
                      >
                        <span style={{
                          position: "absolute", top: "3px", left: isOn ? "21px" : "3px",
                          width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
                          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        }} />
                      </button>
                    </div>

                    {/* 카테고리 ON 시: 에이전트 선택 */}
                    {isOn && agents.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: `1px solid rgba(139,92,246,0.2)`, paddingTop: "10px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", marginBottom: "2px" }}>담당 에이전트 선택</p>
                        {agents.map((agent) => {
                          const sel = selectedAgentId === agent.id;
                          return (
                            <button
                              key={agent.id}
                              type="button"
                              onClick={() => selectCategoryAgent(cat.id, agent.id)}
                              style={{
                                padding: "8px 10px", borderRadius: "8px", textAlign: "left", cursor: "pointer",
                                background: sel ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                                border: sel ? "1px solid rgba(139,92,246,0.45)" : `1px solid ${BORDER}`,
                                transition: "all 0.15s",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{agent.name}</span>
                                {sel && <span style={{ fontSize: "10px", color: BLUE, fontWeight: 700 }}>✓</span>}
                              </div>
                              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{agent.role} · {agent.pricing}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {isOn && agents.length === 0 && (
                      <p style={{ fontSize: "12px", color: "var(--text-faint)", textAlign: "center", padding: "6px 0" }}>채용 가능한 에이전트 없음</p>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedCategories.size > 0 && (
              <div style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "10px", padding: "12px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                ✓ 전문가 <strong style={{ color: "var(--text)" }}>{selectedCategories.size}개 분야</strong> 추가됨 —
                등록 후 에이전트 채용 페이지에서 상세 관리할 수 있습니다.
              </div>
            )}
          </section>

          {/* 팀 요약 */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>구성된 팀 요약</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {selectedCorePreview.map((item) => (
                <div key={item.role} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "8px", padding: "6px 10px" }}>
                  <span style={{ fontSize: "14px" }}>{item.emoji}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{item.agentName}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>· {item.label}</span>
                </div>
              ))}
              {[...selectedCategories].map((catId) => {
                const cat = specialtyCategories.find((c) => c.id === catId);
                const agentId = categoryAgentSelection[catId];
                const agent = (specialtyAgentMap[catId] ?? []).find((a) => a.id === agentId);
                if (!cat || !agent) return null;
                return (
                  <div key={catId} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "6px 10px" }}>
                    <span style={{ fontSize: "14px" }}>{cat.emoji}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{agent.name}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>· {cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <p style={{ fontSize: "13px", color: "#ef4444", background: "rgba(239,68,68,0.08)", padding: "10px 14px", borderRadius: "8px" }}>{error}</p>
      )}

      {/* 하단 버튼 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${BORDER}`, paddingTop: "20px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          {step === 2 && (
            <Button variant="secondary" size="md" onClick={() => setStep(1)}>← 이전</Button>
          )}
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={submitting || (step === 1 ? !isStepOneComplete : !isStepTwoComplete)}
          >
            {step === 1
              ? "다음: 팀 구성 →"
              : submitting
                ? "등록 중..."
                : `팀 완성 · 회사 등록${selectedCategories.size > 0 ? ` (+${selectedCategories.size} 전문가)` : ""}`}
          </Button>
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-faint)" }}>
          {step === 1 ? "다음 단계에서 에이전트를 선택합니다." : "등록 후 목표 설정 화면으로 이어집니다."}
        </p>
      </div>
    </form>
  );
}
