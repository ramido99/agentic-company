import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";
import { AgentHireButton } from "@/components/AgentHireButton";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const catalog = await agentHiringRepository.listCatalog();
  const groups = [
    { title: "전략가", desc: "목표를 분석하고 방향을 제시합니다", agents: catalog.filter((a) => a.systemRole === "strategist") },
    { title: "실행 담당", desc: "계획과 체크리스트를 만듭니다", agents: catalog.filter((a) => a.systemRole === "operator") },
    { title: "검토자", desc: "결과물을 검토하고 품질을 보증합니다", agents: catalog.filter((a) => a.systemRole === "reviewer") },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <span className="page-eyebrow">에이전트 채용</span>
        <h1 className="page-title">에이전트 카탈로그</h1>
        <p className="page-description">필요한 역할의 에이전트를 채용하여 팀을 구성합니다.</p>
      </div>

      {groups.map((group) => group.agents.length > 0 && (
        <div key={group.title} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <p className="section-title">{group.title}</p>
            <p className="section-description">{group.desc}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {group.agents.map((agent) => (
              <div key={agent.id} className="agent-card card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                  <Badge variant="brand">{agent.role}</Badge>
                  {agent.featured && <Badge variant="success">추천</Badge>}
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{agent.name}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>{agent.headline}</p>
                </div>
                <div style={{ display: "flex", gap: "8px", paddingTop: "4px", alignItems: "center" }}>
                  <AgentHireButton agentId={agent.id} hired={agent.hired} />
                  <Link href={`/agents/${agent.id}`}><span style={{ fontSize: "13px", color: "var(--text-muted)", cursor: "pointer", textDecoration: "underline" }}>상세 보기</span></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
