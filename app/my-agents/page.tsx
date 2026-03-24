import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";
import { AgentManageCard } from "@/components/AgentManageCard";

export const dynamic = "force-dynamic";

export default async function MyAgentsPage() {
  const agents = await agentHiringRepository.listMyAgents();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <span className="page-eyebrow">내 에이전트</span>
          <h1 className="page-title">채용된 에이전트</h1>
          <p className="page-description">팀에 속한 모든 에이전트를 관리합니다. 기본 에이전트는 해제할 수 없습니다.</p>
        </div>
        <Link href="/agents"><Button variant="primary">에이전트 추가</Button></Link>
      </div>

      {agents.length === 0 ? (
        <EmptyState icon="🤖" title="채용된 에이전트가 없습니다" description="에이전트를 채용하여 팀을 구성하세요."
          primaryAction={{ href: "/agents", label: "에이전트 채용" }} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {agents.map((agent) => (
            <AgentManageCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
