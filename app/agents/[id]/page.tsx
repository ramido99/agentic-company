import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { AgentSkillToggle } from "@/components/AgentSkillToggle";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";
import { agentSkillRepository } from "@/lib/repositories/agent-skill-repository";
import { type AgentRoleType } from "@/lib/mock/skill-catalog";

export const dynamic = "force-dynamic";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params;

  const agent = await agentHiringRepository.findCatalogAgentById(id);

  if (!agent) {
    notFound();
  }

  // 이 에이전트 역할에 호환 가능한 스킬 목록 (배정 여부 포함)
  const compatibleSkills = await agentSkillRepository.listCompatibleSkillsForRole(
    id,
    agent.systemRole as AgentRoleType,
  );

  const analysisSkills = compatibleSkills.filter((s) => s.category === "분석" || s.category === "전략");
  const outputSkills = compatibleSkills.filter((s) => s.category === "출력");
  const operationSkills = compatibleSkills.filter((s) => s.category === "운영");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <PageHeader
          eyebrow="에이전트"
          title={agent.name}
          description={agent.headline}
        />
        <Link href="/agents">
          <Button variant="ghost" size="sm">
            ← 카탈로그
          </Button>
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Full description */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", marginBottom: "12px" }}>
              소개
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7 }}>
              {agent.fullDescription}
            </p>
          </div>

          {/* Role explanation */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", marginBottom: "12px" }}>
              역할
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7 }}>
              {agent.roleExplanation}
            </p>
          </div>

          {/* Specialties */}
          {agent.specialties.length > 0 && (
            <div className="card" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", marginBottom: "12px" }}>
                전문 분야
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {agent.specialties.map((specialty, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14px", color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--brand)", marginTop: "2px", flexShrink: 0 }}>•</span>
                    <span>{specialty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample outputs */}
          {agent.sampleOutputs.length > 0 && (
            <div className="card" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", marginBottom: "12px" }}>
                샘플 산출물
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {agent.sampleOutputs.map((output, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14px", color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--brand)", marginTop: "2px", flexShrink: 0 }}>•</span>
                    <span>{output}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── 스킬 배정 섹션 ─────────────────────────────── */}
          {compatibleSkills.length > 0 && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  스킬 배정
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  이 에이전트에 스킬을 배정하면 워크플로 실행 시 자동으로 적용됩니다.
                  출력 스킬은 결과물을 PPT·Excel·PDF로 자동 생성합니다.
                </p>
              </div>

              {(analysisSkills.length > 0 || operationSkills.length > 0) && (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
                    분석 / 전략 스킬
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[...analysisSkills, ...operationSkills].map((skill) => (
                      <AgentSkillToggle
                        key={skill.id}
                        agentId={id}
                        skillId={skill.id}
                        assigned={skill.assigned}
                        skillName={skill.name}
                        skillIcon={skill.icon}
                        isPremium={skill.isPremium}
                      />
                    ))}
                  </div>
                </div>
              )}

              {outputSkills.length > 0 && (
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>
                    출력 스킬 (파일 생성)
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {outputSkills.map((skill) => (
                      <AgentSkillToggle
                        key={skill.id}
                        agentId={id}
                        skillId={skill.id}
                        assigned={skill.assigned}
                        skillName={skill.name}
                        skillIcon={skill.icon}
                        isPremium={skill.isPremium}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Role badge */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ marginBottom: agent.featured ? "16px" : "0" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                역할
              </p>
              <Badge variant="brand">{agent.role}</Badge>
            </div>
            {agent.featured && (
              <div>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                  상태
                </p>
                <Badge variant="success">추천 에이전트</Badge>
              </div>
            )}
          </div>

          {/* Hire status */}
          <div className="card" style={{ padding: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              채용 상태
            </p>
            <Badge variant={agent.hired ? "success" : "neutral"}>
              {agent.hired ? "채용됨" : "미채용"}
            </Badge>
            {agent.hired && agent.active && (
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                {agent.assignedCompanyNames.length}개 회사에 배치됨
              </p>
            )}
          </div>

          {/* Active skills summary */}
          {compatibleSkills.filter((s) => s.assigned).length > 0 && (
            <div className="card" style={{ padding: "24px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                배정된 스킬
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {compatibleSkills
                  .filter((s) => s.assigned)
                  .map((skill) => (
                    <div key={skill.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                      <span>{skill.icon}</span>
                      <span>{skill.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          {agent.pricing && (
            <div className="card" style={{ padding: "24px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                가격
              </p>
              <p style={{ fontWeight: 600, color: "var(--text)" }}>
                {agent.pricing}
              </p>
            </div>
          )}

          {/* CTA */}
          <Button style={{ width: "100%" }} size="lg">
            {agent.hired ? "이미 채용됨" : "지금 채용"}
          </Button>
        </div>
      </div>
    </div>
  );
}
