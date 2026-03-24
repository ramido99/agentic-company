import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompanyForm } from "@/components/CompanyForm";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";
import { AgentRole } from "@/lib/types";

export const dynamic = "force-dynamic";

const roles: AgentRole[] = ["strategist", "operator", "reviewer"];

export default async function NewCompanyPage() {
  // 각 역할별 배정 가능한 에이전트 목록 로드
  const agentsByRole = await Promise.all(
    roles.map((role) => agentHiringRepository.listAssignableAgentsByRole(role)),
  );

  const availableAgents = Object.fromEntries(
    roles.map((role, i) => [role, agentsByRole[i]]),
  ) as Record<AgentRole, Awaited<ReturnType<typeof agentHiringRepository.listAssignableAgentsByRole>>>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <PageHeader
          eyebrow="회사"
          title="회사 등록"
          description="아이디어와 AI 인력 구성을 정의합니다."
        />
        <Link href="/companies">
          <Button variant="ghost" size="sm">← 회사 목록</Button>
        </Link>
      </div>

      <CompanyForm availableAgents={availableAgents} />
    </div>
  );
}
